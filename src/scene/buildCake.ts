import * as THREE from 'three'
import { boardTexture, candleStripeTexture, frostingBump } from './textures.ts'

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function flowerGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  const petals = 5
  const steps = petals * 10
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const a = t * Math.PI * 2
    const wave = 0.5 + 0.5 * Math.cos(a * petals)
    const r = 0.28 + 0.72 * wave * wave
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  const geom = new THREE.ShapeGeometry(shape, 12)
  geom.computeVertexNormals()
  return geom
}

function swirlGeometry(): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = []
  const turns = 2.15
  for (let i = 0; i <= 28; i += 1) {
    const t = i / 28
    const a = t * Math.PI * 2 * turns
    const r = 0.095 * (1 - t * 0.62)
    pts.push(new THREE.Vector3(Math.cos(a) * r, t * 0.155, Math.sin(a) * r))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, 40, 0.036, 10, false)
}

export interface CakeBuild {
  group: THREE.Group
  wickTip: THREE.Vector3
}

export function buildCake(): CakeBuild {
  const rng = mulberry32(20260819)
  const group = new THREE.Group()
  const bump = frostingBump()
  const frosting = new THREE.MeshPhysicalMaterial({
    color: 0xf6eee4,
    roughness: 0.58,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.62,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffe4c8),
    sheenRoughness: 0.75,
    bumpMap: bump,
    bumpScale: 0.012,
    envMapIntensity: 0.55,
  })
  const glaze = new THREE.MeshPhysicalMaterial({
    color: 0xf3a8c0,
    roughness: 0.16,
    metalness: 0.04,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    envMapIntensity: 0.7,
  })
  const cream = new THREE.MeshPhysicalMaterial({
    color: 0xfffaf4,
    roughness: 0.72,
    metalness: 0,
    sheen: 0.55,
    sheenColor: new THREE.Color(0xfff3e6),
    envMapIntensity: 0.4,
  })

  const board = new THREE.Mesh(
    new THREE.CylinderGeometry(1.58, 1.62, 0.07, 64),
    new THREE.MeshStandardMaterial({
      map: boardTexture(),
      roughness: 0.82,
      metalness: 0.08,
      color: 0x3a2a24,
    }),
  )
  board.position.y = 0.035
  board.receiveShadow = true
  group.add(board)

  const bodyPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1.14, 0),
    new THREE.Vector2(1.2, 0.045),
    new THREE.Vector2(1.15, 0.14),
    new THREE.Vector2(1.11, 0.42),
    new THREE.Vector2(1.14, 0.7),
    new THREE.Vector2(1.16, 0.78),
    new THREE.Vector2(1.08, 0.82),
    new THREE.Vector2(0.0, 0.83),
  ]
  const body = new THREE.Mesh(new THREE.LatheGeometry(bodyPts, 64), frosting)
  body.position.y = 0.075
  body.castShadow = true
  group.add(body)

  const glazeTop = new THREE.Mesh(new THREE.CylinderGeometry(1.07, 1.12, 0.055, 64), glaze)
  glazeTop.position.y = 0.93
  group.add(glazeTop)

  const glazePts = [
    new THREE.Vector2(1.0, 0.9),
    new THREE.Vector2(1.12, 0.895),
    new THREE.Vector2(1.16, 0.84),
    new THREE.Vector2(1.1, 0.82),
  ]
  const glazeRim = new THREE.Mesh(new THREE.LatheGeometry(glazePts, 64), glaze)
  glazeRim.position.y = 0.075
  group.add(glazeRim)

  const dripCount = 8
  for (let i = 0; i < dripCount; i += 1) {
    const a = (i / dripCount) * Math.PI * 2 + rng() * 0.12
    const len = 0.12 + rng() * 0.22
    const radius = 1.13
    const x = Math.cos(a) * radius
    const z = Math.sin(a) * radius
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09 + rng() * 0.02, 20, 16), glaze)
    bead.position.set(x, 0.9, z)
    bead.scale.set(1.05, 1.25, 1.05)
    group.add(bead)
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.068, 18, 16), glaze)
    drop.position.set(x * 1.005, 0.86 - len * 0.72, z * 1.005)
    drop.scale.set(0.82, 2.1 + len * 3.4, 0.82)
    group.add(drop)
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), glaze)
    tip.position.set(x * 1.01, 0.78 - len * 0.95, z * 1.01)
    group.add(tip)
  }

  const swirlGeom = swirlGeometry()
  const swirlCount = 9
  for (let i = 0; i < swirlCount; i += 1) {
    const a = (i / swirlCount) * Math.PI * 2
    const mesh = new THREE.Mesh(swirlGeom, cream)
    mesh.position.set(Math.cos(a) * 0.86, 0.98, Math.sin(a) * 0.86)
    mesh.rotation.y = -a + Math.PI / 2
    group.add(mesh)
  }

  const flowerGeom = flowerGeometry()
  flowerGeom.scale(0.055, 0.055, 0.055)
  const flowerMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4b3c8,
    roughness: 0.45,
    side: THREE.DoubleSide,
  })
  const flowers = new THREE.InstancedMesh(flowerGeom, flowerMat, 36)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < 36; i += 1) {
    const top = rng() > 0.38
    const a = rng() * Math.PI * 2
    const r = top ? 0.2 + rng() * 0.7 : 1.16
    dummy.position.set(Math.cos(a) * r, top ? 0.97 + rng() * 0.02 : 0.12 + rng() * 0.55, Math.sin(a) * r)
    dummy.rotation.set(-Math.PI / 2 + (rng() - 0.5) * 0.6, rng() * 6, (rng() - 0.5) * 0.4)
    dummy.updateMatrix()
    flowers.setMatrixAt(i, dummy.matrix)
  }
  group.add(flowers)

  const sprinkleGeom = new THREE.SphereGeometry(0.018, 8, 8)
  const sprinkleColors = [0xffd6e8, 0xc8f0e0, 0xffe08a, 0xffffff, 0xf7b7d0]
  const sprinkles = new THREE.InstancedMesh(
    sprinkleGeom,
    new THREE.MeshStandardMaterial({ roughness: 0.35 }),
    70,
  )
  for (let i = 0; i < 70; i += 1) {
    const top = rng() > 0.3
    const a = rng() * Math.PI * 2
    const r = top ? rng() * 0.95 : 1.18 + rng() * 0.12
    dummy.position.set(Math.cos(a) * r, top ? 0.965 : 0.08 + rng() * 0.08, Math.sin(a) * r)
    dummy.scale.setScalar(0.7 + rng() * 0.8)
    dummy.rotation.set(0, 0, 0)
    dummy.updateMatrix()
    sprinkles.setMatrixAt(i, dummy.matrix)
    sprinkles.setColorAt(i, new THREE.Color(sprinkleColors[i % sprinkleColors.length]!))
  }
  if (sprinkles.instanceColor) sprinkles.instanceColor.needsUpdate = true
  group.add(sprinkles)

  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.042, 0.52, 24),
    new THREE.MeshPhysicalMaterial({
      map: candleStripeTexture(),
      roughness: 0.45,
      clearcoat: 0.3,
    }),
  )
  candle.position.y = 1.24
  group.add(candle)

  const waxPool = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), glaze)
  waxPool.scale.set(1.1, 0.35, 1.1)
  waxPool.position.y = 0.98
  group.add(waxPool)

  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.009, 0.085, 8),
    new THREE.MeshStandardMaterial({ color: 0x2b1a14, roughness: 0.9 }),
  )
  wick.position.y = 1.535
  group.add(wick)

  return { group, wickTip: new THREE.Vector3(0, 1.58, 0) }
}
