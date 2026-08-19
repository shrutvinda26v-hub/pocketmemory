export type CandlePhase = 'lit' | 'extinguishing' | 'extinguished' | 'relighting'

export type AppMode = 'gate' | 'live'

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Landmark extends Vec3 {}

export interface MouthSample {
  now: number
  funnel: number
  pucker: number
  puff: number
  jawOpen: number
  smile: number
  aperture: number
  width: number
  roundness: number
  present: boolean
}

export interface HandSample {
  id: string
  landmarks: Landmark[]
  palm: number
  thumbMiddle: number
}

export interface FaceSample {
  landmarks: Landmark[]
  blendshapes: Record<string, number>
}

export interface TrackingFrame {
  face: FaceSample | null
  hands: HandSample[]
  faceActive: boolean
  handsActive: boolean
}

export interface CandleVisuals {
  phase: CandlePhase
  ageMs: number
  flameIntensity: number
  flameBend: number
  flameTurbulence: number
  ember: number
  smoke: number
  wickGlow: number
  spark: number
  sparkTravel: number
  light: number
  dust: number
  blowLive: number
}

export interface CandleSnapshot {
  phase: CandlePhase
  hint: 'blow' | 'snap'
  visuals: CandleVisuals
}

export interface BlowResult {
  intensity: number
  charging: boolean
  fired: boolean
}

export interface SnapResult {
  fired: boolean
}
