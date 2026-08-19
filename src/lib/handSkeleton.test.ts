import { describe, expect, it } from 'vitest'
import { HAND_BONES, landmarkToCanvas } from './handSkeleton.ts'

describe('hand skeleton', () => {
  it('only connects valid 21-point landmark indices', () => {
    for (const [a, b] of HAND_BONES) {
      expect(a).toBeGreaterThanOrEqual(0)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(a).toBeLessThan(21)
      expect(b).toBeLessThan(21)
    }
    expect(HAND_BONES.length).toBe(21)
  })

  it('maps a centered landmark into the canvas when cover-scaling a wide video', () => {
    const point = landmarkToCanvas({ x: 0.5, y: 0.5, z: 0 }, 1280, 720, 188, 188)
    expect(point.x).toBeCloseTo(94, 0)
    expect(point.y).toBeCloseTo(94, 0)
  })
})
