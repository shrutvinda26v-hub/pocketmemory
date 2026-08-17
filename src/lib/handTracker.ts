import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { classifyGesture, pinchDistance } from './gestures.ts'
import type { Handedness, Landmark, TrackedHand } from './types.ts'

let landmarkerPromise: Promise<HandLandmarker> | null = null
let lastTimestamp = 0

async function createLandmarker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
  const options = {
    baseOptions: {
      modelAssetPath: '/models/hand_landmarker.task',
      delegate: 'GPU' as const,
    },
    runningMode: 'VIDEO' as const,
    numHands: 2,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.5,
  }
  try {
    return await HandLandmarker.createFromOptions(vision, options)
  } catch {
    return HandLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: 'CPU' },
    })
  }
}

export function getHandLandmarker(): Promise<HandLandmarker> {
  landmarkerPromise ??= createLandmarker()
  return landmarkerPromise
}

function readHandedness(
  handedness: { categoryName?: string }[][] | { categoryName?: string }[] | undefined,
  index: number,
): Handedness {
  const entry = handedness?.[index]
  const category = Array.isArray(entry) ? entry[0] : entry
  return category?.categoryName === 'Left' ? 'Left' : 'Right'
}

export function detectTrackedHands(
  landmarker: HandLandmarker,
  video: HTMLVideoElement,
  now: number,
): TrackedHand[] {
  if (video.readyState < 2) return []
  const timestamp = Math.max(now, lastTimestamp + 1)
  lastTimestamp = timestamp
  const result = landmarker.detectForVideo(video, timestamp)
  const hands: TrackedHand[] = []
  const count = result.landmarks.length
  for (let i = 0; i < count; i += 1) {
    const landmarks = (result.landmarks[i] ?? []).map((point) => ({
      x: point.x,
      y: point.y,
      z: point.z,
    })) as Landmark[]
    if (landmarks.length < 21) continue
    const wrist = landmarks[0] ?? { x: 0.5, y: 0.5, z: 0 }
    hands.push({
      handedness: readHandedness(result.handedness, i),
      landmarks,
      gesture: classifyGesture(landmarks),
      wrist,
      pinchDistance: pinchDistance(landmarks),
    })
  }
  return hands
}
