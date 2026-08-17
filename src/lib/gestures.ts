import { PINCH_DISTANCE, type Gesture, type Handedness, type Landmark } from './types.ts'

export const LM = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_TIP: 20,
} as const

const FINGERS = [
  { tip: LM.INDEX_TIP, pip: LM.INDEX_PIP, mcp: LM.INDEX_MCP },
  { tip: LM.MIDDLE_TIP, pip: LM.MIDDLE_PIP, mcp: LM.MIDDLE_MCP },
  { tip: LM.RING_TIP, pip: LM.RING_PIP, mcp: LM.RING_MCP },
  { tip: LM.PINKY_TIP, pip: LM.PINKY_PIP, mcp: LM.PINKY_MCP },
] as const

function dist(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.hypot(dx, dy, dz)
}

function isExtended(landmarks: Landmark[], tip: number, pip: number, mcp: number): boolean {
  const tipPt = landmarks[tip]
  const pipPt = landmarks[pip]
  const mcpPt = landmarks[mcp]
  if (!tipPt || !pipPt || !mcpPt) return false
  const tipAbove = tipPt.y < mcpPt.y - 0.035
  const longEnough = dist(tipPt, mcpPt) > dist(pipPt, mcpPt) * 1.15
  return tipAbove && longEnough
}

export function pinchDistance(landmarks: Landmark[]): number {
  const thumb = landmarks[LM.THUMB_TIP]
  const index = landmarks[LM.INDEX_TIP]
  if (!thumb || !index) return 1
  return dist(thumb, index)
}

export function classifyGesture(landmarks: Landmark[]): Gesture {
  if (landmarks.length < 21) return 'unknown'

  const pinch = pinchDistance(landmarks)
  const extended = FINGERS.map((finger) => isExtended(landmarks, finger.tip, finger.pip, finger.mcp))
  const count = extended.filter(Boolean).length
  const indexUp = extended[0]
  const othersDown = !extended[1] && !extended[2] && !extended[3]

  if (pinch < PINCH_DISTANCE && count >= 1) return 'pinch'
  if (indexUp && othersDown) return 'point'
  if (count >= 4) return 'open_palm'
  if (count <= 0) return 'fist'
  return 'unknown'
}

function emptyLandmarks(): Landmark[] {
  return Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }))
}

export interface PoseOptions {
  gesture: Gesture | 'relax'
  origin?: Landmark
  scale?: number
  handedness?: Handedness
}

/** Build a plausible 21-landmark hand for tests and the camera-free demo. */
export function poseHand(options: PoseOptions): Landmark[] {
  const origin = options.origin ?? { x: 0.5, y: 0.62, z: 0 }
  const scale = options.scale ?? 1
  const side = options.handedness === 'Left' ? 1 : -1
  const lm = emptyLandmarks()
  const ox = origin.x
  const oy = origin.y
  const oz = origin.z

  lm[0] = { x: ox, y: oy, z: oz }

  const thumbOut = options.gesture === 'open_palm' || options.gesture === 'pinch' || options.gesture === 'relax'
  lm[1] = { x: ox + side * 0.02 * scale, y: oy - 0.01 * scale, z: oz + 0.01 }
  lm[2] = { x: ox + side * 0.035 * scale, y: oy - 0.03 * scale, z: oz + 0.01 }
  lm[3] = { x: ox + side * 0.045 * scale, y: oy - (thumbOut ? 0.05 : 0.02) * scale, z: oz + 0.01 }
  lm[4] = {
    x: ox + side * (thumbOut ? 0.07 : 0.03) * scale,
    y: oy - (thumbOut ? 0.08 : 0.015) * scale,
    z: oz + 0.01,
  }

  const xs = [-0.03, -0.01, 0.012, 0.032]
  const gesture = options.gesture
  const extend = [
    gesture === 'point' || gesture === 'open_palm' || gesture === 'relax' || gesture === 'pinch',
    gesture === 'open_palm' || gesture === 'relax',
    gesture === 'open_palm',
    gesture === 'open_palm',
  ]

  for (let f = 0; f < 4; f += 1) {
    const mcp = 5 + f * 4
    const x = ox + xs[f]! * scale
    const mcpY = oy - 0.05 * scale
    lm[mcp] = { x, y: mcpY, z: oz }
    if (extend[f]) {
      lm[mcp + 1] = { x, y: mcpY - 0.045 * scale, z: oz }
      lm[mcp + 2] = { x, y: mcpY - 0.085 * scale, z: oz }
      lm[mcp + 3] = { x, y: mcpY - 0.125 * scale, z: oz }
    } else {
      lm[mcp + 1] = { x, y: mcpY + 0.012 * scale, z: oz - 0.02 }
      lm[mcp + 2] = { x, y: mcpY + 0.028 * scale, z: oz - 0.03 }
      lm[mcp + 3] = { x, y: mcpY + 0.042 * scale, z: oz - 0.02 }
    }
  }

  if (gesture === 'pinch') {
    const indexTip = lm[LM.INDEX_TIP]
    if (indexTip) {
      lm[LM.THUMB_TIP] = { x: indexTip.x + side * 0.01, y: indexTip.y + 0.008, z: indexTip.z }
    }
  }

  return lm
}

export function palmAngle(landmarks: Landmark[]): number {
  const wrist = landmarks[LM.WRIST]
  const index = landmarks[LM.INDEX_MCP]
  if (!wrist || !index) return 0
  return Math.atan2(index.y - wrist.y, index.x - wrist.x)
}
