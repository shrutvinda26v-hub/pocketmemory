export type HenPose = {
  lookX: number;
  lookY: number;
  headTilt: number;
  headTurn: number;
  leanX: number;
  leanY: number;
  browL: number;
  browR: number;
  eyeOpenL: number;
  eyeOpenR: number;
  eyeWiden: number;
  squint: number;
  beak: number;
  smile: number;
  puff: number;
  breathe: number;
  wingL: number;
  wingR: number;
  wingCover: number;
  neck: number;
  blush: number;
  happy: number;
  bounce: number;
  freeze: number;
  sparkle: number;
};

export function defaultPose(): HenPose {
  return {
    lookX: 0,
    lookY: 0,
    headTilt: 0,
    headTurn: 0,
    leanX: 0,
    leanY: 0,
    browL: 0,
    browR: 0,
    eyeOpenL: 1,
    eyeOpenR: 1,
    eyeWiden: 0,
    squint: 0,
    beak: 0.08,
    smile: 0.15,
    puff: 0,
    breathe: 0,
    wingL: 0,
    wingR: 0,
    wingCover: 0,
    neck: 0,
    blush: 0,
    happy: 0,
    bounce: 0,
    freeze: 0,
    sparkle: 0,
  };
}

export function asleepPose(): HenPose {
  const p = defaultPose();
  p.eyeOpenL = 0;
  p.eyeOpenR = 0;
  p.headTurn = -0.95;
  p.leanY = 16;
  p.wingCover = 0.55;
  p.beak = 0.2;
  p.smile = 0;
  p.browL = -0.2;
  p.browR = -0.2;
  p.freeze = 1;
  return p;
}

export function overlayPose(base: HenPose, extra: Partial<HenPose>) {
  Object.assign(base, extra);
}

export function lerpPose(current: HenPose, target: HenPose, eyeT: number, bodyT: number) {
  const snap = target.freeze > 0.7 ? 0.55 : bodyT;
  current.lookX += (target.lookX - current.lookX) * eyeT;
  current.lookY += (target.lookY - current.lookY) * eyeT;
  current.eyeOpenL += (target.eyeOpenL - current.eyeOpenL) * 0.42;
  current.eyeOpenR += (target.eyeOpenR - current.eyeOpenR) * 0.42;
  current.browL += (target.browL - current.browL) * snap;
  current.browR += (target.browR - current.browR) * snap;
  current.headTilt += (target.headTilt - current.headTilt) * snap;
  current.headTurn += (target.headTurn - current.headTurn) * 0.22;
  current.leanX += (target.leanX - current.leanX) * snap;
  current.leanY += (target.leanY - current.leanY) * snap;
  current.eyeWiden += (target.eyeWiden - current.eyeWiden) * snap;
  current.squint += (target.squint - current.squint) * snap;
  current.beak += (target.beak - current.beak) * 0.38;
  current.smile += (target.smile - current.smile) * 0.18;
  current.puff += (target.puff - current.puff) * bodyT;
  current.breathe += (target.breathe - current.breathe) * 0.08;
  current.wingL += (target.wingL - current.wingL) * 0.18;
  current.wingR += (target.wingR - current.wingR) * 0.18;
  current.wingCover += (target.wingCover - current.wingCover) * 0.2;
  current.neck += (target.neck - current.neck) * 0.16;
  current.blush += (target.blush - current.blush) * 0.14;
  current.happy += (target.happy - current.happy) * 0.16;
  current.bounce += (target.bounce - current.bounce) * 0.2;
  current.freeze += (target.freeze - current.freeze) * 0.35;
  current.sparkle += (target.sparkle - current.sparkle) * 0.2;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function clamp1(n: number) {
  return clamp(n, -1, 1);
}

export function clamp01(n: number) {
  return clamp(n, 0, 1);
}
