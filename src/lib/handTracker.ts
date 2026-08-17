import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { analyzeHand } from './gestures.ts'
import type { Handedness, Landmark, TrackedHand } from './types.ts'

let landmarkerPromise: Promise<HandLandmarker> | null = null
let lastTimestamp = 0
const smoothSlots = new Map<string, Landmark[]>()

async function createLandmarker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
  const options = {
    baseOptions: {
      modelAssetPath: '/models/hand_landmarker.task',
      delegate: 'GPU' as const,
    },
    runningMode: 'VIDEO' as const,
    numHands: 2,
    minHandDetectionConfidence: 0.35,
    minHandPresenceConfidence: 0.35,
    minTrackingConfidence: 0.35,
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

function lerpLandmarks(prev: Landmark[], next: Landmark[], amount: number): Landmark[] {
  return next.map((point, index) => {
    const prior = prev[index]
    if (!prior) return { x: point.x, y: point.y, z: point.z }
    return {
      x: prior.x + (point.x - prior.x) * amount,
      y: prior.y + (point.y - prior.y) * amount,
      z: prior.z + (point.z - prior.z) * amount,
    }
  })
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
  const used = new Set<string>()
  const count = result.landmarks.length
  for (let i = 0; i < count; i += 1) {
    const raw = (result.landmarks[i] ?? []).map((point) => ({
      x: point.x,
      y: point.y,
      z: point.z,
    })) as Landmark[]
    if (raw.length < 21) continue
    const wrist = raw[0] ?? { x: 0.5, y: 0.5, z: 0 }
    let slot = wrist.x < 0.5 ? 'a' : 'b'
    if (used.has(slot)) slot = slot === 'a' ? 'b' : 'a'
    used.add(slot)
    const prior = smoothSlots.get(slot)
    const landmarks = prior ? lerpLandmarks(prior, raw, 0.55) : raw
    smoothSlots.set(slot, landmarks)
    const analysis = analyzeHand(landmarks)
    hands.push({
      handedness: readHandedness(result.handedness, i),
      landmarks,
      gesture: analysis.gesture,
      wrist: landmarks[0] ?? wrist,
      pinchDistance: analysis.pinchDistance,
      extendedCount: analysis.extendedCount,
    })
  }
  for (const key of [...smoothSlots.keys()]) {
    if (!used.has(key)) smoothSlots.delete(key)
  }
  return hands
}
