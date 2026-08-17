import * as THREE from 'three'

export interface Sample {
  x: number
  y: number
  z: number
  r: number
  g: number
  b: number
}

export interface HdFigure {
  front: THREE.BufferGeometry
  back: THREE.BufferGeometry
  texture: THREE.Texture
  normalMap: THREE.Texture
  samples: Sample[]
}

const SDF = 320
const SEG = 160
const MAX_SAMPLES = 480
const SIZE = 0.9
const THICKNESS = 0.28

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(1e-6, edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function sampleBilinear(
  data: Float32Array | Uint8ClampedArray,
  width: number,
  height: number,
  u: number,
  v: number,
  stride: number,
  channel: number,
  scale: number,
): number {
  const x = clamp01(u) * (width - 1)
  const y = clamp01(1 - v) * (height - 1)
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.min(width - 1, x0 + 1)
  const y1 = Math.min(height - 1, y0 + 1)
  const tx = x - x0
  const ty = y - y0
  const at = (sx: number, sy: number) => (data[(sy * width + sx) * stride + channel] ?? 0) * scale
  const a = at(x0, y0) * (1 - tx) + at(x1, y0) * tx
  const b = at(x0, y1) * (1 - tx) + at(x1, y1) * tx
  return a * (1 - ty) + b * ty
}

function buildSdf(alpha: Float32Array, width: number, height: number): Float32Array {
  const inf = 1e6
  const dist = new Float32Array(width * height)
  for (let i = 0; i < dist.length; i += 1) dist[i] = (alpha[i] ?? 0) > 0.06 ? inf : 0

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x
      if ((dist[i] ?? 0) === 0) continue
      let best = dist[i] ?? inf
      if (x > 0) best = Math.min(best, (dist[i - 1] ?? inf) + 1)
      if (y > 0) best = Math.min(best, (dist[i - width] ?? inf) + 1)
      if (x > 0 && y > 0) best = Math.min(best, (dist[i - width - 1] ?? inf) + 1.414)
      if (x + 1 < width && y > 0) best = Math.min(best, (dist[i - width + 1] ?? inf) + 1.414)
      dist[i] = best
    }
  }
  for (let y = height - 1; y >= 0; y -= 1) {
    for (let x = width - 1; x >= 0; x -= 1) {
      const i = y * width + x
      if ((dist[i] ?? 0) === 0) continue
      let best = dist[i] ?? inf
      if (x + 1 < width) best = Math.min(best, (dist[i + 1] ?? inf) + 1)
      if (y + 1 < height) best = Math.min(best, (dist[i + width] ?? inf) + 1)
      if (x + 1 < width && y + 1 < height) best = Math.min(best, (dist[i + width + 1] ?? inf) + 1.414)
      if (x > 0 && y + 1 < height) best = Math.min(best, (dist[i + width - 1] ?? inf) + 1.414)
      dist[i] = best
    }
  }

  let max = 1
  for (let i = 0; i < dist.length; i += 1) {
    if ((dist[i] ?? 0) >= inf) dist[i] = 0
    max = Math.max(max, dist[i] ?? 0)
  }
  for (let i = 0; i < dist.length; i += 1) dist[i] = (dist[i] ?? 0) / max
  return dist
}

function reliefHeight(alpha: number, sdf: number, lum: number): number {
  const envelope = smoothstep(0.04, 0.2, alpha)
  return envelope * (0.03 + sdf * THICKNESS * (0.4 + lum * 0.6))
}

function makeColorTexture(image: HTMLImageElement, anisotropy: number): THREE.Texture {
  const texture = new THREE.Texture(image)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.max(1, anisotropy)
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return texture
}

function makeNormalMap(height: Float32Array, width: number, heightPx: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = heightPx
  const ctx = canvas.getContext('2d')
  const image = ctx?.createImageData(width, heightPx) ?? null
  const strength = 4.2
  if (image) {
    for (let y = 0; y < heightPx; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const xm = Math.max(0, x - 1)
        const xp = Math.min(width - 1, x + 1)
        const ym = Math.max(0, y - 1)
        const yp = Math.min(heightPx - 1, y + 1)
        const dx = ((height[y * width + xp] ?? 0) - (height[y * width + xm] ?? 0)) * strength
        const dy = ((height[yp * width + x] ?? 0) - (height[ym * width + x] ?? 0)) * strength
        const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1)
        const i = (y * width + x) * 4
        image.data[i] = Math.round((-dx * inv * 0.5 + 0.5) * 255)
        image.data[i + 1] = Math.round((dy * inv * 0.5 + 0.5) * 255)
        image.data[i + 2] = Math.round((inv * 0.5 + 0.5) * 255)
        image.data[i + 3] = 255
      }
    }
    ctx?.putImageData(image, 0, 0)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.NoColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return texture
}

function emptyFigure(image: HTMLImageElement, anisotropy: number): HdFigure {
  const plane = new THREE.PlaneGeometry(SIZE, SIZE)
  return {
    front: plane,
    back: plane.clone(),
    texture: makeColorTexture(image, anisotropy),
    normalMap: makeNormalMap(new Float32Array(4), 2, 2),
    samples: [{ x: 0, y: 0, z: 0, r: 1, g: 1, b: 1 }],
  }
}

function flipBack(geometry: THREE.BufferGeometry): void {
  const pos = geometry.attributes.position
  const index = geometry.getIndex()
  if (pos) {
    for (let i = 0; i < pos.count; i += 1) pos.setZ(i, -pos.getZ(i))
    pos.needsUpdate = true
  }
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i)
      const c = index.getX(i + 2)
      index.setX(i, c)
      index.setX(i + 2, a)
    }
    index.needsUpdate = true
  }
  geometry.computeVertexNormals()
}

export function buildHdFigure(image: HTMLImageElement, anisotropy = 16): HdFigure {
  const canvas = document.createElement('canvas')
  canvas.width = SDF
  canvas.height = SDF
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return emptyFigure(image, anisotropy)

  ctx.clearRect(0, 0, SDF, SDF)
  ctx.drawImage(image, 0, 0, SDF, SDF)
  const { data } = ctx.getImageData(0, 0, SDF, SDF)
  const alpha = new Float32Array(SDF * SDF)
  const height = new Float32Array(SDF * SDF)
  for (let i = 0; i < SDF * SDF; i += 1) {
    alpha[i] = (data[i * 4 + 3] ?? 0) / 255
  }
  const sdf = buildSdf(alpha, SDF, SDF)
  for (let i = 0; i < SDF * SDF; i += 1) {
    const lum =
      ((data[i * 4] ?? 0) + (data[i * 4 + 1] ?? 0) + (data[i * 4 + 2] ?? 0)) / (3 * 255)
    height[i] = reliefHeight(alpha[i] ?? 0, sdf[i] ?? 0, lum)
  }

  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  if (!pos || !uv) return emptyFigure(image, anisotropy)

  for (let i = 0; i < pos.count; i += 1) {
    const u = uv.getX(i)
    const v = uv.getY(i)
    const h = sampleBilinear(height, SDF, SDF, u, v, 1, 0, 1)
    pos.setZ(i, h)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()

  const back = geo.clone()
  flipBack(back)

  const samples: Sample[] = []
  const step = 4
  for (let y = 0; y < SDF; y += step) {
    for (let x = 0; x < SDF; x += step) {
      const i = (y * SDF + x) * 4
      if ((data[i + 3] ?? 0) < 90) continue
      samples.push({
        x: (x / SDF - 0.5) * SIZE,
        y: -(y / SDF - 0.5) * SIZE,
        z: (height[y * SDF + x] ?? 0) * 0.35,
        r: (data[i] ?? 255) / 255,
        g: (data[i + 1] ?? 255) / 255,
        b: (data[i + 2] ?? 255) / 255,
      })
    }
  }

  let out = samples
  if (samples.length > MAX_SAMPLES) {
    out = []
    const stride = samples.length / MAX_SAMPLES
    for (let i = 0; i < MAX_SAMPLES; i += 1) {
      const sample = samples[Math.floor(i * stride)]
      if (sample) out.push(sample)
    }
  }
  if (out.length === 0) out = [{ x: 0, y: 0, z: 0, r: 1, g: 1, b: 1 }]

  return {
    front: geo,
    back,
    texture: makeColorTexture(image, anisotropy),
    normalMap: makeNormalMap(height, SDF, SDF),
    samples: out,
  }
}
