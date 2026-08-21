import {
  clamp,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  inverseLerp,
  lerp,
  smootherstep,
  windowOpacity,
} from "./math";

export type Vec3 = [number, number, number];

export type JourneyFrame = {
  cameraPos: Vec3;
  lookAt: Vec3;
  fov: number;
  objectScale: number;
  objectYaw: number;
  objectPitch: number;
  diamondY: number;
  diamondScale: number;
  cutOpacity: number;
  roughOpacity: number;
  ringOpacity: number;
  ringExplode: number;
  prongClose: number;
  polish: number;
  glow: number;
  sweep: number;
  sparkle: number;
  guides: number;
  setGuides: number;
  fragments: number;
  lightRays: number;
  orbit: number;
  exposure: number;
  stageIndex: number;
};

type CameraKey = {
  t: number;
  pos: Vec3;
  look: Vec3;
  fov: number;
};

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, pos: [0.0, 0.18, 3.85], look: [0, 0.16, 0], fov: 32 },
  { t: 0.07, pos: [0.0, 0.18, 3.8], look: [0, 0.16, 0], fov: 32 },
  { t: 0.16, pos: [0.06, 0.86, 1.48], look: [0, 0.86, 0], fov: 26 },
  { t: 0.24, pos: [0.38, 0.82, 1.72], look: [0, 0.8, 0], fov: 28 },
  { t: 0.32, pos: [0.04, 0.8, 1.95], look: [0, 0.78, 0], fov: 29 },
  { t: 0.44, pos: [0.1, 0.8, 1.82], look: [0, 0.78, 0], fov: 28 },
  { t: 0.56, pos: [0.0, 0.82, 1.32], look: [0, 0.82, 0], fov: 24 },
  { t: 0.66, pos: [0.16, 0.55, 2.7], look: [0, 0.42, 0], fov: 30 },
  { t: 0.78, pos: [0.06, 0.22, 3.35], look: [0, 0.2, 0], fov: 31 },
  { t: 0.9, pos: [0.0, 0.18, 3.9], look: [0, 0.16, 0], fov: 31 },
  { t: 1.0, pos: [0.0, 0.18, 3.95], look: [0, 0.16, 0], fov: 31 },
];

function sampleCamera(p: number) {
  const t = clamp(p);
  let i = 0;
  while (i < CAMERA_KEYS.length - 1 && CAMERA_KEYS[i + 1].t < t) i += 1;
  const a = CAMERA_KEYS[i];
  const b = CAMERA_KEYS[Math.min(i + 1, CAMERA_KEYS.length - 1)];
  const u = smootherstep(a.t, b.t, t);
  return {
    pos: [
      lerp(a.pos[0], b.pos[0], u),
      lerp(a.pos[1], b.pos[1], u),
      lerp(a.pos[2], b.pos[2], u),
    ] as Vec3,
    look: [
      lerp(a.look[0], b.look[0], u),
      lerp(a.look[1], b.look[1], u),
      lerp(a.look[2], b.look[2], u),
    ] as Vec3,
    fov: lerp(a.fov, b.fov, u),
  };
}

export const STAGES = [
  { id: "rough", index: 1, label: "ROUGH" },
  { id: "cut", index: 2, label: "CUT" },
  { id: "polish", index: 3, label: "POLISH" },
  { id: "set", index: 4, label: "SET" },
  { id: "final", index: 5, label: "FINAL" },
] as const;

export function getStageIndex(p: number) {
  if (p < 0.33) return 0;
  if (p < 0.5) return 1;
  if (p < 0.64) return 2;
  if (p < 0.8) return 3;
  return 4;
}

export function getJourney(p: number): JourneyFrame {
  const t = clamp(p);
  const cam = sampleCamera(t);

  const toRough = smootherstep(0.12, 0.22, t);
  const holdRough = windowOpacity(t, 0.18, 0.22, 0.3, 0.38);
  const cutReveal = smootherstep(0.36, 0.48, t);
  const polishAmt = smootherstep(0.5, 0.62, t);
  const finale = smootherstep(0.8, 0.92, t);

  const cutOpacity = lerp(1, 0, toRough) * (1 - cutReveal) + cutReveal;
  const roughOpacity = toRough * (1 - cutReveal);

  const ringFadeOut = 1 - smootherstep(0.08, 0.16, t);
  const ringFadeIn = smootherstep(0.64, 0.74, t);
  const ringOpacity = Math.max(ringFadeOut, ringFadeIn);

  const ringExplode = t < 0.4 ? 1 : easeOutBack(clamp(inverseLerp(0.66, 0.78, t)));
  const prongClose =
    t < 0.4 ? 1 : easeOutCubic(clamp(inverseLerp(0.72, 0.82, t)));

  const seatedY = 0.26;
  const raisedY = 0.78;
  const diamondY =
    t < 0.6 ? seatedY : lerp(raisedY, seatedY, easeInOutCubic(inverseLerp(0.64, 0.76, t)));

  const polish =
    t < 0.18
      ? 1
      : t < 0.5
        ? lerp(1, 0.12, toRough)
        : lerp(0.18, 1, polishAmt);

  const orbit = holdRough * Math.PI * 0.85;
  const objectYaw =
    t * Math.PI * 1.15 + orbit * 0.4 + (t > 0.85 ? (t - 0.85) * 1.2 : 0);
  const objectPitch = Math.sin(t * Math.PI * 2) * 0.035;

  const fragments = windowOpacity(t, 0.38, 0.42, 0.5, 0.58);
  const guides = windowOpacity(t, 0.3, 0.35, 0.46, 0.52);
  const setGuides = windowOpacity(t, 0.66, 0.7, 0.78, 0.84);
  const lightRays = windowOpacity(t, 0.18, 0.24, 0.32, 0.4);
  const sweep = t < 0.5 ? 0 : t < 0.8 ? polishAmt : lerp(0.4, 1, finale);
  const sparkle = Math.max(
    lerp(0.35, 1, polish),
    finale,
    (1 - toRough) * 0.55
  );
  const glow = lerp(0.45, 1, Math.max(polish, finale * 0.5));

  const objectScale = lerp(1, 1.06, windowOpacity(t, 0.52, 0.56, 0.6, 0.66));
  const diamondScale = lerp(1, 1.1, windowOpacity(t, 0.52, 0.57, 0.6, 0.66));

  return {
    cameraPos: cam.pos,
    lookAt: cam.look,
    fov: cam.fov,
    objectScale,
    objectYaw,
    objectPitch,
    diamondY,
    diamondScale,
    cutOpacity: clamp(cutOpacity),
    roughOpacity: clamp(roughOpacity),
    ringOpacity: clamp(ringOpacity),
    ringExplode: clamp(ringExplode),
    prongClose: clamp(prongClose),
    polish: clamp(polish),
    glow: clamp(glow),
    sweep: clamp(sweep),
    sparkle: clamp(sparkle),
    guides: clamp(guides),
    setGuides: clamp(setGuides),
    fragments: clamp(fragments),
    lightRays: clamp(lightRays),
    orbit,
    exposure: lerp(1.0, 1.12, polishAmt * 0.6 + finale * 0.4),
    stageIndex: getStageIndex(t),
  };
}

export const COPY_WINDOWS = {
  hero: { inA: 0, inB: 0.02, outA: 0.08, outB: 0.13 },
  rough: { inA: 0.18, inB: 0.22, outA: 0.3, outB: 0.35 },
  cut: { inA: 0.36, inB: 0.4, outA: 0.48, outB: 0.52 },
  polish: { inA: 0.5, inB: 0.54, outA: 0.61, outB: 0.65 },
  set: { inA: 0.66, inB: 0.7, outA: 0.78, outB: 0.82 },
  finale: { inA: 0.84, inB: 0.9, outA: 1.05, outB: 1.1 },
  cta: { inA: 0.9, inB: 0.95, outA: 1.05, outB: 1.1 },
  scrollHint: { inA: 0, inB: 0.02, outA: 0.07, outB: 0.11 },
} as const;

export function copyOpacity(p: number, key: keyof typeof COPY_WINDOWS) {
  const w = COPY_WINDOWS[key];
  return windowOpacity(p, w.inA, w.inB, w.outA, w.outB);
}

export const BAND_RADIUS = 0.52;
export const HEAD_Y = BAND_RADIUS;
