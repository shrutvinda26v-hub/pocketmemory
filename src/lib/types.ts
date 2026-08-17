export const GESTURE_HOLD_MS = 180
export const PALM_HOLD_MS = 720
export const TRACKING_GRACE_MS = 1400
export const SUMMON_MS = 720
export const DISSOLVE_MS = 920
export const MATERIALIZE_MS = 920
export const DETECT_INTERVAL_MS = 33
export const CATCH_HOLD_MS = 1400
export const SWIPE_THRESHOLD = 0.045
export const SWIPE_WINDOW_MS = 400
export const PULSE_DECAY = 2.8
export const PINCH_DISTANCE = 0.055
export const CUBE_PADDING = 0.16

export type Gesture = 'point' | 'open_palm' | 'fist' | 'pinch' | 'unknown'

export type Phase =
  | 'idle'
  | 'summoning'
  | 'holding'
  | 'dissolving'
  | 'materializing'

export type Handedness = 'Left' | 'Right'

export interface Landmark {
  x: number
  y: number
  z: number
}

export interface TrackedHand {
  handedness: Handedness
  landmarks: Landmark[]
  gesture: Gesture
  wrist: Landmark
  pinchDistance: number
  extendedCount: number
}

export interface HandReport {
  handedness: Handedness
  gesture: Gesture
  role: 'holder' | 'switcher' | 'free'
}

export interface ShowcaseSnapshot {
  phase: Phase
  phaseAgeMs: number
  index: number
  pendingIndex: number
  rosterLength: number
  anchorHand: Handedness | null
  cubeSolid: boolean
  pulse: number
  swapDirection: 1 | -1
  caught: number[]
  handsDetected: boolean
  labelVisible: boolean
  pinchActive: boolean
  pinchDelta: number
  trackingLost: boolean
  hint: string
  handReports: HandReport[]
}
