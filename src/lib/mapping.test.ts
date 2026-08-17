import { describe, expect, it } from 'vitest'
import { handBounds, landmarkToWorld, worldToScreen } from './mapping.ts'

describe('mapping', () => {
  const options = {
    viewportW: 1000,
    viewportH: 1000,
    videoW: 1000,
    videoH: 1000,
    frustumHeight: 2,
    mirror: true,
  }

  it('mirrors landmark x into world space', () => {
    const left = landmarkToWorld({ x: 0, y: 0.5, z: 0 }, options)
    const right = landmarkToWorld({ x: 1, y: 0.5, z: 0 }, options)
    expect(left.x).toBeGreaterThan(right.x)
    expect(left.y).toBeCloseTo(0, 5)
  })

  it('round-trips world points to screen center', () => {
    const screen = worldToScreen({ x: 0, y: 0, z: 0 }, 1000, 1000, 2)
    expect(screen.x).toBeCloseTo(500, 5)
    expect(screen.y).toBeCloseTo(500, 5)
  })

  it('pads a hand bounding box from landmark points', () => {
    const bounds = handBounds([
      { x: -0.1, y: -0.1, z: 0 },
      { x: 0.1, y: 0.2, z: 0.05 },
    ])
    expect(bounds.center.x).toBeCloseTo(0, 5)
    expect(bounds.size.y).toBeGreaterThan(0.18)
  })
})
