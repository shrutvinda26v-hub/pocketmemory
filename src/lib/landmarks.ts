import type { Landmark } from './types.ts'

export const HAND = {
  WRIST: 0,
  THUMB_TIP: 4,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_TIP: 12,
  INDEX_MCP: 5,
  PINKY_MCP: 17,
} as const

/** MediaPipe Face Mesh indices used for mouth / scale. */
export const FACE = {
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  INNER_LIP_TOP: 13,
  INNER_LIP_BOTTOM: 14,
  INNER_MOUTH_LEFT: 78,
  INNER_MOUTH_RIGHT: 308,
  OUTER_MOUTH_LEFT: 61,
  OUTER_MOUTH_RIGHT: 291,
} as const

export function dist(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

export function dist2d(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function lerpLandmarks(prev: Landmark[], next: Landmark[], amount: number): Landmark[] {
  return next.map((point, index) => {
    const prior = prev[index]
    if (!prior) return { x: point.x, y: point.y, z: point.z }
    return {
      x: prior.x + (point.x - prior.x) * amount,
      y: prior.y + (point.y - prior.y) * amount,
      z: prior.z + (point.z - prior.z) * amount,
    }
  })
}

export function palmSize(landmarks: Landmark[]): number {
  const wrist = landmarks[HAND.WRIST]
  const middle = landmarks[HAND.MIDDLE_MCP]
  const index = landmarks[HAND.INDEX_MCP]
  const pinky = landmarks[HAND.PINKY_MCP]
  if (!wrist || !middle) return 0.12
  const along = dist(wrist, middle)
  const across = index && pinky ? dist(index, pinky) : along
  return Math.max(along, across, 0.05)
}

export function thumbMiddleGap(landmarks: Landmark[]): number {
  const thumb = landmarks[HAND.THUMB_TIP]
  const middle = landmarks[HAND.MIDDLE_TIP]
  if (!thumb || !middle) return 1
  const palm = palmSize(landmarks)
  return dist(thumb, middle) / palm
}

export function faceScale(landmarks: Landmark[]): number {
  const left = landmarks[FACE.LEFT_EYE_OUTER]
  const right = landmarks[FACE.RIGHT_EYE_OUTER]
  if (!left || !right) return 0.2
  return Math.max(dist2d(left, right), 0.08)
}

export interface MouthMetrics {
  aperture: number
  width: number
  roundness: number
}

export function mouthMetrics(landmarks: Landmark[]): MouthMetrics {
  const top = landmarks[FACE.INNER_LIP_TOP]
  const bottom = landmarks[FACE.INNER_LIP_BOTTOM]
  const left = landmarks[FACE.INNER_MOUTH_LEFT]
  const right = landmarks[FACE.INNER_MOUTH_RIGHT]
  const scale = faceScale(landmarks)
  if (!top || !bottom || !left || !right) {
    return { aperture: 0, width: 0.4, roundness: 0 }
  }
  const aperture = dist2d(top, bottom) / scale
  const width = dist2d(left, right) / scale
  const roundness = width > 1e-4 ? aperture / width : 0
  return { aperture, width, roundness }
}

export function blendshapeMap(
  categories: { categoryName?: string; score?: number }[] | undefined,
): Record<string, number> {
  const map: Record<string, number> = {}
  if (!categories) return map
  for (const item of categories) {
    if (!item.categoryName) continue
    map[item.categoryName] = item.score ?? 0
  }
  return map
}

export function readBlend(map: Record<string, number>, names: string[]): number {
  let best = 0
  for (const name of names) {
    const value = map[name]
    if (value !== undefined) best = Math.max(best, value)
  }
  return best
}
