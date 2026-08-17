import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { accentFor, type Pokemon } from '../data/pokemon.ts'
import {
  CUBE_PADDING,
  DISSOLVE_MS,
  MATERIALIZE_MS,
  type Phase,
  type ShowcaseSnapshot,
  type TrackedHand,
} from '../lib/types.ts'
import {
  FRUSTUM_HEIGHT,
  handBounds,
  landmarkToWorld,
  worldToScreen,
  type MappingOptions,
  type WorldPoint,
} from '../lib/mapping.ts'
import { buildHdFigure, type HdFigure, type Sample } from '../lib/hdPokemonMesh.ts'

const MAX_PARTICLES = 480
const AMBIENT_COUNT = 64

const particleVertex = `
uniform float uPixelRatio;
attribute vec3 aColor;
attribute float aSize;
attribute float aAlpha;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vColor = aColor;
  vAlpha = aAlpha;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPixelRatio * (90.0 / max(1.0, -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;
}
`

const particleFragment = `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  float glow = smoothstep(0.5, 0.08, d);
  if (glow < 0.01) discard;
  gl_FragColor = vec4(vColor, vAlpha * glow);
}
`

function hexToColor(hex: string): THREE.Color {
  return new THREE.Color(hex)
}

function makeCornerGeometry(): THREE.BufferGeometry {
  const s = 0.5
  const length = 0.13
  const corners = [
    [-s, -s, -s],
    [s, -s, -s],
    [-s, s, -s],
    [s, s, -s],
    [-s, -s, s],
    [s, -s, s],
    [-s, s, s],
    [s, s, s],
  ]
  const positions: number[] = []
  for (const corner of corners) {
    const cx = corner[0] ?? 0
    const cy = corner[1] ?? 0
    const cz = corner[2] ?? 0
    positions.push(cx, cy, cz, cx - Math.sign(cx) * length, cy, cz)
    positions.push(cx, cy, cz, cx, cy - Math.sign(cy) * length, cz)
    positions.push(cx, cy, cz, cx, cy, cz - Math.sign(cz) * length)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

export class ShowcaseScene {
  readonly renderer: THREE.WebGLRenderer
  readonly camera: THREE.OrthographicCamera
  readonly threeScene: THREE.Scene
  cubeScreen = { x: 0, y: 0 }

  private cube: THREE.Group
  private cubeFill: THREE.Mesh
  private cubeEdges: THREE.LineSegments
  private cubeCorners: THREE.LineSegments
  private fillMat: THREE.MeshPhysicalMaterial
  private edgeMat: THREE.LineBasicMaterial
  private cornerMat: THREE.LineBasicMaterial
  private modelGroup: THREE.Group
  private frontMesh: THREE.Mesh
  private backMesh: THREE.Mesh
  private figureMat: THREE.MeshPhysicalMaterial
  private contact: THREE.Mesh
  private contactMat: THREE.MeshBasicMaterial
  private rimLight: THREE.PointLight
  private keyLight: THREE.DirectionalLight
  private particles: THREE.Points
  private particleGeo: THREE.BufferGeometry
  private particleMat: THREE.ShaderMaterial
  private ambient: THREE.Points
  private ambientGeo: THREE.BufferGeometry
  private ambientMat: THREE.ShaderMaterial
  private envMap: THREE.Texture | null = null

  private positions: Float32Array
  private colors: Float32Array
  private sizes: Float32Array
  private alphas: Float32Array
  private rest: Float32Array
  private velocities: Float32Array
  private particleCount = 0
  private ambientOffsets: Float32Array

  private roster: Pokemon[] = []
  private figures = new Map<number, HdFigure>()
  private samples = new Map<number, Sample[]>()
  private loading = new Set<number>()
  private currentId = -1
  private lastPhase: Phase = 'idle'
  private cubeOpacity = 0
  private figureOpacity = 0
  private userRotY = 0
  private time = 0
  private accent = new THREE.Color('#e6dcc8')
  private reducedMotion = false
  private dummyTarget = new THREE.Vector3()

  constructor(canvas: HTMLCanvasElement) {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.08

    const aspect = window.innerWidth / Math.max(1, window.innerHeight)
    const half = FRUSTUM_HEIGHT / 2
    this.camera = new THREE.OrthographicCamera(-half * aspect, half * aspect, half, -half, 0.01, 40)
    this.camera.position.z = 8

    this.threeScene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const room = new RoomEnvironment()
    this.envMap = pmrem.fromScene(room, 0.04).texture
    this.threeScene.environment = this.envMap
    this.threeScene.environmentIntensity = 0.92
    room.dispose()
    pmrem.dispose()

    this.threeScene.add(new THREE.HemisphereLight(0xfff6ea, 0x1b1428, 0.62))
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.55)
    this.keyLight.position.set(0.7, 1.35, 2.6)
    this.threeScene.add(this.keyLight)
    const fill = new THREE.DirectionalLight(0xa8c8ff, 0.55)
    fill.position.set(-1.1, 0.15, 1.6)
    this.threeScene.add(fill)

    this.fillMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      roughness: 0.08,
      metalness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.35,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.cubeFill = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.fillMat)

    this.edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
    this.cubeEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), this.edgeMat)

    this.cornerMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
    this.cubeCorners = new THREE.LineSegments(makeCornerGeometry(), this.cornerMat)

    this.cube = new THREE.Group()
    this.cube.add(this.cubeFill, this.cubeEdges, this.cubeCorners)
    this.threeScene.add(this.cube)

    this.figureMat = new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0,
      roughness: 0.34,
      metalness: 0.03,
      clearcoat: 0.72,
      clearcoatRoughness: 0.18,
      sheen: 0.42,
      sheenColor: new THREE.Color('#ffffff'),
      sheenRoughness: 0.4,
      envMapIntensity: 0.78,
      alphaTest: 0.08,
      side: THREE.FrontSide,
      normalScale: new THREE.Vector2(0.55, 0.55),
    })
    this.frontMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.01), this.figureMat)
    this.backMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.01), this.figureMat)
    this.frontMesh.visible = false
    this.backMesh.visible = false

    this.contactMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    this.contact = new THREE.Mesh(new THREE.CircleGeometry(0.34, 48), this.contactMat)
    this.contact.rotation.x = -Math.PI / 2
    this.contact.position.y = -0.42

    this.modelGroup = new THREE.Group()
    this.modelGroup.add(this.frontMesh, this.backMesh, this.contact)
    this.cube.add(this.modelGroup)

    this.rimLight = new THREE.PointLight(0xffffff, 1.15, 2.8)
    this.rimLight.position.set(0.12, 0.38, 0.72)
    this.cube.add(this.rimLight)

    this.positions = new Float32Array(MAX_PARTICLES * 3)
    this.colors = new Float32Array(MAX_PARTICLES * 3)
    this.sizes = new Float32Array(MAX_PARTICLES)
    this.alphas = new Float32Array(MAX_PARTICLES)
    this.rest = new Float32Array(MAX_PARTICLES * 3)
    this.velocities = new Float32Array(MAX_PARTICLES * 3)

    this.particleGeo = new THREE.BufferGeometry()
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.particleGeo.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3))
    this.particleGeo.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1))
    this.particleGeo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1))
    this.particleGeo.setDrawRange(0, 0)

    this.particleMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPixelRatio: { value: this.renderer.getPixelRatio() } },
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
    })
    this.particles = new THREE.Points(this.particleGeo, this.particleMat)
    this.cube.add(this.particles)

    this.ambientOffsets = new Float32Array(AMBIENT_COUNT * 3)
    const ambPos = new Float32Array(AMBIENT_COUNT * 3)
    const ambColor = new Float32Array(AMBIENT_COUNT * 3)
    const ambSize = new Float32Array(AMBIENT_COUNT)
    const ambAlpha = new Float32Array(AMBIENT_COUNT)
    for (let i = 0; i < AMBIENT_COUNT; i += 1) {
      this.ambientOffsets[i * 3] = Math.random()
      this.ambientOffsets[i * 3 + 1] = Math.random()
      this.ambientOffsets[i * 3 + 2] = Math.random()
      ambSize[i] = 4 + Math.random() * 5
      ambAlpha[i] = 0.18
    }
    this.ambientGeo = new THREE.BufferGeometry()
    this.ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3))
    this.ambientGeo.setAttribute('aColor', new THREE.BufferAttribute(ambColor, 3))
    this.ambientGeo.setAttribute('aSize', new THREE.BufferAttribute(ambSize, 1))
    this.ambientGeo.setAttribute('aAlpha', new THREE.BufferAttribute(ambAlpha, 1))
    this.ambientMat = this.particleMat.clone()
    this.ambient = new THREE.Points(this.ambientGeo, this.ambientMat)
    this.cube.add(this.ambient)

    this.resize(window.innerWidth, window.innerHeight)
  }

  setRoster(roster: Pokemon[]): void {
    this.roster = roster
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false)
    const aspect = width / Math.max(1, height)
    const half = FRUSTUM_HEIGHT / 2
    this.camera.left = -half * aspect
    this.camera.right = half * aspect
    this.camera.top = half
    this.camera.bottom = -half
    this.camera.updateProjectionMatrix()
    this.particleMat.uniforms.uPixelRatio!.value = this.renderer.getPixelRatio()
    this.ambientMat.uniforms.uPixelRatio!.value = this.renderer.getPixelRatio()
  }

  preload(indices: number[]): void {
    for (const index of indices) {
      const pokemon = this.roster[index]
      if (pokemon) this.ensurePokemon(pokemon)
    }
  }

  update(
    dt: number,
    snapshot: ShowcaseSnapshot,
    hands: TrackedHand[],
    mapping: MappingOptions,
    pokemon: Pokemon,
  ): void {
    this.time += dt
    const phaseChanged = snapshot.phase !== this.lastPhase
    if (pokemon.id !== this.currentId && snapshot.phase !== 'dissolving') {
      this.applyPokemon(pokemon)
    }

    this.accent.lerp(hexToColor(accentFor(pokemon)), 1 - Math.exp(-dt * 4))
    this.edgeMat.color.copy(this.accent)
    this.cornerMat.color.copy(this.accent)
    this.fillMat.color.copy(this.accent)
    this.figureMat.sheenColor.copy(this.accent)

    const targetCube = snapshot.phase === 'idle' ? 0 : 1
    this.cubeOpacity += (targetCube - this.cubeOpacity) * (1 - Math.exp(-dt * 7))
    const pulse = 1 + snapshot.pulse * 0.12
    const fill = snapshot.cubeSolid ? 0.16 : 0.055
    this.edgeMat.opacity = this.cubeOpacity * (0.42 + snapshot.pulse * 0.45)
    this.cornerMat.opacity = this.cubeOpacity * (0.75 + snapshot.pulse * 0.25)
    this.fillMat.opacity = this.cubeOpacity * fill
    this.contactMat.opacity = this.cubeOpacity * this.figureOpacity * 0.28

    const figureGoal =
      snapshot.phase === 'dissolving' || snapshot.phase === 'idle'
        ? 0
        : snapshot.phase === 'materializing'
          ? Math.min(1, snapshot.phaseAgeMs / MATERIALIZE_MS)
          : 1
    this.figureOpacity += (figureGoal - this.figureOpacity) * (1 - Math.exp(-dt * 8))
    const opacity = this.figureOpacity * this.cubeOpacity
    this.figureMat.opacity = opacity
    this.figureMat.transparent = opacity < 0.98
    this.figureMat.depthWrite = opacity > 0.82
    this.rimLight.color.copy(this.accent)
    this.rimLight.intensity = 0.85 + snapshot.pulse * 0.9
    this.modelGroup.visible = opacity > 0.04 && snapshot.phase !== 'dissolving'

    if (phaseChanged && snapshot.phase === 'dissolving') {
      this.seedVelocities()
    }
    if (phaseChanged && snapshot.phase === 'materializing') {
      this.applyPokemon(pokemon)
      this.scatterFromRest()
    }
    this.lastPhase = snapshot.phase

    const anchor = pickFollowHand(hands, this.cube.position, mapping)
    if (anchor && snapshot.phase !== 'idle') {
      const points: WorldPoint[] = anchor.landmarks.map((landmark) => landmarkToWorld(landmark, mapping))
      const bounds = handBounds(points)
      const pad = CUBE_PADDING
      const span = Math.max(bounds.size.x, bounds.size.y) + pad
      this.dummyTarget.set(bounds.center.x, bounds.center.y, bounds.center.z)
      this.cube.position.lerp(this.dummyTarget, 1 - Math.exp(-dt * 14))
      const scaleTarget = span * pulse
      const nextScale = this.cube.scale.x + (scaleTarget - this.cube.scale.x) * (1 - Math.exp(-dt * 10))
      this.cube.scale.set(nextScale, nextScale, nextScale * 0.88)
      const wrist = points[0]
      const indexMcp = points[5]
      if (wrist && indexMcp) {
        const rot = Math.atan2(indexMcp.y - wrist.y, indexMcp.x - wrist.x) + Math.PI / 2
        this.cube.rotation.z += (rot * 0.35 - this.cube.rotation.z) * (1 - Math.exp(-dt * 6))
      }
    } else if (snapshot.phase !== 'idle') {
      this.cube.rotation.y += dt * 0.12
    }

    if (snapshot.pinchActive) this.userRotY += snapshot.pinchDelta
    const bob = this.reducedMotion ? 0 : Math.sin(this.time * 1.35) * 0.024
    const idleSpin = this.reducedMotion ? 0 : Math.sin(this.time * 0.55) * 0.14
    this.modelGroup.position.set(0, bob, 0)
    this.modelGroup.rotation.y = this.userRotY + idleSpin + (this.reducedMotion ? 0 : this.time * 0.28)
    this.modelGroup.scale.setScalar(0.94)

    this.updateParticles(dt, snapshot)
    this.updateAmbient(snapshot)

    const screen = worldToScreen(this.cube.position, mapping.viewportW, mapping.viewportH, FRUSTUM_HEIGHT)
    this.cubeScreen = screen
    this.cube.visible = this.cubeOpacity > 0.02
  }

  render(): void {
    this.renderer.render(this.threeScene, this.camera)
  }

  dispose(): void {
    this.renderer.dispose()
    this.cubeFill.geometry.dispose()
    this.cubeEdges.geometry.dispose()
    this.cubeCorners.geometry.dispose()
    this.contact.geometry.dispose()
    const bound = new Set([this.frontMesh.geometry.uuid, this.backMesh.geometry.uuid])
    this.particleGeo.dispose()
    this.ambientGeo.dispose()
    this.fillMat.dispose()
    this.edgeMat.dispose()
    this.cornerMat.dispose()
    this.figureMat.dispose()
    this.contactMat.dispose()
    this.particleMat.dispose()
    this.ambientMat.dispose()
    this.envMap?.dispose()
    for (const figure of this.figures.values()) {
      bound.delete(figure.front.uuid)
      bound.delete(figure.back.uuid)
      figure.front.dispose()
      figure.back.dispose()
      figure.texture.dispose()
      figure.normalMap.dispose()
    }
    for (const uuid of bound) {
      if (this.frontMesh.geometry.uuid === uuid) this.frontMesh.geometry.dispose()
      if (this.backMesh.geometry.uuid === uuid) this.backMesh.geometry.dispose()
    }
  }

  private ensurePokemon(pokemon: Pokemon): void {
    if (this.figures.has(pokemon.id) || this.loading.has(pokemon.id)) return
    this.loading.add(pokemon.id)
    const image = new Image()
    image.onload = () => {
      const figure = buildHdFigure(image, this.renderer.capabilities.getMaxAnisotropy())
      this.figures.set(pokemon.id, figure)
      this.samples.set(pokemon.id, figure.samples)
      this.loading.delete(pokemon.id)
      if (this.currentId === pokemon.id) this.applyPokemon(pokemon)
    }
    image.onerror = () => {
      this.loading.delete(pokemon.id)
    }
    image.src = pokemon.sprite
  }

  private applyPokemon(pokemon: Pokemon): void {
    this.currentId = pokemon.id
    this.ensurePokemon(pokemon)
    const figure = this.figures.get(pokemon.id)
    if (figure) {
      this.frontMesh.geometry = figure.front
      this.backMesh.geometry = figure.back
      this.figureMat.map = figure.texture
      this.figureMat.normalMap = figure.normalMap
      this.figureMat.needsUpdate = true
      this.frontMesh.visible = true
      this.backMesh.visible = true
    }
    const samples = this.samples.get(pokemon.id)
    if (samples) this.layoutRest(samples)
  }

  private layoutRest(samples: Sample[]): void {
    this.particleCount = samples.length
    for (let i = 0; i < samples.length; i += 1) {
      const sample = samples[i]!
      this.rest[i * 3] = sample.x
      this.rest[i * 3 + 1] = sample.y
      this.rest[i * 3 + 2] = sample.z
      this.positions[i * 3] = this.rest[i * 3] ?? 0
      this.positions[i * 3 + 1] = this.rest[i * 3 + 1] ?? 0
      this.positions[i * 3 + 2] = this.rest[i * 3 + 2] ?? 0
      this.colors[i * 3] = sample.r
      this.colors[i * 3 + 1] = sample.g
      this.colors[i * 3 + 2] = sample.b
      this.sizes[i] = 6.5
      this.alphas[i] = 0.35
    }
    this.particleGeo.setDrawRange(0, this.particleCount)
    this.flagParticleBuffers()
  }

  private seedVelocities(): void {
    for (let i = 0; i < this.particleCount; i += 1) {
      this.velocities[i * 3] = (Math.random() - 0.5) * 1.4
      this.velocities[i * 3 + 1] = Math.random() * 0.9 + 0.1
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 1.2
    }
  }

  private scatterFromRest(): void {
    for (let i = 0; i < this.particleCount; i += 1) {
      this.positions[i * 3] = (Math.random() - 0.5) * 1.1
      this.positions[i * 3 + 1] = (Math.random() - 0.5) * 1.1
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 1.1
      this.alphas[i] = 0.7
    }
    this.flagParticleBuffers()
  }

  private updateParticles(dt: number, snapshot: ShowcaseSnapshot): void {
    const pos = this.particleGeo.getAttribute('position')
    const alpha = this.particleGeo.getAttribute('aAlpha')
    if (snapshot.phase === 'dissolving') {
      const t = snapshot.phaseAgeMs / DISSOLVE_MS
      for (let i = 0; i < this.particleCount; i += 1) {
        this.positions[i * 3] = (this.positions[i * 3] ?? 0) + (this.velocities[i * 3] ?? 0) * dt
        this.positions[i * 3 + 1] = (this.positions[i * 3 + 1] ?? 0) + (this.velocities[i * 3 + 1] ?? 0) * dt
        this.positions[i * 3 + 2] = (this.positions[i * 3 + 2] ?? 0) + (this.velocities[i * 3 + 2] ?? 0) * dt
        this.alphas[i] = Math.max(0, 0.85 * (1 - t))
        this.colors[i * 3] = (this.colors[i * 3] ?? 0) * 0.96 + this.accent.r * 0.08
        this.colors[i * 3 + 1] = (this.colors[i * 3 + 1] ?? 0) * 0.96 + this.accent.g * 0.08
        this.colors[i * 3 + 2] = (this.colors[i * 3 + 2] ?? 0) * 0.96 + this.accent.b * 0.08
      }
      this.particles.visible = true
    } else if (snapshot.phase === 'materializing') {
      const t = Math.min(1, snapshot.phaseAgeMs / MATERIALIZE_MS)
      const ease = 1 - (1 - t) ** 3
      for (let i = 0; i < this.particleCount; i += 1) {
        this.positions[i * 3] += ((this.rest[i * 3] ?? 0) - (this.positions[i * 3] ?? 0)) * ease * 0.18
        this.positions[i * 3 + 1] += ((this.rest[i * 3 + 1] ?? 0) - (this.positions[i * 3 + 1] ?? 0)) * ease * 0.18
        this.positions[i * 3 + 2] += ((this.rest[i * 3 + 2] ?? 0) - (this.positions[i * 3 + 2] ?? 0)) * ease * 0.18
        this.alphas[i] = 0.25 + 0.55 * (1 - t)
      }
      this.particles.visible = true
    } else {
      this.particles.visible = false
    }
    if (pos) pos.needsUpdate = true
    if (alpha) alpha.needsUpdate = true
    const col = this.particleGeo.getAttribute('aColor')
    if (col) col.needsUpdate = true
  }

  private updateAmbient(snapshot: ShowcaseSnapshot): void {
    const visible = snapshot.phase !== 'idle' && this.cubeOpacity > 0.15
    this.ambient.visible = visible
    if (!visible) return
    const pos = this.ambientGeo.getAttribute('position') as THREE.BufferAttribute
    const col = this.ambientGeo.getAttribute('aColor') as THREE.BufferAttribute
    const alpha = this.ambientGeo.getAttribute('aAlpha') as THREE.BufferAttribute
    for (let i = 0; i < AMBIENT_COUNT; i += 1) {
      const ox = this.ambientOffsets[i * 3] ?? 0
      const oy = this.ambientOffsets[i * 3 + 1] ?? 0
      const oz = this.ambientOffsets[i * 3 + 2] ?? 0
      pos.setXYZ(
        i,
        Math.sin(this.time * 0.6 + ox * 12) * 0.38,
        Math.cos(this.time * 0.5 + oy * 10) * 0.38,
        Math.sin(this.time * 0.7 + oz * 9) * 0.32,
      )
      col.setXYZ(i, this.accent.r, this.accent.g, this.accent.b)
      alpha.setX(i, snapshot.phase === 'holding' ? 0.22 : 0.12)
    }
    pos.needsUpdate = true
    col.needsUpdate = true
    alpha.needsUpdate = true
  }

  private flagParticleBuffers(): void {
    const pos = this.particleGeo.getAttribute('position')
    const col = this.particleGeo.getAttribute('aColor')
    const size = this.particleGeo.getAttribute('aSize')
    const alpha = this.particleGeo.getAttribute('aAlpha')
    if (pos) pos.needsUpdate = true
    if (col) col.needsUpdate = true
    if (size) size.needsUpdate = true
    if (alpha) alpha.needsUpdate = true
  }
}

function pickFollowHand(
  hands: TrackedHand[],
  cubePos: THREE.Vector3,
  mapping: MappingOptions,
): TrackedHand | undefined {
  if (hands.length === 0) return undefined
  if (hands.length === 1) return hands[0]
  let best = hands[0]
  let bestDist = Infinity
  for (const hand of hands) {
    const wrist = hand.landmarks[0]
    if (!wrist) continue
    const world = landmarkToWorld(wrist, mapping)
    const dx = world.x - cubePos.x
    const dy = world.y - cubePos.y
    const dist = dx * dx + dy * dy
    if (dist < bestDist) {
      bestDist = dist
      best = hand
    }
  }
  return best
}
