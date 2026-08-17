import { describe, expect, it } from 'vitest'
import { classifyGesture, pinchDistance, poseHand } from './gestures.ts'

describe('classifyGesture', () => {
  it('detects a point even when the finger is not aimed straight up', () => {
    const landmarks = poseHand({ gesture: 'point', origin: { x: 0.4, y: 0.7, z: 0.08 }, handedness: 'Left' })
    expect(classifyGesture(landmarks)).toBe('point')
  })

  it('detects a closed fist', () => {
    const landmarks = poseHand({ gesture: 'fist' })
    expect(classifyGesture(landmarks)).toBe('fist')
  })

  it('detects an open palm', () => {
    const landmarks = poseHand({ gesture: 'open_palm' })
    expect(classifyGesture(landmarks)).toBe('open_palm')
  })

  it('detects a pinch when thumb and index meet', () => {
    const landmarks = poseHand({ gesture: 'pinch' })
    expect(pinchDistance(landmarks)).toBeLessThan(0.055)
    expect(classifyGesture(landmarks)).toBe('pinch')
  })

  it('treats a two-finger relax pose as unknown', () => {
    const landmarks = poseHand({ gesture: 'relax' })
    expect(classifyGesture(landmarks)).toBe('unknown')
  })
})
