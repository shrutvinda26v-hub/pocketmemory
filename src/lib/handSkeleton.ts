import type { HandSample, Landmark } from './types.ts'

/** MediaPipe 21-point hand skeleton edges. */
export const HAND_BONES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
]

const SNAP_TIPS = new Set([4, 12])
const TIPS = new Set([4, 8, 12, 16, 20])

export function landmarkToCanvas(
  point: Landmark,
  videoW: number,
  videoH: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  if (videoW <= 0 || videoH <= 0) return { x: point.x * canvasW, y: point.y * canvasH }
  const scale = Math.max(canvasW / videoW, canvasH / videoH)
  const dw = videoW * scale
  const dh = videoH * scale
  const ox = (canvasW - dw) / 2
  const oy = (canvasH - dh) / 2
  return { x: ox + point.x * dw, y: oy + point.y * dh }
}

export function drawHandSkeleton(
  canvas: HTMLCanvasElement,
  hands: HandSample[],
  video: HTMLVideoElement,
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cssW = canvas.clientWidth || 188
  const cssH = canvas.clientHeight || 188
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)
  if (hands.length === 0) return

  ctx.save()
  ctx.beginPath()
  ctx.arc(cssW / 2, cssH / 2, cssW / 2 - 2, 0, Math.PI * 2)
  ctx.clip()

  const videoW = video.videoWidth
  const videoH = video.videoHeight
  for (const hand of hands) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'rgba(255, 244, 220, 0.92)'
    ctx.lineWidth = 2.4
    ctx.shadowColor = 'rgba(255, 180, 80, 0.55)'
    ctx.shadowBlur = 6
    for (const [a, b] of HAND_BONES) {
      const pa = hand.landmarks[a]
      const pb = hand.landmarks[b]
      if (!pa || !pb) continue
      const sa = landmarkToCanvas(pa, videoW, videoH, cssW, cssH)
      const sb = landmarkToCanvas(pb, videoW, videoH, cssW, cssH)
      ctx.beginPath()
      ctx.moveTo(sa.x, sa.y)
      ctx.lineTo(sb.x, sb.y)
      ctx.stroke()
    }
    ctx.shadowBlur = 0
    for (let i = 0; i < hand.landmarks.length; i += 1) {
      const point = hand.landmarks[i]
      if (!point) continue
      const { x, y } = landmarkToCanvas(point, videoW, videoH, cssW, cssH)
      const snap = SNAP_TIPS.has(i)
      const tip = TIPS.has(i)
      ctx.beginPath()
      ctx.fillStyle = snap ? '#ffb35c' : tip ? '#fff6e4' : 'rgba(255, 236, 210, 0.95)'
      ctx.arc(x, y, snap ? 4.2 : tip ? 3.4 : 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}
