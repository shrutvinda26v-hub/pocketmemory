import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "../experience/sim";
import { makeCircleSprite } from "../lib/textures";

export function Atmosphere() {
  const { viewport } = useThree();
  const count = 90;
  const tex = useMemo(() => makeCircleSprite("#fff6e8"), []);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * viewport.width * 1.2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 1.2;
      arr[i * 3 + 2] = Math.random() * 1.1 - 0.2;
    }
    return arr;
  }, [viewport.width, viewport.height]);
  const speeds = useMemo(() => Float32Array.from({ length: count }, () => 0.015 + Math.random() * 0.04), []);
  const points = useRef<THREE.Points>(null);

  useFrame((_, dt) => {
    const geo = points.current?.geometry;
    const pos = geo?.attributes.position;
    if (!pos) return;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + speeds[i] * dt * 0.25;
      let x = pos.getX(i) + Math.sin(y * 2 + i) * dt * 0.02;
      if (y > viewport.height * 0.62) y = -viewport.height * 0.62;
      pos.setXY(i, x, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        color="#f3e4cc"
        size={0.045}
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function CrystalSpores({ index, color }: { index: number; color: string }) {
  const count = 18;
  const tex = useMemo(() => makeCircleSprite("#ffffff"), []);
  const col = useMemo(() => new THREE.Color(color), [color]);
  const ref = useRef<THREE.Points>(null);
  const offsets = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        r: 0.05 + Math.random() * 0.12,
        a: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2,
        y: (Math.random() - 0.5) * 0.1,
      })),
    [],
  );
  const positions = useMemo(() => new Float32Array(count * 3), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const glow = sim.crystalGlow[index];
    const origin = sim.crystalWorld[index];
    for (let i = 0; i < count; i++) {
      const o = offsets[i];
      const a = o.a + t * o.s * (0.4 + glow);
      const r = o.r * (1 + glow * 0.5);
      positions[i * 3] = origin.x + Math.cos(a) * r;
      positions[i * 3 + 1] = origin.y + o.y + Math.sin(t * 0.6 + i) * 0.02;
      positions[i * 3 + 2] = origin.z + Math.sin(a) * r;
    }
    const attr = ref.current?.geometry.attributes.position;
    if (attr) {
      attr.needsUpdate = true;
    }
    const mat = ref.current?.material as THREE.PointsMaterial | undefined;
    if (mat) mat.opacity = 0.15 + glow * 0.55;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        color={col}
        size={0.035}
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function EnergyStream() {
  const count = 40;
  const tex = useMemo(() => makeCircleSprite("#ffffff"), []);
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const ref = useRef<THREE.Points>(null);
  const color = useMemo(() => new THREE.Color("#ffffff"), []);

  useFrame((state) => {
    const mat = ref.current?.material as THREE.PointsMaterial | undefined;
    const visible = sim.energy > 0.02;
    if (ref.current) ref.current.visible = visible;
    if (!visible || !mat) return;
    const t = state.clock.elapsedTime;
    color.copy(sim.toColor);
    mat.color.copy(color);
    mat.opacity = sim.energy * 0.75;
    const from = sim.reachTo;
    const to = sim.reachFrom;
    for (let i = 0; i < count; i++) {
      const u = (i / count + t * 0.35) % 1;
      const curl = Math.sin(u * 8 + t * 3) * 0.04 * (1 - Math.abs(u - 0.5) * 2);
      positions[i * 3] = THREE.MathUtils.lerp(from.x, to.x, u) + curl;
      positions[i * 3 + 1] = THREE.MathUtils.lerp(from.y, to.y, u) + Math.cos(u * 6 + t * 2) * 0.03;
      positions[i * 3 + 2] = THREE.MathUtils.lerp(from.z, to.z, u) + 0.04;
    }
    const attr = ref.current?.geometry.attributes.position;
    if (attr) attr.needsUpdate = true;
  });

  return (
    <points ref={ref} visible={false} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.04}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function CursorGlow() {
  const sprite = useRef<THREE.Sprite>(null);
  const tex = useMemo(() => makeCircleSprite("#ffffff"), []);

  useFrame(() => {
    const s = sprite.current;
    if (!s) return;
    s.position.lerp(sim.pointerWorld, 0.18);
    const glow = Math.max(...sim.crystalGlow);
    const near = THREE.MathUtils.clamp((glow - 0.3) * 1.2, 0, 1);
    s.scale.setScalar(0.12 + near * 0.28);
    const mat = s.material as THREE.SpriteMaterial;
    mat.opacity = near * 0.45;
  });

  return (
    <sprite ref={sprite} position={[0, 0, 0.55]} scale={0.15}>
      <spriteMaterial
        map={tex}
        color="#fff6e0"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}
