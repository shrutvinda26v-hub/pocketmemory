import { gsap } from "gsap";
import * as THREE from "three";
import { soundscape } from "../audio/soundscape";
import { CRYSTALS, type CrystalDef, type CrystalId } from "./crystals";
import { sim } from "./sim";
import { useExperience } from "./store";

let activeTl: gsap.core.Timeline | null = null;

function uvForSide(side: -1 | 1) {
  return side < 0 ? new THREE.Vector2(0.40, 0.30) : new THREE.Vector2(0.54, 0.29);
}

function worldForSide(side: -1 | 1) {
  const uv = uvForSide(side);
  return new THREE.Vector3(
    (uv.x - 0.5) * sim.planeWidth,
    (uv.y - 0.5) * sim.planeHeight,
    0.16,
  );
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
  sim.reachSide = side;
  sim.reachFrom.copy(worldForSide(side));
  sim.reachTo.copy(target);
  sim.spreadUv.copy(uvForSide(side));

  sim.fromColor.copy(sim.toColor);
  sim.fromAmount = sim.toAmount;
  sim.toColor.set(def.tint);
  sim.toAmount = 0.86;
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

  tl.to(sim, { cameraZoom: 1, duration: 1.05, ease: "power2.out" }, 0);
  tl.to(sim, { reach: 1, duration: 1.05, ease: "power2.inOut" }, 0.04);

  tl.add(() => {
    sim.pulse = 1;
    sim.energy = 1;
    useExperience.getState().setPhase("transforming");
    soundscape.transform(def.gem);
  }, 1.0);

  tl.to(sim, { transition: 1, duration: 1.55, ease: "power2.inOut" }, 1.0);
  tl.to(sim, { pulse: 0, duration: 0.5, ease: "power2.out" }, 1.08);
  tl.to(sim, { reach: 0, duration: 0.85, ease: "power2.inOut" }, 1.45);
  tl.to(sim, { energy: 0, duration: 0.65, ease: "power1.out" }, 2.2);
  tl.to(sim, { cameraZoom: 0, duration: 1.0, ease: "power2.inOut" }, 2.15);
  tl.add(() => soundscape.resolve(), 2.35);
  tl.add(() => {
    sim.busy = false;
  }, 1.9);
}

export function crystalById(id: CrystalId): CrystalDef | undefined {
  return CRYSTALS.find((c) => c.id === id);
}
