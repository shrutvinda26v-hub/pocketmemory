import { analyzeHand, poseHand } from './gestures.ts'
import type { TrackedHand } from './types.ts'

const LOOP = 16

export function demoHands(timeSec: number): TrackedHand[] {
  const cycle = timeSec % LOOP
  const bobX = Math.sin(timeSec * 0.55) * 0.07
  const bobY = Math.cos(timeSec * 0.4) * 0.05

  if (cycle < 1.5 || cycle > 14.6) return []

  const anchorOrigin = { x: 0.68 + bobX, y: 0.58 + bobY, z: 0 }
  const controlOrigin = { x: 0.28 + bobX * 0.4, y: 0.62 - bobY * 0.3, z: 0 }

  let anchorPose: Parameters<typeof poseHand>[0]['gesture'] = 'relax'
  let control: ReturnType<typeof poseHand> | null = null
  let controlHandedness: TrackedHand['handedness'] = 'Left'
  let controlGesture: TrackedHand['gesture'] = 'unknown'

  if (cycle < 2.6) {
    anchorPose = 'point'
  } else if (cycle < 7.2) {
    anchorPose = 'relax'
  } else if (cycle < 8.7) {
    anchorPose = 'relax'
    const local = cycle - 7.15
    const swipe = Math.max(0, Math.min(1, (local - 0.48) / 0.42))
    control = poseHand({
      gesture: 'fist',
      origin: { x: 0.48 - swipe * 0.26, y: 0.6, z: 0 },
      handedness: 'Left',
    })
    controlGesture = 'fist'
  } else if (cycle < 13.2) {
    anchorPose = 'relax'
    if (cycle > 11.6) {
      control = poseHand({
        gesture: 'pinch',
        origin: controlOrigin,
        handedness: 'Left',
      })
      controlGesture = 'pinch'
    }
  } else {
    anchorPose = 'open_palm'
    control = poseHand({
      gesture: 'open_palm',
      origin: controlOrigin,
      handedness: 'Left',
    })
    controlGesture = 'open_palm'
    controlHandedness = 'Left'
  }

  const anchorLandmarks = poseHand({
    gesture: anchorPose,
    origin: anchorOrigin,
    handedness: 'Right',
  })
  const anchorAnalysis = analyzeHand(anchorLandmarks)
  const hands: TrackedHand[] = [
    {
      handedness: 'Right',
      landmarks: anchorLandmarks,
      gesture: anchorAnalysis.gesture,
      wrist: anchorLandmarks[0] ?? anchorOrigin,
      pinchDistance: anchorAnalysis.pinchDistance,
      extendedCount: anchorAnalysis.extendedCount,
    },
  ]

  if (control) {
    const analysis = analyzeHand(control)
    hands.push({
      handedness: controlHandedness,
      landmarks: control,
      gesture: controlGesture === 'unknown' ? analysis.gesture : controlGesture,
      wrist: control[0] ?? controlOrigin,
      pinchDistance: analysis.pinchDistance,
      extendedCount: analysis.extendedCount,
    })
  }

  return hands
}
