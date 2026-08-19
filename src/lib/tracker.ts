import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision'
import { blendshapeMap, lerpLandmarks, palmSize, thumbMiddleGap } from './landmarks.ts'
import type { FaceSample, HandSample, Landmark, TrackingFrame } from './types.ts'

let facePromise: Promise<FaceLandmarker> | null = null
let handPromise: Promise<HandLandmarker> | null = null
let lastFaceTs = 0
let lastHandTs = 0
let smoothFace: Landmark[] | null = null
let smoothBlend: Record<string, number> = {}
const smoothHands = new Map<string, Landmark[]>()

async function vision(): Promise<Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>> {
  return FilesetResolver.forVisionTasks('/mediapipe/wasm')
}

async function withDelegate<T>(
  create: (delegate: 'GPU' | 'CPU') => Promise<T>,
): Promise<T> {
  try {
    return await create('GPU')
  } catch {
    return create('CPU')
  }
}

async function createFace(): Promise<FaceLandmarker> {
  const fileset = await vision()
  return withDelegate((delegate) =>
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: '/models/face_landmarker.task',
        delegate,
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
      minFaceDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4,
      minFacePresenceConfidence: 0.4,
    }),
  )
}

async function createHands(): Promise<HandLandmarker> {
  const fileset = await vision()
  return withDelegate((delegate) =>
    HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: '/models/hand_landmarker.task',
        delegate,
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4,
      minHandPresenceConfidence: 0.4,
    }),
  )
}

export function preloadTracker(): Promise<[FaceLandmarker, HandLandmarker]> {
  facePromise ??= createFace()
  handPromise ??= createHands()
  return Promise.all([facePromise, handPromise])
}

function mixBlend(prev: Record<string, number>, next: Record<string, number>, amount: number): Record<string, number> {
  const out: Record<string, number> = { ...next }
  for (const key of Object.keys(next)) {
    const a = prev[key] ?? next[key] ?? 0
    const b = next[key] ?? 0
    out[key] = a + (b - a) * amount
  }
  return out
}

export function detectTracking(
  faceLm: FaceLandmarker,
  handLm: HandLandmarker,
  video: HTMLVideoElement,
  now: number,
): TrackingFrame {
  if (video.readyState < 2) {
    return { face: null, hands: [], faceActive: false, handsActive: false }
  }

  const faceTs = Math.max(now, lastFaceTs + 1)
  lastFaceTs = faceTs
  const faceResult = faceLm.detectForVideo(video, faceTs)
  const rawFace = faceResult.faceLandmarks[0]
  let face: FaceSample | null = null
  if (rawFace && rawFace.length > 300) {
    const mapped = rawFace.map((p) => ({ x: p.x, y: p.y, z: p.z ?? 0 }))
    const landmarks = smoothFace ? lerpLandmarks(smoothFace, mapped, 0.42) : mapped
    smoothFace = landmarks
    const categories = faceResult.faceBlendshapes[0]?.categories
    const blends = mixBlend(smoothBlend, blendshapeMap(categories), 0.38)
    smoothBlend = blends
    face = { landmarks, blendshapes: blends }
  } else {
    smoothFace = null
    smoothBlend = {}
  }

  const handTs = Math.max(now + 0.5, lastHandTs + 1)
  lastHandTs = handTs
  const handResult = handLm.detectForVideo(video, handTs)
  const hands: HandSample[] = []
  const used = new Set<string>()
  for (let i = 0; i < handResult.landmarks.length; i += 1) {
    const raw = handResult.landmarks[i]
    if (!raw || raw.length < 21) continue
    const entry = handResult.handedness[i]
    const category = Array.isArray(entry) ? entry[0] : entry
    const handed = category?.categoryName === 'Left' ? 'L' : 'R'
    let id = `${handed}${i}`
    if (used.has(id)) id = `${id}b`
    used.add(id)
    const mapped = raw.map((p) => ({ x: p.x, y: p.y, z: p.z ?? 0 }))
    const prior = smoothHands.get(id)
    const landmarks = prior ? lerpLandmarks(prior, mapped, 0.5) : mapped
    smoothHands.set(id, landmarks)
    hands.push({
      id,
      landmarks,
      palm: palmSize(landmarks),
      thumbMiddle: thumbMiddleGap(landmarks),
    })
  }
  for (const key of [...smoothHands.keys()]) {
    if (!used.has(key)) smoothHands.delete(key)
  }

  return { face, hands, faceActive: Boolean(face), handsActive: hands.length > 0 }
}
