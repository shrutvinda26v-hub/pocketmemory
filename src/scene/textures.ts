import * as THREE from 'three'

export function radialGradientTexture(
  inner: string,
  outer: string,
  size = 512,
  innerStop = 0.12,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context missing')
  const g = ctx.createRadialGradient(size / 2, size / 2, size * innerStop, size / 2, size / 2, size / 2)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function candleStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context missing')
  ctx.fillStyle = '#fff6f0'
  ctx.fillRect(0, 0, 64, 256)
  ctx.strokeStyle = '#f4b6c8'
  ctx.lineWidth = 18
  for (let y = -64; y < 320; y += 28) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(64, y + 36)
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function boardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context missing')
  ctx.fillStyle = '#1a1210'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = `rgba(255, 210, 170, ${0.015 + (i % 7) * 0.004})`
    ctx.fillRect(0, i * 13, 512, 7)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function softSpriteTexture(color = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context missing')
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
  g.addColorStop(0, color)
  g.addColorStop(0.35, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function starSparkleTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context missing')
  const cx = size / 2
  const cy = size / 2
  const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 58)
  glow.addColorStop(0, 'rgba(255, 252, 236, 1)')
  glow.addColorStop(0.14, 'rgba(255, 228, 160, 0.85)')
  glow.addColorStop(1, 'rgba(255, 176, 80, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = '#fff6d8'
  const drawSpike = (angle: number, length: number, width: number) => {
    const dx = Math.cos(angle)
    const dy = Math.sin(angle)
    const px = -dy
    const py = dx
    ctx.beginPath()
    ctx.moveTo(cx + dx * length, cy + dy * length)
    ctx.lineTo(cx + px * width, cy + py * width)
    ctx.lineTo(cx - dx * length * 0.22, cy - dy * length * 0.22)
    ctx.lineTo(cx - px * width, cy - py * width)
    ctx.closePath()
    ctx.fill()
  }
  drawSpike(0, 56, 3.4)
  drawSpike(Math.PI / 2, 56, 3.4)
  drawSpike(Math.PI / 4, 22, 1.8)
  drawSpike((Math.PI * 3) / 4, 22, 1.8)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function frostingBump(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context missing')
  const img = ctx.createImageData(256, 256)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 210 + Math.floor(Math.random() * 40)
    img.data[i] = n
    img.data[i + 1] = n
    img.data[i + 2] = n
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 2)
  return texture
}
