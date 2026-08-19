import { clamp, lerp } from './landmarks.ts'
import type { CandlePhase, CandleSnapshot, CandleVisuals } from './types.ts'

const EXTINGUISH_MS = 1180
const RELIGHT_MS = 920

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function band(age: number, start: number, end: number): number {
  return smoothstep(start, start + (end - start) * 0.35, age) * (1 - smoothstep(end - (end - start) * 0.25, end, age))
}

export class CandleMachine {
  private phase: CandlePhase = 'lit'
  private phaseStarted = 0
  private blowLive = 0
  private now = 0

  constructor(now = 0) {
    this.phaseStarted = now
    this.now = now
  }

  getPhase(): CandlePhase {
    return this.phase
  }

  notifyBlow(intensity: number, fired: boolean, now: number): void {
    this.blowLive = this.phase === 'lit' ? intensity : 0
    if (fired && this.phase === 'lit') {
      this.phase = 'extinguishing'
      this.phaseStarted = now
    }
  }

  notifySnap(fired: boolean, now: number): void {
    if (fired && this.phase === 'extinguished') {
      this.phase = 'relighting'
      this.phaseStarted = now
    }
  }

  update(now: number): CandleSnapshot {
    this.now = now
    const age = now - this.phaseStarted
    if (this.phase === 'extinguishing' && age >= EXTINGUISH_MS) {
      this.phase = 'extinguished'
      this.phaseStarted = now
    } else if (this.phase === 'relighting' && age >= RELIGHT_MS) {
      this.phase = 'lit'
      this.phaseStarted = now
      this.blowLive = 0
    }
    return this.snapshot()
  }

  snapshot(): CandleSnapshot {
    const ageMs = this.now - this.phaseStarted
    return {
      phase: this.phase,
      hint: this.phase === 'lit' || this.phase === 'extinguishing' ? 'blow' : 'snap',
      visuals: this.visuals(ageMs),
    }
  }

  private visuals(age: number): CandleVisuals {
    const phase = this.phase
    if (phase === 'lit') {
      return {
        phase,
        ageMs: age,
        flameIntensity: 1,
        flameBend: this.blowLive * 0.85,
        flameTurbulence: 0.35 + this.blowLive * 0.9,
        ember: 0,
        smoke: 0,
        wickGlow: 0.08,
        spark: 0,
        sparkTravel: 0,
        light: 1,
        dust: 1,
        blowLive: this.blowLive,
      }
    }
    if (phase === 'extinguishing') {
      const bend = lerp(0.35, 1, smoothstep(0, 180, age)) * (1 - smoothstep(520, 760, age))
      const flicker = 0.55 + 0.9 * band(age, 60, 420)
      const shrink = 1 - smoothstep(260, 700, age)
      const gone = smoothstep(640, 820, age)
      const intensity = Math.max(0, shrink * (1 - gone))
      return {
        phase,
        ageMs: age,
        flameIntensity: intensity,
        flameBend: bend + this.blowLive * 0.2,
        flameTurbulence: flicker,
        ember: band(age, 700, 1180) * 0.9,
        smoke: smoothstep(620, 880, age),
        wickGlow: lerp(0.08, 0.7, band(age, 680, 1100)),
        spark: 0,
        sparkTravel: 0,
        light: lerp(1, 0.12, smoothstep(280, 900, age)),
        dust: lerp(1, 0.25, smoothstep(200, 900, age)),
        blowLive: this.blowLive,
      }
    }
    if (phase === 'extinguished') {
      const leftoverSmoke = Math.max(0, 1 - age / 1600)
      return {
        phase,
        ageMs: age,
        flameIntensity: 0,
        flameBend: 0,
        flameTurbulence: 0,
        ember: leftoverSmoke > 0.4 ? leftoverSmoke * 0.25 : 0,
        smoke: leftoverSmoke * 0.55,
        wickGlow: leftoverSmoke * 0.12,
        spark: 0,
        sparkTravel: 0,
        light: 0.08,
        dust: 0.22,
        blowLive: 0,
      }
    }
    const spark = band(age, 0, 200)
    const travel = smoothstep(40, 340, age)
    const wick = band(age, 250, 560)
    const grow = smoothstep(390, 880, age)
    return {
      phase,
      ageMs: age,
      flameIntensity: grow,
      flameBend: (1 - grow) * 0.12,
      flameTurbulence: lerp(0.8, 0.35, grow),
      ember: 0,
      smoke: 0,
      wickGlow: Math.max(wick, grow * 0.1),
      spark: Math.max(spark, (1 - travel) * 0.35 * (1 - smoothstep(300, 420, age))),
      sparkTravel: travel,
      light: lerp(0.08, 1, smoothstep(420, 900, age)),
      dust: lerp(0.22, 1, smoothstep(500, 900, age)),
      blowLive: 0,
    }
  }
}

export const CANDLE_TIMING = { EXTINGUISH_MS, RELIGHT_MS }
