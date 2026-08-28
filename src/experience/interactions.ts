import { gsap } from "gsap";
import * as THREE from "three";
import { soundscape } from "../audio/soundscape";
import { CRYSTALS, type CrystalDef, type CrystalId } from "./crystals";
import { sim } from "./sim";
import { useExperience } from "./store";

function uvForSide(side: -1 | 1) {
  return side < 0 ? new THREE.Vector2(0.40, 0.30) : new THREE.Vector2(0.54, 0.29);
}

function worldForSide(side: -1 | 1, viewport: { width: number; height: number }) {
  const uv = uvForSide(side);
  return new THREE.Vector3(
    (uv.x - 0.5) * viewport.width,
    (uv.y - 0.5) * viewport.height,
    0.14,
  );
}

export function activateCrystal(
  id: CrystalId,
  viewport: { width: number; height: number },
) {
  if (sim.busy) return;
  const def = CRYSTALS.find((c) => c.id === id);
  if (!def) return;

  sim.busy = true;
  const store = useExperience.getState();
  store.setActive(id);
  store.setPhase("reaching");
  store.dismissInstruction();

  const idx = CRYSTALS.findIndex((c) => c.id === id);
  const target = sim.crystalWorld[idx]?.clone() ?? new THREE.Vector3();
  const side: -1 | 1 = target.x < 0 ? -1 : 1;
  sim.reachSide = side;
  sim.reachFrom.copy(worldForSide(side, viewport));
  sim.reachTo.copy(target);
  sim.spreadUv.copy(uvForSide(side));

  sim.fromColor.copy(sim.toColor);
  sim.fromAmount = sim.toAmount;
  sim.toColor.set(def.tint);
  sim.toAmount = 0.86;
  sim.transition = 0;
  sim.lookTarget.set(THREE.MathUtils.clamp(target.x * 0.55, -0.85, 0.85), THREE.MathUtils.clamp(target.y * 0.5, -0.55, 0.55));

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

  tl.to(sim, {
    cameraZoom: 1,
    duration: 1.15,
    ease: "power2.out",
  }, 0);

  tl.to(sim, {
    reach: 1,
    duration: 1.15,
    ease: "power2.inOut",
  }, 0.05);

  tl.add(() => {
    sim.pulse = 1;
    sim.energy = 1;
    useExperience.getState().setPhase("transforming");
    useExperience.getState().setColorName(def.name);
    soundscape.transform(def.gem);
  }, 1.12);

  tl.to(sim, {
    transition: 1,
    duration: 1.65,
    ease: "power2.inOut",
  }, 1.12);

  tl.to(sim, {
    pulse: 0,
    duration: 0.55,
    ease: "power2.out",
  }, 1.2);

  tl.to(sim, {
    reach: 0,
    duration: 0.95,
    ease: "power2.inOut",
  }, 1.55);

  tl.to(sim, {
    energy: 0,
    duration: 0.7,
    ease: "power1.out",
  }, 2.4);

  tl.to(sim, {
    cameraZoom: 0,
    duration: 1.1,
    ease: "power2.inOut",
  }, 2.35);

  tl.add(() => {
    soundscape.resolve();
  }, 2.55);
}

export function crystalById(id: CrystalId): CrystalDef | undefined {
  return CRYSTALS.find((c) => c.id === id);
}
