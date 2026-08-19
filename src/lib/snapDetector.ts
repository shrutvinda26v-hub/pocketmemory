import { palmSize, thumbMiddleGap } from './landmarks.ts'
import type { HandSample, Landmark, SnapResult } from './types.ts'

const CONTACT = 0.22
const TIGHT = 0.18
const OPEN = 0.36
const MIN_HOLD_MS = 12
const MAX_HOLD_MS = 180
const MIN_FLICK = 2.6
const MIN_SEPARATION = 0.12
const COOLDOWN_MS = 720
const HISTORY_MS = 120

interface HandSnapState {
  phase: 'idle' | 'closed'
  closedAt: number
  minGap: number
  lastGap: number
  history: { t: number; d: number }[]
}

function emptyState(): HandSnapState {
  return { phase: 'idle', closedAt: 0, minGap: 1, lastGap: 1, history: [] }
}

export function handFromLandmarks(id: string, landmarks: Landmark[]): HandSample {
  return {
    id,
    landmarks,
    palm: palmSize(landmarks),
    thumbMiddle: thumbMiddleGap(landmarks),
  }
}

/** Build a plausible 21-point hand with a controlled thumb–middle gap. */
export function poseSnapHand(gap: number, origin = { x: 0.5, y: 0.55, z: 0 }): Landmark[] {
  const lm: Landmark[] = Array.from({ length: 21 }, () => ({ x: origin.x, y: origin.y, z: origin.z }))
  lm[0] = { x: origin.x, y: origin.y, z: origin.z }
  lm[5] = { x: origin.x - 0.04, y: origin.y - 0.06, z: origin.z }
  lm[9] = { x: origin.x - 0.01, y: origin.y - 0.07, z: origin.z }
  lm[13] = { x: origin.x + 0.02, y: origin.y - 0.06, z: origin.z }
  lm[17] = { x: origin.x + 0.05, y: origin.y - 0.05, z: origin.z }
  const palm = palmSize(lm)
  const half = (gap * palm) / 2
  const tipY = origin.y - 0.14
  lm[4] = { x: origin.x - half, y: tipY, z: origin.z }
  lm[12] = { x: origin.x + half, y: tipY, z: origin.z }
  lm[10] = { x: origin.x - 0.01, y: origin.y - 0.1, z: origin.z }
  lm[8] = { x: origin.x - 0.04, y: origin.y - 0.13, z: origin.z }
  lm[16] = { x: origin.x + 0.03, y: origin.y - 0.09, z: origin.z }
  lm[20] = { x: origin.x + 0.055, y: origin.y - 0.08, z: origin.z }
  return lm
}

function flickSpeed(state: HandSnapState, now: number): number {
  const closed = state.history.filter((point) => point.t >= state.closedAt)
  if (closed.length === 0) return 0
  let minPoint = closed[0]!
  for (const point of closed) {
    if (point.d < minPoint.d) minPoint = point
  }
  const dt = Math.max(0.012, (now - minPoint.t) / 1000)
  return (closed[closed.length - 1]!.d - minPoint.d) / dt
}

export class SnapDetector {
  private hands = new Map<string, HandSnapState>()
  private lastFire = -Infinity

  reset(): void {
    this.hands.clear()
  }

  update(hands: HandSample[], now: number): SnapResult {
    const seen = new Set<string>()
    let fired = false

    for (const hand of hands) {
      seen.add(hand.id)
      const state = this.hands.get(hand.id) ?? emptyState()
      const gap = hand.thumbMiddle
      state.history.push({ t: now, d: gap })
      state.history = state.history.filter((point) => now - point.t <= HISTORY_MS + 40)

      if (state.phase === 'idle') {
        if (gap < CONTACT) {
          state.phase = 'closed'
          state.closedAt = now
          state.minGap = gap
        }
      } else {
        state.minGap = Math.min(state.minGap, gap)
        const held = now - state.closedAt
        if (gap > CONTACT) {
          const speed = flickSpeed(state, now)
          const quick = held >= MIN_HOLD_MS && held <= MAX_HOLD_MS
          const tight = state.minGap <= TIGHT
          const separated = gap - state.minGap >= MIN_SEPARATION
          const cooldown = now - this.lastFire > COOLDOWN_MS
          if (quick && tight && separated && speed >= MIN_FLICK && cooldown) {
            fired = true
            this.lastFire = now
            state.phase = 'idle'
          } else if (gap > OPEN || held > MAX_HOLD_MS + 80) {
            state.phase = 'idle'
          }
        }
      }

      state.lastGap = gap
      this.hands.set(hand.id, state)
    }

    for (const id of [...this.hands.keys()]) {
      if (!seen.has(id)) this.hands.delete(id)
    }

    return { fired }
  }
}
