import { clamp, mouthMetrics, readBlend } from './landmarks.ts'
import type { BlowResult, FaceSample, MouthSample } from './types.ts'

const HISTORY_MS = 480
const CONFIRM_MS = 220
const SCORE_THRESHOLD = 0.42
const PEAK_THRESHOLD = 0.5
const COOLDOWN_MS = 1400
const TALK_VARIANCE = 0.011
const EMA = 0.28

export function sampleMouth(face: FaceSample | null, now: number): MouthSample {
  if (!face) {
    return {
      now,
      funnel: 0,
      pucker: 0,
      puff: 0,
      jawOpen: 0,
      smile: 0,
      aperture: 0,
      width: 0.45,
      roundness: 0,
      present: false,
    }
  }
  const mouth = mouthMetrics(face.landmarks)
  const shapes = face.blendshapes
  return {
    now,
    funnel: readBlend(shapes, ['mouthFunnel']),
    pucker: readBlend(shapes, ['mouthPucker']),
    puff: readBlend(shapes, ['cheekPuff']),
    jawOpen: readBlend(shapes, ['jawOpen']),
    smile: Math.max(readBlend(shapes, ['mouthSmileLeft']), readBlend(shapes, ['mouthSmileRight'])),
    aperture: mouth.aperture,
    width: mouth.width,
    roundness: mouth.roundness,
    present: true,
  }
}

/** 0–1 blow likelihood for a single frame. Talking / smiles score low. */
export function blowScore(sample: MouthSample): number {
  if (!sample.present) return 0

  const oShape = clamp(sample.roundness / 0.55, 0, 1)
  const openEnough = clamp((sample.aperture - 0.035) / 0.08, 0, 1)
  const notTooOpen = 1 - clamp((sample.aperture - 0.2) / 0.12, 0, 1)
  const narrow = 1 - clamp((sample.width - 0.52) / 0.22, 0, 1)
  const landmarkBlow = oShape * openEnough * notTooOpen * narrow

  const blend =
    sample.funnel * 0.5 +
    sample.pucker * 0.32 +
    sample.puff * 0.48 -
    sample.smile * 0.55 -
    Math.max(0, sample.jawOpen - 0.38) * 0.7

  const closedKiss = sample.pucker > 0.45 && sample.aperture < 0.03
  if (closedKiss) return 0

  const combined = Math.max(landmarkBlow * 0.85, blend) * (0.45 + 0.55 * openEnough)
  return clamp(combined, 0, 1)
}

export function jawVariance(history: MouthSample[]): number {
  const recent = history.filter((frame) => frame.present)
  if (recent.length < 4) return 0
  const mean = recent.reduce((sum, frame) => sum + frame.jawOpen + frame.aperture, 0) / recent.length
  const variance =
    recent.reduce((sum, frame) => {
      const value = frame.jawOpen + frame.aperture - mean
      return sum + value * value
    }, 0) / recent.length
  return variance
}

export function isTalking(history: MouthSample[]): boolean {
  if (jawVariance(history) > TALK_VARIANCE) return true
  const recent = history.filter((frame) => frame.present)
  if (recent.length < 5) return false
  let flips = 0
  for (let i = 1; i < recent.length; i += 1) {
    const prev = recent[i - 1]
    const next = recent[i]
    if (!prev || !next) continue
    if (Math.abs(next.aperture - prev.aperture) > 0.045) flips += 1
  }
  return flips >= 4
}

export class BlowDetector {
  private history: MouthSample[] = []
  private ema = 0
  private holdStart: number | null = null
  private peak = 0
  private lastFire = -Infinity

  reset(): void {
    this.history = []
    this.ema = 0
    this.holdStart = null
    this.peak = 0
  }

  update(face: FaceSample | null, now: number): BlowResult {
    const sample = sampleMouth(face, now)
    this.history.push(sample)
    this.history = this.history.filter((frame) => now - frame.now <= HISTORY_MS)

    const raw = blowScore(sample)
    this.ema = this.ema + (raw - this.ema) * EMA
    const talking = isTalking(this.history)
    const live = talking ? this.ema * 0.15 : this.ema
    const charging = !talking && live >= SCORE_THRESHOLD && now - this.lastFire > COOLDOWN_MS

    if (charging) {
      this.holdStart ??= now
      this.peak = Math.max(this.peak, live)
    } else {
      this.holdStart = null
      this.peak = 0
    }

    const held = this.holdStart !== null && now - this.holdStart >= CONFIRM_MS
    const fired = held && this.peak >= PEAK_THRESHOLD && now - this.lastFire > COOLDOWN_MS
    if (fired) {
      this.lastFire = now
      this.holdStart = null
      this.peak = 0
      this.ema *= 0.2
    }

    return { intensity: live, charging, fired }
  }
}
