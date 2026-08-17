import type { Landmark } from './types.ts'

export const FRUSTUM_HEIGHT = 2

export interface MappingOptions {
  viewportW: number
  viewportH: number
  videoW: number
  videoH: number
  frustumHeight: number
  mirror: boolean
}

export interface WorldPoint {
  x: number
  y: number
  z: number
}

function coverPlacement(
  viewportW: number,
  viewportH: number,
  videoW: number,
  videoH: number,
): { displayedW: number; displayedH: number; offsetX: number; offsetY: number } {
  if (videoW <= 0 || videoH <= 0) {
    return { displayedW: viewportW, displayedH: viewportH, offsetX: 0, offsetY: 0 }
  }
  const videoAspect = videoW / videoH
  const viewAspect = viewportW / viewportH
  if (viewAspect > videoAspect) {
    const displayedW = viewportW
    const displayedH = viewportW / videoAspect
    return { displayedW, displayedH, offsetX: 0, offsetY: (viewportH - displayedH) / 2 }
  }
  const displayedH = viewportH
  const displayedW = viewportH * videoAspect
  return { displayedW, displayedH, offsetX: (viewportW - displayedW) / 2, offsetY: 0 }
}

export function landmarkToWorld(landmark: Landmark, options: MappingOptions): WorldPoint {
  const { displayedW, displayedH, offsetX, offsetY } = coverPlacement(
    options.viewportW,
    options.viewportH,
    options.videoW,
    options.videoH,
  )
  const nx = options.mirror ? 1 - landmark.x : landmark.x
  const px = nx * displayedW + offsetX
  const py = landmark.y * displayedH + offsetY
  const ndcX = options.viewportW === 0 ? 0 : (px / options.viewportW) * 2 - 1
  const ndcY = options.viewportH === 0 ? 0 : 1 - (py / options.viewportH) * 2
  const aspect = options.viewportH === 0 ? 1 : options.viewportW / options.viewportH
  const halfH = options.frustumHeight / 2
  return {
    x: ndcX * halfH * aspect,
    y: ndcY * halfH,
    z: -landmark.z * halfH * 1.4,
  }
}

export function worldToScreen(
  point: WorldPoint,
  viewportW: number,
  viewportH: number,
  frustumHeight: number,
): { x: number; y: number } {
  const aspect = viewportH === 0 ? 1 : viewportW / viewportH
  const halfH = frustumHeight / 2
  const ndcX = halfH === 0 || aspect === 0 ? 0 : point.x / (halfH * aspect)
  const ndcY = halfH === 0 ? 0 : point.y / halfH
  return {
    x: (ndcX * 0.5 + 0.5) * viewportW,
    y: (1 - (ndcY * 0.5 + 0.5)) * viewportH,
  }
}

export function handBounds(points: WorldPoint[]): {
  center: WorldPoint
  size: WorldPoint
} {
  if (points.length === 0) {
    return { center: { x: 0, y: 0, z: 0 }, size: { x: 0.4, y: 0.4, z: 0.4 } }
  }
  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  for (const point of points) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    minZ = Math.min(minZ, point.z)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
    maxZ = Math.max(maxZ, point.z)
  }
  const sizeX = Math.max(0.18, maxX - minX)
  const sizeY = Math.max(0.18, maxY - minY)
  const sizeZ = Math.max(0.16, maxZ - minZ)
  return {
    center: {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      z: (minZ + maxZ) / 2,
    },
    size: { x: sizeX, y: sizeY, z: sizeZ },
  }
}
