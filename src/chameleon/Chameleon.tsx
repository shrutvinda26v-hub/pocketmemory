import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { soundscape } from "../audio/soundscape";
import { CRYSTALS } from "../experience/crystals";
import { sim } from "../experience/sim";
import { useExperience } from "../experience/store";
import { chameleonFragment, chameleonVertex } from "./chameleonShaders";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function Chameleon() {
  const { viewport, pointer, clock } = useThree();
  const map = useTexture("/chameleon.jpg");
  const depth = useTexture("/depth.png");
  const mask = useTexture("/body-mask.png");
  const material = useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.anisotropy = 8;
    depth.minFilter = THREE.LinearFilter;
    mask.minFilter = THREE.LinearFilter;
    const mat = new THREE.ShaderMaterial({
      toneMapped: false,
      uniforms: {
        tMap: { value: map },
        tDepth: { value: depth },
        tMask: { value: mask },
        uTime: { value: 0 },
        uLook: { value: new THREE.Vector2() },
        uBlink: { value: 0 },
        uBreathe: { value: 0 },
        uTail: { value: 0 },
        uWeight: { value: 0 },
        uHead: { value: new THREE.Vector2() },
        uTransition: { value: 1 },
        uFromAmount: { value: 0 },
        uToAmount: { value: 0 },
        uFromColor: { value: new THREE.Color("#ffffff") },
        uToColor: { value: new THREE.Color("#5ec4b6") },
        uSpreadUv: { value: new THREE.Vector2(0.46, 0.28) },
        uPulse: { value: 0 },
        uEnergy: { value: 0 },
        uCrystalPos: { value: sim.crystalWorld },
        uCrystalCol: {
          value: CRYSTALS.map((c) => new THREE.Color(c.gem)),
        },
        uCrystalGlow: { value: sim.crystalGlow },
      },
      vertexShader: chameleonVertex,
      fragmentShader: chameleonFragment,
    });
    return mat;
  }, [map, depth, mask]);

  const blink = useRef({
    next: 1.8 + Math.random() * 2,
    value: 0,
    closing: 0,
    double: false,
  });
  const wander = useRef({
    next: 2,
    target: new THREE.Vector2(),
  });
  const lastPointer = useRef(new THREE.Vector2());
  const pointerStill = useRef(0);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame((_, dt) => {
    const t = clock.elapsedTime;
    const u = material.uniforms;
    u.uTime.value = t;

    const px = pointer.x;
    const py = pointer.y;
    sim.pointerNdc.set(px, py);
    sim.pointerWorld.set((px * viewport.width) / 2, (py * viewport.height) / 2, 0.4);

    const moved = lastPointer.current.distanceTo(sim.pointerNdc) > 0.002;
    lastPointer.current.copy(sim.pointerNdc);
    pointerStill.current = moved ? 0 : pointerStill.current + dt;

    let closest: { i: number; d: number } | null = null;
    for (let i = 0; i < CRYSTALS.length; i++) {
      const c = sim.crystalWorld[i];
      const ndcX = (c.x / viewport.width) * 2;
      const ndcY = (c.y / viewport.height) * 2;
      const d = Math.hypot(ndcX - px, ndcY - py);
      if (!closest || d < closest.d) closest = { i, d };
      const reveal = THREE.MathUtils.smoothstep(d, 0.55, 0.18);
      const hover = THREE.MathUtils.smoothstep(d, 0.16, 0.05);
      const baseGlow = useExperience.getState().isCoarse ? 0.42 : 0.2;
      const targetGlow = baseGlow + reveal * 0.55 + hover * 1.4 + (sim.busy && useExperience.getState().activeId === CRYSTALS[i].id ? 1.2 : 0);
      sim.crystalGlow[i] = lerp(sim.crystalGlow[i], targetGlow, 1 - Math.exp(-6 * dt));
    }

    const coarse = useExperience.getState().isCoarse;
    const hoverThreshold = coarse ? 0.12 : 0.14;
    const hovered = !sim.busy && closest && closest.d < hoverThreshold ? CRYSTALS[closest.i].id : null;
    if (hovered !== sim.hoveredId) {
      sim.hoveredId = hovered;
      useExperience.getState().setHovered(hovered);
      useExperience.getState().setPhase(hovered ? "noticing" : "idle");
    }
    if (hovered && closest) {
      soundscape.hover(CRYSTALS[closest.i].gem, sim.crystalGlow[closest.i]);
    } else {
      soundscape.hover("#ffffff", 0);
    }

    const breathe = Math.sin(t * 0.55) * 0.5 + Math.sin(t * 0.23) * 0.5;
    sim.breathe = lerp(sim.breathe, breathe, 0.04);
    sim.tail = lerp(sim.tail, Math.sin(t * 0.4) * 0.6 + Math.sin(t * 0.17) * 0.4, 0.03);
    sim.weight = lerp(sim.weight, Math.sin(t * 0.21) * 0.7, 0.02);

    const b = blink.current;
    b.next -= dt;
    if (b.next <= 0 && b.closing === 0) {
      b.closing = 1;
      b.double = Math.random() < 0.22;
    }
    if (b.closing === 1) {
      b.value = lerp(b.value, 1, 1 - Math.pow(0.00001, dt));
      if (b.value > 0.92) b.closing = 2;
    } else if (b.closing === 2) {
      b.value = lerp(b.value, 0, 1 - Math.pow(0.0001, dt));
      if (b.value < 0.04) {
        b.value = 0;
        if (b.double) {
          b.double = false;
          b.closing = 1;
        } else {
          b.closing = 0;
          b.next = 3 + Math.random() * 4.2;
        }
      }
    }
    sim.blink = b.value;

    if (t > wander.current.next) {
      wander.current.target.set((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.4);
      wander.current.next = t + 2.2 + Math.random() * 3.5;
    }

    if (sim.busy || hovered) {
      const target = hovered
        ? sim.crystalWorld[CRYSTALS.findIndex((c) => c.id === hovered)]
        : sim.reachTo;
      sim.lookTarget.set(
        THREE.MathUtils.clamp(target.x * 0.62, -0.9, 0.9),
        THREE.MathUtils.clamp(target.y * 0.55, -0.55, 0.55),
      );
    } else if (pointerStill.current < 0.45) {
      sim.lookTarget.set(THREE.MathUtils.clamp(px * 0.75, -0.85, 0.85), THREE.MathUtils.clamp(py * 0.5, -0.5, 0.5));
    } else {
      sim.lookTarget.lerp(wander.current.target, 0.02);
    }

    sim.look.lerp(sim.lookTarget, 1 - Math.exp(-4.2 * dt));
    sim.head.lerp(sim.lookTarget, 1 - Math.exp(-1.6 * dt));

    u.uLook.value.copy(sim.look);
    u.uBlink.value = sim.blink;
    u.uBreathe.value = sim.breathe;
    u.uTail.value = sim.tail;
    u.uWeight.value = sim.weight;
    u.uHead.value.copy(sim.head);
    u.uTransition.value = sim.transition;
    u.uFromAmount.value = sim.fromAmount;
    u.uToAmount.value = sim.toAmount;
    u.uFromColor.value.copy(sim.fromColor);
    u.uToColor.value.copy(sim.toColor);
    u.uSpreadUv.value.copy(sim.spreadUv);
    u.uPulse.value = sim.pulse;
    u.uEnergy.value = sim.energy;
  });

  const w = viewport.width * 1.04;
  const h = viewport.height * 1.04;

  return (
    <mesh position={[0, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[w, h, 140, 80]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
