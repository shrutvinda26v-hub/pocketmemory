import { describe, expect, it } from 'vitest'
import { SnapDetector, handFromLandmarks, poseSnapHand } from './snapDetector.ts'

function run(detector: SnapDetector, gaps: { t: number; gap: number }[]): boolean {
  let fired = false
  for (const step of gaps) {
    const hand = handFromLandmarks('R', poseSnapHand(step.gap))
    fired = detector.update([hand], step.t).fired || fired
  }
  return fired
}

describe('SnapDetector', () => {
  it('detects a quick close-then-flick snap', () => {
    const detector = new SnapDetector()
    const fired = run(detector, [
      { t: 0, gap: 0.55 },
      { t: 16, gap: 0.4 },
      { t: 32, gap: 0.12 },
      { t: 48, gap: 0.1 },
      { t: 64, gap: 0.22 },
      { t: 80, gap: 0.48 },
      { t: 96, gap: 0.62 },
    ])
    expect(fired).toBe(true)
  })

  it('does not treat a slow pinch-and-release as a snap', () => {
    const detector = new SnapDetector()
    const steps: { t: number; gap: number }[] = [{ t: 0, gap: 0.5 }]
    for (let t = 16; t <= 400; t += 16) {
      steps.push({ t, gap: 0.11 })
    }
    for (let t = 416; t <= 700; t += 16) {
      const k = (t - 416) / 284
      steps.push({ t, gap: 0.11 + k * 0.45 })
    }
    expect(run(detector, steps)).toBe(false)
  })

  it('applies a cooldown so one snap cannot fire twice', () => {
    const detector = new SnapDetector()
    const sequence = [
      { t: 0, gap: 0.5 },
      { t: 16, gap: 0.12 },
      { t: 32, gap: 0.1 },
      { t: 48, gap: 0.5 },
    ]
    expect(run(detector, sequence)).toBe(true)
    const second = run(detector, [
      { t: 80, gap: 0.5 },
      { t: 96, gap: 0.12 },
      { t: 112, gap: 0.1 },
      { t: 128, gap: 0.55 },
    ])
    expect(second).toBe(false)
  })
})
