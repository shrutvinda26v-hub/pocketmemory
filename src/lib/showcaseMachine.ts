import {
  CATCH_HOLD_MS,
  DISSOLVE_MS,
  GESTURE_HOLD_MS,
  MATERIALIZE_MS,
  PULSE_DECAY,
  SUMMON_MS,
  SWIPE_THRESHOLD,
  SWIPE_WINDOW_MS,
  TRACKING_GRACE_MS,
} from './types.ts'
import type {
  Gesture,
  Handedness,
  Phase,
  ShowcaseSnapshot,
  TrackedHand,
} from './types.ts'
import { wrapIndex } from '../data/pokemon.ts'
import { palmAngle } from './gestures.ts'

interface HoldState {
  gesture: Gesture
  ms: number
}

export class ShowcaseMachine {
  private phase: Phase = 'idle'
  private index: number
  private pendingIndex: number
  private rosterLength: number
  private anchor: Handedness | null = null
  private phaseStarted: number
  private lastNow: number
  private hold = new Map<Handedness, HoldState>()
  private committed = new Map<Handedness, Gesture>()
  private wristHistory: { t: number; x: number }[] = []
  private swipeCooldownUntil = 0
  private lostSince: number | null = null
  private pulse = 0
  private cubeSolid = false
  private caught = new Set<number>()
  private holdingSince = 0
  private swapDirection: 1 | -1 = 1
  private pinchActive = false
  private pinchDelta = 0
  private lastPinchAngle: number | null = null
  private lastCaughtIndex = -1

  constructor(rosterLength: number, now = 0, startIndex = 0) {
    this.rosterLength = rosterLength
    this.index = wrapIndex(startIndex, rosterLength)
    this.pendingIndex = this.index
    this.phaseStarted = now
    this.lastNow = now
  }

  getSnapshot(now = this.lastNow): ShowcaseSnapshot {
    return {
      phase: this.phase,
      phaseAgeMs: now - this.phaseStarted,
      index: this.index,
      pendingIndex: this.pendingIndex,
      rosterLength: this.rosterLength,
      anchorHand: this.anchor,
      cubeSolid: this.cubeSolid,
      pulse: this.pulse,
      swapDirection: this.swapDirection,
      caught: [...this.caught],
      handsDetected: false,
      labelVisible: this.phase === 'holding',
      pinchActive: this.pinchActive,
      pinchDelta: this.pinchDelta,
      trackingLost: this.lostSince !== null,
    }
  }

  summon(now: number, hand: Handedness = 'Right'): ShowcaseSnapshot {
    if (this.phase !== 'idle') return this.finish(now, true)
    this.anchor = hand
    this.setPhase('summoning', now)
    this.firePulse()
    return this.finish(now, true)
  }

  cycle(now: number, direction: 1 | -1): ShowcaseSnapshot {
    if (this.phase !== 'holding') return this.finish(now, true)
    this.beginSwap(now, direction)
    return this.finish(now, true)
  }

  reset(now: number): ShowcaseSnapshot {
    this.anchor = null
    this.cubeSolid = false
    this.pinchActive = false
    this.pinchDelta = 0
    this.lastPinchAngle = null
    this.lostSince = null
    this.setPhase('idle', now)
    this.firePulse()
    return this.finish(now, false)
  }

  update(now: number, hands: TrackedHand[]): ShowcaseSnapshot {
    const dt = Math.max(0, now - this.lastNow)
    this.lastNow = now
    this.pulse = Math.max(0, this.pulse - (dt / 1000) * PULSE_DECAY)

    this.updateHolds(dt, hands)

    const bothPalms = hands.length >= 2 && hands.every((hand) => this.committed.get(hand.handedness) === 'open_palm')
    if (bothPalms && this.phase !== 'idle') {
      return this.reset(now)
    }

    const anchorHand = this.anchor ? hands.find((hand) => hand.handedness === this.anchor) : undefined
    const controlHand = this.anchor
      ? hands.find((hand) => hand.handedness !== this.anchor)
      : undefined

    if (this.phase === 'idle') {
      const pointer = hands.find((hand) => this.committed.get(hand.handedness) === 'point')
      if (pointer) {
        this.anchor = pointer.handedness
        this.setPhase('summoning', now)
        this.firePulse()
      }
      this.lostSince = null
      return this.finish(now, hands.length > 0)
    }

    const anchorPresent = Boolean(anchorHand)
    if (!anchorPresent) {
      if (this.lostSince === null) this.lostSince = now
      if (now - this.lostSince > TRACKING_GRACE_MS) {
        return this.reset(now)
      }
    } else {
      this.lostSince = null
    }

    if (this.phase === 'summoning' && now - this.phaseStarted >= SUMMON_MS) {
      this.setPhase('holding', now)
      this.holdingSince = now
    }

    if (this.phase === 'dissolving' && now - this.phaseStarted >= DISSOLVE_MS) {
      this.index = this.pendingIndex
      this.setPhase('materializing', now)
    }

    if (this.phase === 'materializing' && now - this.phaseStarted >= MATERIALIZE_MS) {
      this.setPhase('holding', now)
      this.holdingSince = now
    }

    if (this.phase === 'holding' && anchorHand) {
      const anchorGesture = this.committed.get(anchorHand.handedness)
      if (anchorGesture === 'open_palm') {
        return this.reset(now)
      }

      this.cubeSolid = controlHand ? this.committed.get(controlHand.handedness) === 'fist' : false

      if (now - this.holdingSince >= CATCH_HOLD_MS && this.lastCaughtIndex !== this.index) {
        this.caught.add(this.index)
        this.lastCaughtIndex = this.index
      }

      this.updatePinch(controlHand ?? anchorHand)
      this.updateSwipe(now, controlHand)
    } else {
      this.cubeSolid = false
      this.pinchActive = false
      this.lastPinchAngle = null
    }

    return this.finish(now, hands.length > 0)
  }

  private updateHolds(dt: number, hands: TrackedHand[]): void {
    const seen = new Set<Handedness>()
    for (const hand of hands) {
      seen.add(hand.handedness)
      const current = this.hold.get(hand.handedness)
      if (current && current.gesture === hand.gesture) {
        current.ms += dt
      } else {
        this.hold.set(hand.handedness, { gesture: hand.gesture, ms: dt })
      }
      const held = this.hold.get(hand.handedness)
      if (held && held.ms >= GESTURE_HOLD_MS && held.gesture !== 'unknown') {
        const previous = this.committed.get(hand.handedness)
        this.committed.set(hand.handedness, held.gesture)
        if (previous !== held.gesture) this.firePulse()
      }
    }
    for (const key of [...this.hold.keys()]) {
      if (!seen.has(key)) {
        this.hold.delete(key)
        this.committed.delete(key)
      }
    }
  }

  private updateSwipe(now: number, control?: TrackedHand): void {
    if (!control || this.committed.get(control.handedness) !== 'fist') {
      this.wristHistory = []
      return
    }
    if (now < this.swipeCooldownUntil) return

    // Screen-space x (selfie preview is mirrored) so a rightward swipe advances.
    this.wristHistory.push({ t: now, x: 1 - control.wrist.x })
    this.wristHistory = this.wristHistory.filter((sample) => now - sample.t <= SWIPE_WINDOW_MS)
    if (this.wristHistory.length < 3) return

    const first = this.wristHistory[0]
    const last = this.wristHistory[this.wristHistory.length - 1]
    if (!first || !last) return
    const delta = last.x - first.x
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      this.beginSwap(now, delta > 0 ? 1 : -1)
    }
  }

  private updatePinch(hand: TrackedHand): void {
    const pinched = hand.gesture === 'pinch' || this.committed.get(hand.handedness) === 'pinch'
    if (!pinched) {
      this.pinchActive = false
      this.pinchDelta = 0
      this.lastPinchAngle = null
      return
    }
    const angle = palmAngle(hand.landmarks)
    if (this.lastPinchAngle === null) {
      this.lastPinchAngle = angle
      this.pinchDelta = 0
      this.pinchActive = true
      return
    }
    let delta = angle - this.lastPinchAngle
    while (delta > Math.PI) delta -= Math.PI * 2
    while (delta < -Math.PI) delta += Math.PI * 2
    this.pinchDelta = delta
    this.lastPinchAngle = angle
    this.pinchActive = true
  }

  private beginSwap(now: number, direction: 1 | -1): void {
    this.swapDirection = direction
    this.pendingIndex = wrapIndex(this.index + direction, this.rosterLength)
    this.cubeSolid = false
    this.pinchActive = false
    this.lastPinchAngle = null
    this.wristHistory = []
    this.swipeCooldownUntil = now + DISSOLVE_MS + MATERIALIZE_MS + 120
    this.setPhase('dissolving', now)
    this.firePulse()
  }

  private setPhase(phase: Phase, now: number): void {
    this.phase = phase
    this.phaseStarted = now
  }

  private firePulse(): void {
    this.pulse = 1
  }

  private finish(now: number, handsDetected: boolean): ShowcaseSnapshot {
    const snap = this.getSnapshot(now)
    snap.handsDetected = handsDetected
    return snap
  }
}
