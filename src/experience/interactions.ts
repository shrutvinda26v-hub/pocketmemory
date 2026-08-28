import { gsap } from "gsap";
import * as THREE from "three";
import { soundscape } from "../audio/soundscape";
import { CRYSTALS, type CrystalDef, type CrystalId } from "./crystals";
import { sim } from "./sim";
import { useExperience } from "./store";

let activeTl: gsap.core.Timeline | null = null;

function uvForSide(side: -1 | 1, high: boolean) {
  if (high) {
    return side < 0 ? new THREE.Vector2(0.38, 0.5) : new THREE.Vector2(0.56, 0.5);
  }
  return side < 0 ? new THREE.Vector2(0.4, 0.3) : new THREE.Vector2(0.54, 0.29);
}

function worldForUv(uv: THREE.Vector2, z = 0.12) {
  return new THREE.Vector3((uv.x - 0.5) * sim.planeWidth, (uv.y - 0.5) * sim.planeHeight, z);
}

export function activateCrystal(id: CrystalId) {
  if (sim.busy && sim.reach > 0.35) return;
  const def = CRYSTALS.find((c) => c.id === id);
  if (!def) return;

  activeTl?.kill();
  sim.busy = true;
  const store = useExperience.getState();
  store.setColorName(def.name);
  store.setActive(id);
  store.setPhase("reaching");
  store.dismissInstruction();

  const idx = CRYSTALS.findIndex((c) => c.id === id);
  const target = sim.crystalWorld[idx]?.clone() ?? new THREE.Vector3();
  const side: -1 | 1 = target.x < 0 ? -1 : 1;
  const high = target.y > 0.04;
  const uv = uvForSide(side, high);
  sim.reachSide = side;
  sim.reachFrom.copy(worldForUv(uv));
  sim.reachTo.copy(target);
  sim.spreadUv.copy(uv);

  sim.fromColor.copy(sim.toColor);
  sim.fromAmount = sim.toAmount;
  sim.toColor.set(def.tint);
  sim.toAmount = 0.82;
  sim.transition = 0;
  sim.lookTarget.set(
    THREE.MathUtils.clamp(target.x * 0.55, -0.85, 0.85),
    THREE.MathUtils.clamp(target.y * 0.5, -0.55, 0.55),
  );

  soundscape.chime(def.gem);

  const tl = gsap.timeline({
    onComplete: () => {
      sim.busy = false;
      sim.energy = 0;
      sim.pulse = 0;
      sim.reach = 0;
      useExperience.getState().setPhase("idle");
      useExperience.getState().setActive(null);
    },
  });
  activeTl = tl;

  tl.to(sim, { cameraZoom: 1, duration: 0.9, ease: "power2.out" }, 0);
  tl.to(sim, { reach: 1, duration: 1.15, ease: "power3.inOut" }, 0.02);

  tl.add(() => {
    sim.pulse = 1;
    sim.energy = 1;
    useExperience.getState().setPhase("transforming");
    soundscape.transform(def.gem);
  }, 1.12);

  tl.to(sim, { transition: 1, duration: 1.5, ease: "power2.inOut" }, 1.12);
  tl.to(sim, { pulse: 0, duration: 0.4, ease: "power2.out" }, 1.2);
  tl.to(sim, { reach: 0, duration: 0.9, ease: "power2.inOut" }, 1.55);
  tl.to(sim, { energy: 0, duration: 0.55, ease: "power1.out" }, 2.2);
  tl.to(sim, { cameraZoom: 0, duration: 0.95, ease: "power2.inOut" }, 2.15);
  tl.add(() => soundscape.resolve(), 2.35);
  tl.add(() => {
    sim.busy = false;
  }, 1.95);
}

export function crystalById(id: CrystalId): CrystalDef | undefined {
  return CRYSTALS.find((c) => c.id === id);
}
