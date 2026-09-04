import { HenPose, clamp1 } from "./pose";

export type ExprId =
  | "happy"
  | "confused"
  | "curious"
  | "woo"
  | "nosy"
  | "detective"
  | "knows"
  | "judging"
  | "shocked"
  | "suspicious"
  | "bored"
  | "private"
  | "embarrassed"
  | "innocent"
  | "peek"
  | "peekBoth"
  | "caught"
  | "tempted"
  | "sawNothing"
  | "sleepy"
  | "excited"
  | "proud"
  | "shy"
  | "cuteAngry"
  | "evilGrin"
  | "surprised"
  | "proudOfYou"
  | "lookLeft"
  | "lookRight"
  | "lookUser"
  | "lookAway"
  | "sideEye"
  | "upGlance"
  | "downGlance"
  | "stare"
  | "slowBlink"
  | "rapidBlink"
  | "oneSquint"
  | "tilt"
  | "yawn"
  | "feather"
  | "wingCover";

function i(base: number, intensity: number) {
  return base * intensity;
}

export function applyExpr(p: HenPose, id: ExprId, intensity = 1, now = 0) {
  const n = Math.max(0.35, Math.min(1.15, intensity));
  switch (id) {
    case "happy":
      p.lookX = 0;
      p.lookY = -0.08;
      p.eyeOpenL = 1;
      p.eyeOpenR = 1;
      p.eyeWiden = i(0.18, n);
      p.browL = i(0.35, n);
      p.browR = i(0.35, n);
      p.smile = i(0.7, n);
      p.beak = i(0.12, n);
      p.headTilt = i(8, n);
      p.bounce = i(4, n) * (0.5 + 0.5 * Math.sin(now / 180));
      break;
    case "confused":
      p.browL = i(0.95, n);
      p.browR = i(-0.35, n);
      p.headTilt = i(22, n);
      p.eyeOpenL = 1;
      p.eyeOpenR = 0.72;
      p.beak = i(0.45, n);
      p.lookX = 0.12;
      p.lookY = -0.05;
      break;
    case "curious":
      p.eyeWiden = i(0.55, n);
      p.browL = i(0.85, n);
      p.browR = i(0.75, n);
      p.neck = i(0.7, n);
      p.leanX = i(14, n);
      p.beak = i(0.32, n);
      p.lookX = 0.72;
      p.lookY = 0.08;
      p.headTilt = i(-6, n);
      break;
    case "woo":
      p.eyeWiden = 1;
      p.eyeOpenL = 1;
      p.eyeOpenR = 1;
      p.browL = 1;
      p.browR = 1;
      p.beak = 1;
      p.smile = 0;
      p.lookX = 0.78;
      p.lookY = 0.04;
      p.neck = i(0.55, n);
      p.leanX = i(12, n);
      p.headTilt = -5;
      p.puff = 0.18;
      p.freeze = 0.25;
      break;
    case "nosy":
      p.leanX = i(22, n);
      p.neck = i(0.9, n);
      p.squint = i(0.28, n);
      p.eyeWiden = i(0.2, n);
      p.lookX = 0.55 + Math.sin(now / 220) * 0.4;
      p.lookY = 0.1;
      p.headTilt = Math.sin(now / 480) * 8;
      p.beak = 0.2;
      break;
    case "detective":
      p.browL = i(0.95, n);
      p.browR = i(-0.1, n);
      p.squint = i(0.42, n);
      p.headTilt = i(-4, n);
      p.leanY = i(8, n);
      p.leanX = i(10, n);
      p.neck = i(0.35, n);
      p.lookX = 0.82;
      p.lookY = 0.12;
      p.sparkle = 0.8;
      p.beak = 0.1;
      p.smile = 0;
      break;
    case "knows":
      p.lookX = 0;
      p.lookY = -0.1;
      p.browL = i(1, n);
      p.browR = i(0.05, n);
      p.smile = i(0.55, n);
      p.squint = i(0.15, n);
      p.headTilt = i(10, n);
      p.beak = 0.05;
      break;
    case "judging":
      p.squint = i(0.38, n);
      p.headTilt = i(14, n);
      p.browL = i(0.8, n);
      p.browR = i(-0.15, n);
      p.lookX = 0.55;
      p.lookY = 0.05;
      p.smile = 0;
      p.beak = 0;
      break;
    case "shocked":
    case "surprised":
      p.eyeWiden = i(0.95, n);
      p.eyeOpenL = 1;
      p.eyeOpenR = 1;
      p.browL = i(1, n);
      p.browR = i(1, n);
      p.beak = i(0.85, n);
      p.leanX = i(-8, n);
      p.leanY = i(-6, n);
      p.puff = i(0.35, n);
      p.freeze = 1;
      p.headTilt = 0;
      p.smile = 0;
      break;
    case "suspicious":
      p.eyeOpenL = 1;
      p.eyeOpenR = 0.55;
      p.browL = i(0.9, n);
      p.browR = i(-0.2, n);
      p.headTilt = i(12, n);
      p.lookX = 0.45;
      p.lookY = 0;
      p.squint = i(0.2, n);
      break;
    case "bored":
      p.eyeOpenL = 0.45;
      p.eyeOpenR = 0.42;
      p.headTilt = i(6, n);
      p.leanY = i(10, n);
      p.beak = 0.2 + Math.sin(now / 400) * 0.08;
      p.lookX = Math.sin(now / 900) * 0.6;
      p.lookY = 0.15;
      p.browL = -0.15;
      p.browR = -0.15;
      break;
    case "private":
      p.eyeWiden = 0.9;
      p.eyeOpenL = 1;
      p.eyeOpenR = 1;
      p.browL = 1;
      p.browR = 1;
      p.lookX = 0.95;
      p.lookY = 0.08;
      p.beak = 0.55;
      p.freeze = 1;
      p.headTurn = 0.1;
      break;
    case "embarrassed":
      p.eyeOpenL = 0;
      p.eyeOpenR = 0;
      p.headTurn = -0.85;
      p.headTilt = 10;
      p.blush = 0.85;
      p.smile = 0.45;
      p.beak = 0.08;
      p.wingCover = 0.9;
      p.lookX = -0.8;
      break;
    case "innocent":
      p.eyeOpenL = 0;
      p.eyeOpenR = 0;
      p.headTurn = -1;
      p.headTilt = 14;
      p.smile = 0.7;
      p.blush = 0.4;
      p.wingL = 10;
      p.wingR = 10;
      p.wingCover = 0.15;
      p.lookX = -1;
      break;
    case "peek":
      p.eyeOpenL = 0;
      p.eyeOpenR = 0.85;
      p.headTurn = -0.55;
      p.headTilt = 8;
      p.lookX = 0.95;
      p.lookY = 0.05;
      p.blush = 0.35;
      p.smile = 0.2;
      p.wingCover = 0.25;
      p.browR = 0.6;
      break;
    case "peekBoth":
      p.eyeOpenL = 0.9;
      p.eyeOpenR = 0.9;
      p.headTurn = -0.2;
      p.lookX = 0.9;
      p.eyeWiden = 0.3;
      p.blush = 0.45;
      p.freeze = 0.6;
      break;
    case "caught":
      p.eyeWiden = 0.85;
      p.eyeOpenL = 1;
      p.eyeOpenR = 1;
      p.headTurn = -1;
      p.beak = 0.2;
      p.smile = 0.8;
      p.blush = 1;
      p.wingCover = 0.7;
      p.freeze = 0.8;
      break;
    case "tempted":
      p.headTurn = -0.75;
      p.eyeOpenL = 0;
      p.eyeOpenR = 0.35 + 0.25 * Math.sin(now / 160);
      p.lookX = 0.8;
      p.blush = 0.3;
      p.smile = 0.25;
      p.wingCover = 0.4;
      break;
    case "sawNothing":
      p.lookX = 0;
      p.lookY = -0.05;
      p.eyeOpenL = 1;
      p.eyeOpenR = 1;
      p.smile = 0.6;
      p.browL = 0.2;
      p.browR = 0.2;
      p.headTilt = -4;
      p.headTurn = 0.1;
      p.blush = 0.15;
      break;
    case "sleepy":
      p.eyeOpenL = 0.28;
      p.eyeOpenR = 0.32;
      p.leanY = 14;
      p.headTilt = 8;
      p.beak = 0.55;
      p.browL = -0.25;
      p.browR = -0.25;
      break;
    case "excited":
      p.eyeWiden = 0.7;
      p.browL = 0.85;
      p.browR = 0.85;
      p.bounce = 7 * Math.sin(now / 90);
      p.beak = 0.4;
      p.smile = 0.5;
      p.headTilt = Math.sin(now / 70) * 10;
      break;
    case "proud":
      p.leanY = -10;
      p.browL = 0.4;
      p.browR = 0.4;
      p.smile = 0.65;
      p.headTilt = -2;
      p.eyeOpenL = 1;
      p.eyeOpenR = 1;
      p.puff = 0.25;
      break;
    case "shy":
      p.lookX = -0.55;
      p.headTurn = -0.35;
      p.headTilt = 8;
      p.blush = 0.45;
      p.eyeOpenL = 0.9;
      p.eyeOpenR = 0.9;
      p.smile = 0.3;
      break;
    case "cuteAngry":
      p.browL = -0.55;
      p.browR = -0.55;
      p.puff = 0.55;
      p.smile = 0;
      p.beak = 0.05;
      p.headTilt = Math.sin(now / 80) * 6;
      p.squint = 0.25;
      break;
    case "evilGrin":
      p.squint = 0.45;
      p.browL = -0.25;
      p.browR = -0.35;
      p.smile = 0.8;
      p.headTilt = 12;
      p.lookX = 0.35;
      p.beak = 0.15;
      break;
    case "proudOfYou":
      p.happy = 1;
      p.eyeOpenL = 0.05;
      p.eyeOpenR = 0.05;
      p.smile = 1;
      p.bounce = 8 * Math.abs(Math.sin(now / 110));
      p.wingL = 18 + Math.sin(now / 90) * 8;
      p.wingR = 18 + Math.cos(now / 90) * 8;
      p.browL = 0.5;
      p.browR = 0.5;
      p.leanY = -8;
      break;
    case "lookLeft":
      p.lookX = -0.8;
      p.headTilt = -8;
      p.headTurn = -0.2;
      break;
    case "lookRight":
      p.lookX = 0.8;
      p.headTilt = 8;
      p.headTurn = 0.15;
      break;
    case "lookUser":
      p.lookX = 0;
      p.lookY = -0.12;
      p.eyeWiden = 0.12;
      break;
    case "lookAway":
      p.lookX = 0.2;
      p.lookY = 0.45;
      p.headTilt = 10;
      break;
    case "sideEye":
      p.lookX = 0.85;
      p.lookY = 0;
      p.squint = 0.2;
      p.headTurn = -0.12;
      break;
    case "upGlance":
      p.lookY = -0.7;
      p.lookX = 0.05;
      p.browL = 0.4;
      p.browR = 0.4;
      break;
    case "downGlance":
      p.lookY = 0.7;
      p.headTilt = 4;
      break;
    case "stare":
      p.lookX = 0;
      p.lookY = -0.05;
      p.eyeWiden = 0.35;
      p.freeze = 0.4;
      break;
    case "slowBlink":
      p.eyeOpenL = 0.05;
      p.eyeOpenR = 0.05;
      break;
    case "rapidBlink":
      p.eyeOpenL = Math.sin(now / 55) > 0 ? 1 : 0.05;
      p.eyeOpenR = Math.sin(now / 55) > 0 ? 1 : 0.05;
      break;
    case "oneSquint":
      p.eyeOpenL = 1;
      p.eyeOpenR = 0.35;
      p.browR = -0.2;
      p.lookX = 0.4;
      break;
    case "tilt":
      p.headTilt = 16;
      p.browL = 0.4;
      break;
    case "yawn":
      p.beak = 0.95;
      p.eyeOpenL = 0.25;
      p.eyeOpenR = 0.22;
      p.headTilt = -6;
      break;
    case "feather":
      p.puff = 0.45;
      p.wingL = 8;
      p.wingR = -4;
      break;
    case "wingCover":
      p.wingCover = 0.85;
      p.headTilt = 6;
      break;
    default:
      break;
  }
  p.lookX = clamp1(p.lookX);
  p.lookY = clamp1(p.lookY);
}

export const IDLE_POOL: { id: ExprId; weight: number; min: number; max: number }[] = [
  { id: "happy", weight: 3, min: 900, max: 2200 },
  { id: "confused", weight: 1.1, min: 1000, max: 2000 },
  { id: "lookLeft", weight: 2.2, min: 500, max: 1400 },
  { id: "lookRight", weight: 2.2, min: 500, max: 1400 },
  { id: "lookUser", weight: 2.6, min: 600, max: 1600 },
  { id: "lookAway", weight: 1.6, min: 500, max: 1200 },
  { id: "sideEye", weight: 1.8, min: 400, max: 1100 },
  { id: "upGlance", weight: 1.4, min: 350, max: 900 },
  { id: "downGlance", weight: 1.2, min: 350, max: 900 },
  { id: "stare", weight: 1.3, min: 500, max: 1400 },
  { id: "oneSquint", weight: 1.2, min: 400, max: 1000 },
  { id: "tilt", weight: 1.8, min: 500, max: 1400 },
  { id: "excited", weight: 1, min: 500, max: 1100 },
  { id: "proud", weight: 1, min: 700, max: 1600 },
  { id: "shy", weight: 1.2, min: 700, max: 1600 },
  { id: "cuteAngry", weight: 0.8, min: 500, max: 1100 },
  { id: "evilGrin", weight: 0.8, min: 450, max: 1000 },
  { id: "surprised", weight: 0.7, min: 280, max: 520 },
  { id: "shocked", weight: 0.5, min: 220, max: 420 },
  { id: "suspicious", weight: 0.9, min: 800, max: 1600 },
  { id: "yawn", weight: 0.6, min: 500, max: 900 },
  { id: "feather", weight: 1.4, min: 400, max: 900 },
  { id: "sleepy", weight: 0.7, min: 900, max: 1800 },
  { id: "bored", weight: 0.7, min: 1200, max: 2400 },
];

export const RAPID_CHAIN: ExprId[] = ["happy", "curious", "suspicious", "shocked", "innocent"];
