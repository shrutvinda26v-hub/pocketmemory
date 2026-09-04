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
  puff: number;
  breathe: number;
  wingL: number;
  wingR: number;
  happy: number;
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
    beak: 0,
    puff: 0,
    breathe: 0,
    wingL: 0,
    wingR: 0,
    happy: 0,
  };
}

export function lerpPose(current: HenPose, target: HenPose, eyeT: number, bodyT: number) {
  current.lookX += (target.lookX - current.lookX) * eyeT;
  current.lookY += (target.lookY - current.lookY) * eyeT;
  current.eyeOpenL += (target.eyeOpenL - current.eyeOpenL) * 0.28;
  current.eyeOpenR += (target.eyeOpenR - current.eyeOpenR) * 0.28;
  current.browL += (target.browL - current.browL) * bodyT;
  current.browR += (target.browR - current.browR) * bodyT;
  current.headTilt += (target.headTilt - current.headTilt) * bodyT;
  current.headTurn += (target.headTurn - current.headTurn) * 0.1;
  current.leanX += (target.leanX - current.leanX) * bodyT;
  current.leanY += (target.leanY - current.leanY) * bodyT;
  current.eyeWiden += (target.eyeWiden - current.eyeWiden) * bodyT;
  current.squint += (target.squint - current.squint) * bodyT;
  current.beak += (target.beak - current.beak) * 0.16;
  current.puff += (target.puff - current.puff) * bodyT;
  current.breathe += (target.breathe - current.breathe) * 0.08;
  current.wingL += (target.wingL - current.wingL) * bodyT;
  current.wingR += (target.wingR - current.wingR) * bodyT;
  current.happy += (target.happy - current.happy) * 0.12;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function clamp1(n: number) {
  return clamp(n, -1, 1);
}
