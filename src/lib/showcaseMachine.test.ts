import { describe, expect, it } from 'vitest'
import { pinchDistance, poseHand } from './gestures.ts'
import { ShowcaseMachine } from './showcaseMachine.ts'
import { DISSOLVE_MS, GESTURE_HOLD_MS, MATERIALIZE_MS, SUMMON_MS } from './types.ts'
import type { Gesture, Handedness, TrackedHand } from './types.ts'

function hand(gesture: Gesture | 'relax', handedness: Handedness, x = 0.6): TrackedHand {
  const mapped = gesture === 'relax' ? 'unknown' : gesture
  const landmarks = poseHand({
    gesture,
    origin: { x, y: 0.55, z: 0 },
    handedness,
  })
  return {
    handedness,
    landmarks,
    gesture: mapped === 'unknown' ? 'unknown' : mapped,
    wrist: landmarks[0] ?? { x, y: 0.55, z: 0 },
    pinchDistance: pinchDistance(landmarks),
  }
}

function step(machine: ShowcaseMachine, start: number, ms: number, hands: TrackedHand[]) {
  let now = start
  let snap = machine.getSnapshot(now)
  const end = start + ms
  while (now <= end) {
    snap = machine.update(now, hands)
    now += 40
  }
  return { snap, now }
}

describe('ShowcaseMachine', () => {
  it('summons from a held point and settles into holding', () => {
    const machine = new ShowcaseMachine(18, 0)
    const pointing = [hand('point', 'Right', 0.7)]
    const afterHold = step(machine, 0, GESTURE_HOLD_MS + 80, pointing)
    expect(afterHold.snap.phase).toBe('summoning')
    expect(afterHold.snap.anchorHand).toBe('Right')

    const afterSummon = step(machine, afterHold.now, SUMMON_MS + 80, [hand('relax', 'Right', 0.7)])
    expect(afterSummon.snap.phase).toBe('holding')
    expect(afterSummon.snap.labelVisible).toBe(true)
  })

  it('cycles the roster on a control-hand fist swipe', () => {
    const machine = new ShowcaseMachine(18, 0)
    machine.summon(0, 'Right')
    step(machine, 10, SUMMON_MS + 40, [hand('relax', 'Right', 0.7)])

    const heldFist = step(machine, SUMMON_MS + 80, GESTURE_HOLD_MS + 80, [
      hand('relax', 'Right', 0.7),
      hand('fist', 'Left', 0.55),
    ])
    let now = heldFist.now
    for (let i = 0; i < 16; i += 1) {
      const x = 0.55 - i * 0.02
      machine.update(now, [hand('relax', 'Right', 0.7), hand('fist', 'Left', x)])
      now += 30
    }
    const snap = machine.getSnapshot(now)
    expect(snap.phase).toBe('dissolving')
    expect(snap.pendingIndex).toBe(1)
  })

  it('wraps the roster index backward', () => {
    const machine = new ShowcaseMachine(18, 0)
    machine.summon(0)
    step(machine, 0, SUMMON_MS + 40, [hand('relax', 'Right')])
    const snap = machine.cycle(SUMMON_MS + 80, -1)
    expect(snap.pendingIndex).toBe(17)
    expect(snap.phase).toBe('dissolving')
  })

  it('resets when both palms are held', () => {
    const machine = new ShowcaseMachine(18, 0)
    machine.summon(0, 'Right')
    step(machine, 0, SUMMON_MS + 40, [hand('relax', 'Right')])
    const after = step(machine, SUMMON_MS + 80, GESTURE_HOLD_MS + 80, [
      hand('open_palm', 'Right', 0.7),
      hand('open_palm', 'Left', 0.3),
    ])
    expect(after.snap.phase).toBe('idle')
    expect(after.snap.anchorHand).toBeNull()
  })

  it('keeps holding through a short tracking gap, then idles after the grace window', () => {
    const machine = new ShowcaseMachine(18, 0)
    machine.summon(0, 'Right')
    const held = step(machine, 0, SUMMON_MS + 40, [hand('relax', 'Right')])
    expect(held.snap.phase).toBe('holding')

    const briefLoss = step(machine, held.now, 300, [])
    expect(briefLoss.snap.phase).toBe('holding')

    const longLoss = step(machine, briefLoss.now, 900, [])
    expect(longLoss.snap.phase).toBe('idle')
  })

  it('materializes the next pokemon after dissolve', () => {
    const machine = new ShowcaseMachine(18, 0)
    machine.summon(0)
    step(machine, 0, SUMMON_MS + 20, [hand('relax', 'Right')])
    machine.cycle(SUMMON_MS + 40, 1)
    const afterDissolve = step(machine, SUMMON_MS + 40, DISSOLVE_MS + 40, [hand('relax', 'Right')])
    expect(afterDissolve.snap.phase).toBe('materializing')
    expect(afterDissolve.snap.index).toBe(1)
    const afterMat = step(machine, afterDissolve.now, MATERIALIZE_MS + 40, [hand('relax', 'Right')])
    expect(afterMat.snap.phase).toBe('holding')
  })
})
