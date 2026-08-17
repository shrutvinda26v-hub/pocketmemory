import {
  CATCH_HOLD_MS,
  DISSOLVE_MS,
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
  HandReport,
  Phase,
  ShowcaseSnapshot,
  TrackedHand,
} from './types.ts'
import { wrapIndex } from '../data/pokemon.ts'
import { holdMsFor, palmAngle } from './gestures.ts'

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
  private lastAnchorX: number | null = null
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
  private lastHands: TrackedHand[] = []

  constructor(rosterLength: number, now = 0, startIndex = 0) {
    this.rosterLength = rosterLength
    this.index = wrapIndex(startIndex, rosterLength)
    this.pendingIndex = this.index
    this.phaseStarted = now
    this.lastNow = now
  }

  getSnapshot(now = this.lastNow): ShowcaseSnapshot {
    const { anchor, control } = this.pickHands(this.lastHands)
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
      handsDetected: this.lastHands.length > 0,
      labelVisible: this.phase === 'holding',
      pinchActive: this.pinchActive,
      pinchDelta: this.pinchDelta,
      trackingLost: this.lostSince !== null,
      hint: this.hint(control),
      handReports: this.reports(anchor, control),
    }
  }

  summon(now: number, hand: Handedness = 'Right'): ShowcaseSnapshot {
    if (this.phase !== 'idle') return this.finish(now)
    this.anchor = hand
    this.setPhase('summoning', now)
    this.firePulse()
    return this.finish(now)
  }

  cycle(now: number, direction: 1 | -1): ShowcaseSnapshot {
    if (this.phase !== 'holding') return this.finish(now)
    this.beginSwap(now, direction)
    return this.finish(now)
  }

  reset(now: number): ShowcaseSnapshot {
    this.anchor = null
    this.lastAnchorX = null
    this.cubeSolid = false
    this.pinchActive = false
    this.pinchDelta = 0
    this.lastPinchAngle = null
    this.lostSince = null
    this.wristHistory = []
    this.setPhase('idle', now)
    this.firePulse()
    return this.finish(now)
  }

  update(now: number, hands: TrackedHand[]): ShowcaseSnapshot {
    const dt = Math.max(0, now - this.lastNow)
    this.lastNow = now
    this.lastHands = hands
    this.pulse = Math.max(0, this.pulse - (dt / 1000) * PULSE_DECAY)

    this.updateHolds(dt, hands)
    const { anchor, control } = this.pickHands(hands)

    const bothPalms =
      hands.length >= 2 &&
      hands.every((hand) => this.committed.get(hand.handedness) === 'open_palm' || hand.gesture === 'open_palm') &&
      hands.every((hand) => (this.hold.get(hand.handedness)?.ms ?? 0) >= holdMsFor('open_palm') * 0.6)
    if (bothPalms && this.phase !== 'idle') {
      return this.reset(now)
    }

    if (this.phase === 'idle') {
      const pointer = hands.find((hand) => this.committed.get(hand.handedness) === 'point' || this.isHeld(hand, 'point'))
      if (pointer) {
        this.anchor = pointer.handedness
        this.lastAnchorX = pointer.wrist.x
        this.setPhase('summoning', now)
        this.firePulse()
      }
      this.lostSince = null
      return this.finish(now)
    }

    if (anchor) {
      this.lastAnchorX = anchor.wrist.x
      this.lostSince = null
    } else {
      if (this.lostSince === null) this.lostSince = now
      if (now - this.lostSince > TRACKING_GRACE_MS) {
        return this.reset(now)
      }
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

    if (this.phase === 'holding' && anchor) {
      const palmHeld = this.isHeld(anchor, 'open_palm') && now - this.holdingSince > 900
      if (palmHeld && !control) {
        return this.reset(now)
      }

      this.cubeSolid = Boolean(control && (control.gesture === 'fist' || this.committed.get(control.handedness) === 'fist'))

      if (now - this.holdingSince >= CATCH_HOLD_MS && this.lastCaughtIndex !== this.index) {
        this.caught.add(this.index)
        this.lastCaughtIndex = this.index
      }

      const pinchHand = control ?? anchor
      this.updatePinch(pinchHand)
      this.updateSwipe(now, control)
    } else {
      this.cubeSolid = false
      this.pinchActive = false
      this.lastPinchAngle = null
    }

    return this.finish(now)
  }

  private pickHands(hands: TrackedHand[]): { anchor?: TrackedHand; control?: TrackedHand } {
    if (hands.length === 0) return {}
    if (this.phase === 'idle' || this.anchor === null) return {}
    if (hands.length === 1) return { anchor: hands[0] }

    let anchor: TrackedHand | undefined
    if (this.lastAnchorX !== null) {
      anchor = hands.reduce((best, hand) =>
        Math.abs(hand.wrist.x - (this.lastAnchorX ?? 0)) < Math.abs(best.wrist.x - (this.lastAnchorX ?? 0))
          ? hand
          : best,
      )
    } else {
      anchor = hands.find((hand) => hand.handedness === this.anchor) ?? hands[0]
    }
    const control = hands.find((hand) => hand !== anchor)
    return { anchor, control }
  }

  private isHeld(hand: TrackedHand, gesture: Gesture): boolean {
    if (this.committed.get(hand.handedness) === gesture) return true
    const hold = this.hold.get(hand.handedness)
    return Boolean(hold && hold.gesture === gesture && hold.ms >= holdMsFor(gesture))
  }

  private updateHolds(dt: number, hands: TrackedHand[]): void {
    const seen = new Set<Handedness>()
    for (const hand of hands) {
      seen.add(hand.handedness)
      const current = this.hold.get(hand.handedness)
      if (hand.gesture === 'unknown') {
        continue
      }
      if (current && current.gesture === hand.gesture) {
        current.ms += dt
      } else {
        this.hold.set(hand.handedness, { gesture: hand.gesture, ms: dt })
      }
      const held = this.hold.get(hand.handedness)
      if (held && held.ms >= holdMsFor(held.gesture)) {
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
    if (!control) {
      this.wristHistory = []
      return
    }
    const fistLike =
      control.gesture === 'fist' ||
      this.committed.get(control.handedness) === 'fist' ||
      (control.extendedCount <= 1 && control.gesture !== 'open_palm' && control.gesture !== 'point')
    if (!fistLike) {
      this.wristHistory = []
      return
    }
    if (now < this.swipeCooldownUntil) return

    this.wristHistory.push({ t: now, x: 1 - control.wrist.x })
    this.wristHistory = this.wristHistory.filter((sample) => now - sample.t <= SWIPE_WINDOW_MS)
    if (this.wristHistory.length < 2) return

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

  private hint(control?: TrackedHand): string {
    const n = this.lastHands.length
    if (this.phase === 'idle') {
      if (n === 0) return 'Show a hand — point your index finger to summon'
      if (this.lastHands.some((hand) => hand.gesture === 'point')) return 'Hold the point…'
      return 'Point one index finger up to summon'
    }
    if (this.phase === 'summoning') return 'Summoning… keep that hand in view'
    if (this.phase === 'dissolving' || this.phase === 'materializing') return 'Switching Pokémon…'
    if (n === 0) return 'Hand lost — hold still, cube will wait a moment'
    if (!control) return 'Bring your other hand in. Fist, then swipe to switch'
    if (control.gesture === 'fist' || control.extendedCount <= 1) return 'Swipe left or right to switch'
    return 'Other hand: close a fist and swipe to switch'
  }

  private reports(anchor?: TrackedHand, control?: TrackedHand): HandReport[] {
    return this.lastHands.map((hand) => ({
      handedness: hand.handedness,
      gesture: hand.gesture,
      role: hand === anchor ? 'holder' : hand === control ? 'switcher' : 'free',
    }))
  }

  private finish(now: number): ShowcaseSnapshot {
    return this.getSnapshot(now)
  }
}
