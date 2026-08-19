import { describe, expect, it } from 'vitest'
import { BlowDetector, blowScore, isTalking, sampleMouth } from './blowDetector.ts'
import type { FaceSample, Landmark, MouthSample } from './types.ts'

function point(x: number, y: number, z = 0): Landmark {
  return { x, y, z }
}

function faceWithMouth(aperture: number, width: number, shapes: Record<string, number> = {}): FaceSample {
  const landmarks: Landmark[] = Array.from({ length: 478 }, () => point(0.5, 0.5))
  landmarks[33] = point(0.35, 0.42)
  landmarks[263] = point(0.65, 0.42)
  const scale = 0.3
  landmarks[13] = point(0.5, 0.62 - (aperture * scale) / 2)
  landmarks[14] = point(0.5, 0.62 + (aperture * scale) / 2)
  landmarks[78] = point(0.5 - (width * scale) / 2, 0.62)
  landmarks[308] = point(0.5 + (width * scale) / 2, 0.62)
  landmarks[61] = landmarks[78]!
  landmarks[291] = landmarks[308]!
  return { landmarks, blendshapes: shapes }
}

describe('blowScore', () => {
  it('scores a sustained O-shaped mouth highly', () => {
    const sample = sampleMouth(
      faceWithMouth(0.12, 0.28, { mouthFunnel: 0.55, cheekPuff: 0.35, jawOpen: 0.18, mouthSmileLeft: 0 }),
      0,
    )
    expect(blowScore(sample)).toBeGreaterThan(0.45)
  })

  it('rejects a smile', () => {
    const sample = sampleMouth(
      faceWithMouth(0.06, 0.72, { mouthSmileLeft: 0.8, mouthSmileRight: 0.75, mouthFunnel: 0.05 }),
      0,
    )
    expect(blowScore(sample)).toBeLessThan(0.25)
  })

  it('rejects a closed-mouth pucker', () => {
    const sample = sampleMouth(faceWithMouth(0.01, 0.22, { mouthPucker: 0.8, jawOpen: 0 }), 0)
    expect(blowScore(sample)).toBeLessThan(0.12)
  })
})

describe('isTalking', () => {
  it('flags rapid jaw / aperture chatter', () => {
    const history: MouthSample[] = []
    for (let i = 0; i < 10; i += 1) {
      const open = i % 2 === 0 ? 0.04 : 0.16
      history.push({
        now: i * 40,
        funnel: 0.1,
        pucker: 0,
        puff: 0,
        jawOpen: open,
        smile: 0.1,
        aperture: open,
        width: 0.5,
        roundness: 0.3,
        present: true,
      })
    }
    expect(isTalking(history)).toBe(true)
  })
})

describe('BlowDetector', () => {
  it('does not fire on a brief mouth opening', () => {
    const detector = new BlowDetector()
    const face = faceWithMouth(0.12, 0.28, { mouthFunnel: 0.6, cheekPuff: 0.4, jawOpen: 0.15 })
    let fired = false
    for (let t = 0; t < 120; t += 16) {
      fired = detector.update(face, t).fired || fired
    }
    expect(fired).toBe(false)
  })

  it('fires after a confirmed blow pose', () => {
    const detector = new BlowDetector()
    const face = faceWithMouth(0.12, 0.28, { mouthFunnel: 0.62, cheekPuff: 0.42, jawOpen: 0.16 })
    let fired = false
    for (let t = 0; t <= 360; t += 16) {
      fired = detector.update(face, t).fired || fired
    }
    expect(fired).toBe(true)
  })

  it('ignores talking that happens to open the mouth', () => {
    const detector = new BlowDetector()
    let fired = false
    for (let t = 0; t <= 400; t += 16) {
      const open = t % 64 < 32
      const face = faceWithMouth(open ? 0.14 : 0.03, 0.5, {
        jawOpen: open ? 0.45 : 0.08,
        mouthFunnel: 0.12,
      })
      fired = detector.update(face, t).fired || fired
    }
    expect(fired).toBe(false)
  })
})
