export interface Voxel {
  x: number
  y: number
  z: number
  r: number
  g: number
  b: number
}

export interface VoxelModel {
  voxels: Voxel[]
  samples: Voxel[]
  cell: number
}

const GRID = 42
const MAX_DEPTH = 5
const MAX_VOXELS = 2200
const MAX_SAMPLES = 480

export function buildVoxelModel(image: HTMLImageElement): VoxelModel {
  const canvas = document.createElement('canvas')
  canvas.width = GRID
  canvas.height = GRID
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { voxels: [], samples: [], cell: 0.018 }
  ctx.drawImage(image, 0, 0, GRID, GRID)
  const { data } = ctx.getImageData(0, 0, GRID, GRID)

  const opaque: boolean[] = new Array(GRID * GRID).fill(false)
  const rgb: [number, number, number][] = new Array(GRID * GRID)
  for (let i = 0; i < GRID * GRID; i += 1) {
    const a = data[i * 4 + 3] ?? 0
    opaque[i] = a > 90
    rgb[i] = [(data[i * 4] ?? 0) / 255, (data[i * 4 + 1] ?? 0) / 255, (data[i * 4 + 2] ?? 0) / 255]
  }

  const dist = new Float32Array(GRID * GRID)
  for (let i = 0; i < dist.length; i += 1) dist[i] = opaque[i] ? 99 : 0
  for (let pass = 0; pass < MAX_DEPTH + 2; pass += 1) {
    for (let y = 1; y < GRID - 1; y += 1) {
      for (let x = 1; x < GRID - 1; x += 1) {
        const i = y * GRID + x
        if (!opaque[i]) continue
        const neighbor = Math.min(dist[i - 1] ?? 99, dist[i + 1] ?? 99, dist[i - GRID] ?? 99, dist[i + GRID] ?? 99)
        dist[i] = Math.min(dist[i] ?? 99, neighbor + 1)
      }
    }
  }

  const voxels: Voxel[] = []
  const samples: Voxel[] = []
  const cell = 0.78 / GRID
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      const i = y * GRID + x
      if (!opaque[i]) continue
      const color = rgb[i] ?? [1, 1, 1]
      const px = (x / GRID - 0.5) * 0.78
      const py = -(y / GRID - 0.5) * 0.78
      const depth = Math.max(1, Math.min(MAX_DEPTH, Math.round(dist[i] ?? 1)))
      samples.push({ x: px, y: py, z: 0, r: color[0], g: color[1], b: color[2] })
      for (let z = 0; z < depth; z += 1) {
        const pz = (z - (depth - 1) / 2) * cell * 0.92
        voxels.push({ x: px, y: py, z: pz, r: color[0], g: color[1], b: color[2] })
      }
    }
  }

  return {
    voxels: downsample(voxels, MAX_VOXELS),
    samples: downsample(samples, MAX_SAMPLES),
    cell,
  }
}

function downsample<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items
  const out: T[] = []
  const step = items.length / max
  for (let i = 0; i < max; i += 1) {
    const item = items[Math.floor(i * step)]
    if (item) out.push(item)
  }
  return out
}
