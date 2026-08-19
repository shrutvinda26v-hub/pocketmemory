import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { buildCake } from './buildCake.ts'
import { CandleRig } from './CandleRig.ts'
import { radialGradientTexture, softSpriteTexture } from './textures.ts'
import type { CandleVisuals } from '../lib/types.ts'

export class CakeScene {
  readonly renderer: THREE.WebGLRenderer
  private readonly scene: THREE.Scene
  private readonly camera: THREE.PerspectiveCamera
  private readonly cake: THREE.Group
  private readonly rig: CandleRig
  private readonly fill: THREE.DirectionalLight
  private readonly key: THREE.DirectionalLight
  private readonly pool: THREE.Mesh
  private readonly dust: THREE.Points
  private readonly dustBase: Float32Array
  private readonly mouse = new THREE.Vector2(0, 0)
  private width = 1
  private height = 1
  private clock = 0

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.14
    this.renderer.shadowMap.enabled = false

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xefe4d2)
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.62
    pmrem.dispose()

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40)
    this.camera.position.set(0, 1.78, 4.15)

    const hemi = new THREE.HemisphereLight(0xfff4e6, 0xd7c3a8, 0.95)
    this.scene.add(hemi)
    this.key = new THREE.DirectionalLight(0xfff2e0, 1.35)
    this.key.position.set(2.4, 4.2, 3.2)
    this.scene.add(this.key)
    this.fill = new THREE.DirectionalLight(0xf0e6d8, 0.55)
    this.fill.position.set(-3.2, 1.8, 1.4)
    this.scene.add(this.fill)
    const rim = new THREE.DirectionalLight(0xffe0c4, 0.4)
    rim.position.set(0.2, 2.4, -4)
    this.scene.add(rim)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({
        map: radialGradientTexture('rgba(214, 190, 158, 0.55)', 'rgba(239,228,210,0)', 512, 0.08),
        transparent: true,
      }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    this.scene.add(ground)

    const poolMat = new THREE.MeshBasicMaterial({
      map: radialGradientTexture('rgba(255, 196, 120, 0.22)', 'rgba(255,196,120,0)', 256, 0.1),
      transparent: true,
      depthWrite: false,
    })
    this.pool = new THREE.Mesh(new THREE.CircleGeometry(1.7, 48), poolMat)
    this.pool.rotation.x = -Math.PI / 2
    this.pool.position.y = 0.08
    this.scene.add(this.pool)

    const built = buildCake()
    this.cake = built.group
    this.cake.position.y = 0.12
    this.scene.add(this.cake)
    this.rig = new CandleRig(built.wickTips)
    this.cake.add(this.rig.group)

    this.dustBase = new Float32Array(120 * 3)
    const dustPos = new Float32Array(120 * 3)
    for (let i = 0; i < 120; i += 1) {
      const a = Math.random() * Math.PI * 2
      const r = 0.4 + Math.random() * 1.6
      const x = Math.cos(a) * r - 0.35
      const y = 0.3 + Math.random() * 2.2
      const z = Math.sin(a) * r
      this.dustBase[i * 3] = x
      this.dustBase[i * 3 + 1] = y
      this.dustBase[i * 3 + 2] = z
      dustPos[i * 3] = x
      dustPos[i * 3 + 1] = y
      dustPos[i * 3 + 2] = z
    }
    const dustGeom = new THREE.BufferGeometry()
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    this.dust = new THREE.Points(
      dustGeom,
      new THREE.PointsMaterial({
        map: softSpriteTexture('#ffe7b0'),
        color: 0xffe7b8,
        transparent: true,
        depthWrite: false,
        size: 0.04,
        blending: THREE.AdditiveBlending,
        opacity: 0.35,
      }),
    )
    this.scene.add(this.dust)

    window.addEventListener('pointermove', this.onPointer)
    this.resize(window.innerWidth, window.innerHeight)
  }

  private onPointer = (event: PointerEvent): void => {
    this.mouse.x = (event.clientX / this.width) * 2 - 1
    this.mouse.y = (event.clientY / this.height) * 2 - 1
  }

  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  update(dt: number, visuals: CandleVisuals): void {
    this.clock += dt
    this.rig.update(visuals, dt)
    this.cake.rotation.y = Math.sin(this.clock * 0.12) * 0.08
    const targetX = this.mouse.x * 0.45
    const targetY = 1.78 + this.mouse.y * 0.12
    this.camera.position.x += (targetX - this.camera.position.x) * 0.04
    this.camera.position.y += (targetY - this.camera.position.y) * 0.04
    this.camera.lookAt(0, 1.12, 0)
    ;(this.pool.material as THREE.MeshBasicMaterial).opacity = 0.2 + visuals.light * 0.45
    this.key.intensity = 1.15 + visuals.light * 0.22
    this.fill.intensity = 0.5
    this.updateDust(visuals)
  }

  private updateDust(visuals: CandleVisuals): void {
    const pos = this.dust.geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < 120; i += 1) {
      const bx = this.dustBase[i * 3]!
      const by = this.dustBase[i * 3 + 1]!
      const bz = this.dustBase[i * 3 + 2]!
      const y = ((by + this.clock * 0.12) % 2.4) + 0.2
      const a = this.clock * 0.18 + i * 0.15
      arr[i * 3] = bx + Math.cos(a) * 0.08
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = bz + Math.sin(a) * 0.08
    }
    pos.needsUpdate = true
    ;(this.dust.material as THREE.PointsMaterial).opacity = 0.08 + visuals.dust * 0.28
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    window.removeEventListener('pointermove', this.onPointer)
    this.renderer.dispose()
  }
}
