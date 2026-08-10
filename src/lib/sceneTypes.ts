export type PointerSource = "none" | "hand" | "mouse" | "touch";

export interface InteractionPoint {
  x: number;
  y: number;
  active: boolean;
  source: PointerSource;
  strength: number;
}

export interface ParallaxOffset {
  x: number;
  y: number;
}

export type ButterflyState = "resting" | "waking" | "flying" | "settling";

export interface Butterfly {
  id: number;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  rotation: number;
  wingPhase: number;
  wingSpeed: number;
  glow: number;
  state: ButterflyState;
  stateTimer: number;
  followChance: number;
  pathOffset: number;
  activationRadius: number;
}

export interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  life: number;
  maxLife: number;
  kind: "ambient" | "ember" | "burst";
  flicker: number;
}

export interface EnergyPulse {
  x: number;
  y: number;
  angle: number;
  dist: number;
  maxDist: number;
  life: number;
  maxLife: number;
  width: number;
}
