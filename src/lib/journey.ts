import {
  clamp,
  lerp,
  smootherstep,
  windowOpacity,
} from "./math";

export type Vec3 = [number, number, number];

export type JourneyFrame = {
  cameraPos: Vec3;
  lookAt: Vec3;
  fov: number;
  spinY: number;
  explode: number;
  boxReveal: number;
  lidClose: number;
  ringLift: number;
  ringScale: number;
  glow: number;
  axis: number;
  stageIndex: number;
};

export const STAGES = [
  { id: "reveal", index: 1, label: "REVEAL" },
  { id: "anatomy", index: 2, label: "ANATOMY" },
  { id: "assemble", index: 3, label: "ASSEMBLE" },
  { id: "encase", index: 4, label: "ENCASE" },
  { id: "seal", index: 5, label: "SEAL" },
] as const;

export function getStageIndex(p: number) {
  if (p < 0.2) return 0;
  if (p < 0.48) return 1;
  if (p < 0.68) return 2;
  if (p < 0.84) return 3;
  return 4;
}

export function getJourney(p: number, intro = 1): JourneyFrame {
  const t = clamp(p);
  const explodeIn = smootherstep(0.16, 0.36, t);
  const explodeOut = 1 - smootherstep(0.52, 0.68, t);
  const explode = explodeIn * explodeOut;
  const boxReveal = smootherstep(0.66, 0.8, t);
  const lidClose = smootherstep(0.84, 0.97, t);

  const spinY = intro * 0.35 + t * Math.PI * 2.15;

  const ringLift = lerp(0, -0.22, boxReveal) + lerp(0, -0.06, lidClose);
  const ringScale = lerp(1, 0.72, boxReveal);

  return {
    cameraPos: [
      lerp(0, 0.15, explode) + lerp(0, 0.35, boxReveal),
      lerp(0.35, 0.55, explode) + lerp(0, 0.55, boxReveal) + lerp(0, 0.2, lidClose),
      lerp(4.6, 5.4, explode) + lerp(0, 0.4, boxReveal),
    ],
    lookAt: [0, lerp(0.12, 0.2, explode) + lerp(0, -0.15, boxReveal), 0],
    fov: lerp(32, 36, boxReveal),
    spinY,
    explode,
    boxReveal,
    lidClose,
    ringLift,
    ringScale,
    glow: lerp(0.55, 1, intro) * lerp(1, 0.7, lidClose),
    axis: explode,
    stageIndex: getStageIndex(t),
  };
}

export const COPY_WINDOWS = {
  hero: { inA: 0, inB: 0.02, outA: 0.12, outB: 0.18 },
  anatomy: { inA: 0.2, inB: 0.26, outA: 0.46, outB: 0.52 },
  assemble: { inA: 0.54, inB: 0.6, outA: 0.68, outB: 0.74 },
  encase: { inA: 0.72, inB: 0.78, outA: 0.84, outB: 0.89 },
  seal: { inA: 0.88, inB: 0.93, outA: 1.05, outB: 1.1 },
  cta: { inA: 0.92, inB: 0.96, outA: 1.05, outB: 1.1 },
  scrollHint: { inA: 0, inB: 0.02, outA: 0.1, outB: 0.16 },
} as const;

export function copyOpacity(p: number, key: keyof typeof COPY_WINDOWS) {
  const w = COPY_WINDOWS[key];
  return windowOpacity(p, w.inA, w.inB, w.outA, w.outB);
}
