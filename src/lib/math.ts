export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function inverseLerp(a: number, b: number, value: number) {
  if (Math.abs(b - a) < 1e-6) return 0;
  return clamp((value - a) / (b - a));
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = inverseLerp(edge0, edge1, x);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0: number, edge1: number, x: number) {
  const t = inverseLerp(edge0, edge1, x);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  ease: (t: number) => number = (t) => t
) {
  return lerp(outMin, outMax, ease(inverseLerp(inMin, inMax, value)));
}

export function windowOpacity(
  p: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number
) {
  if (p < fadeInStart || p > fadeOutEnd) return 0;
  if (p < fadeInEnd) return smoothstep(fadeInStart, fadeInEnd, p);
  if (p > fadeOutStart) return 1 - smoothstep(fadeOutStart, fadeOutEnd, p);
  return 1;
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function lerpVec3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
