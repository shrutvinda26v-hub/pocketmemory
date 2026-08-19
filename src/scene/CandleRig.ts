import * as THREE from 'three'
import { softSpriteTexture, starSparkleTexture } from './textures.ts'
import type { CandleVisuals } from '../lib/types.ts'

const flameVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const flameFragment = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uBend;
uniform float uTurbulence;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  uv.x -= 0.5;
  float t = uTime;
  float n = noise(vec2(uv.x * 4.2, uv.y * 3.1 - t * 3.4));
  float n2 = noise(vec2(uv.x * 7.0 + t * 0.4, uv.y * 5.0 - t * 5.1));
  uv.x -= uBend * pow(uv.y, 1.35) * 0.55;
  uv.x += (n - 0.5) * 0.16 * uTurbulence * uv.y;
  uv.x += (n2 - 0.5) * 0.05 * uTurbulence;

  float width = mix(0.05, 0.22, pow(1.0 - uv.y, 0.72));
  width *= 0.55 + 0.45 * n;
  width *= max(uIntensity, 0.001);
  float d = abs(uv.x) / max(width, 0.001);
  float body = smoothstep(1.05, 0.18, d);
  body *= smoothstep(-0.02, 0.08, uv.y) * smoothstep(1.05, 0.42, uv.y);
  body *= uIntensity;

  vec3 outer = vec3(1.0, 0.32, 0.08);
  vec3 mid = vec3(1.0, 0.62, 0.16);
  vec3 core = vec3(1.0, 0.96, 0.78);
  vec3 col = mix(outer, mid, smoothstep(0.95, 0.35, d));
  col = mix(col, core, smoothstep(0.42, 0.0, d) * (1.0 - uv.y * 0.55));
  float alpha = body * (0.72 + 0.28 * n);
  float sparkle = hash(floor(vec2(uv.x * 22.0, uv.y * 16.0 - t * 2.4)));
  sparkle = pow(sparkle, 18.0) * body * 1.8;
  col += vec3(1.0, 0.96, 0.78) * sparkle;
  alpha = max(alpha, sparkle * 0.65);
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(col * alpha, alpha);
}
`

interface SmokeParticle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  life: number
  max: number
  size: number
  spin: number
}

interface SparkParticle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  life: number
  max: number
}

interface Twinkle {
  sprite: THREE.Sprite
  angle: number
  radius: number
  height: number
  speed: number
  phase: number
  size: number
}

export class CandleRig {
  readonly group = new THREE.Group()
  readonly light: THREE.PointLight
  private readonly flameMat: THREE.ShaderMaterial
  private readonly flameA: THREE.Mesh
  private readonly flameB: THREE.Mesh
  private readonly glow: THREE.Sprite
  private readonly ember: THREE.Mesh
  private readonly smoke: THREE.Points
  private readonly smokePos: Float32Array
  private readonly smokeSize: Float32Array
  private readonly sparks: THREE.Points
  private readonly sparkPos: Float32Array
  private readonly traveler: THREE.Sprite
  private readonly twinkles: Twinkle[] = []
  private readonly smokes: SmokeParticle[] = []
  private readonly sparkList: SparkParticle[] = []
  private smokeSpawn = 0
  private lastSpark = 0
  private time = 0

  constructor() {
    const flameMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uBend: { value: 0 },
        uTurbulence: { value: 0.35 },
      },
      vertexShader: flameVertex,
      fragmentShader: flameFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
    this.flameMat = flameMat
    const geom = new THREE.PlaneGeometry(0.28, 0.46)
    geom.translate(0, 0.23, 0)
    this.flameA = new THREE.Mesh(geom, flameMat)
    this.flameB = new THREE.Mesh(geom, flameMat)
    this.flameB.rotation.y = Math.PI / 2
    this.group.add(this.flameA, this.flameB)

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: softSpriteTexture('#ffb45a'),
        color: 0xffc978,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.55,
      }),
    )
    glow.scale.set(0.38, 0.5, 1)
    glow.position.y = 0.14
    this.glow = glow
    this.group.add(glow)

    this.ember = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0x3a1208,
        emissive: 0xff6a1a,
        emissiveIntensity: 0,
        roughness: 0.6,
      }),
    )
    this.group.add(this.ember)

    this.smokePos = new Float32Array(48 * 3)
    this.smokeSize = new Float32Array(48)
    const smokeGeom = new THREE.BufferGeometry()
    smokeGeom.setAttribute('position', new THREE.BufferAttribute(this.smokePos, 3))
    smokeGeom.setAttribute('size', new THREE.BufferAttribute(this.smokeSize, 1))
    this.smoke = new THREE.Points(
      smokeGeom,
      new THREE.PointsMaterial({
        map: softSpriteTexture('#d8d0c8'),
        color: 0xc8c2bc,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        size: 0.12,
        blending: THREE.NormalBlending,
      }),
    )
    this.group.add(this.smoke)

    this.sparkPos = new Float32Array(32 * 3)
    const sparkGeom = new THREE.BufferGeometry()
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(this.sparkPos, 3))
    this.sparks = new THREE.Points(
      sparkGeom,
      new THREE.PointsMaterial({
        map: softSpriteTexture('#ffe7a0'),
        color: 0xffe6a8,
        transparent: true,
        depthWrite: false,
        size: 0.045,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.group.add(this.sparks)

    this.traveler = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: softSpriteTexture('#ffe9b0'),
        color: 0xfff1c4,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    )
    this.traveler.scale.set(0.08, 0.08, 1)
    this.group.add(this.traveler)

    this.light = new THREE.PointLight(0xffb14a, 2.4, 7, 2)
    this.light.position.set(0, 0.12, 0)
    this.group.add(this.light)

    const starMap = starSparkleTexture()
    for (let i = 0; i < 36; i += 1) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: starMap,
          color: i % 3 === 0 ? 0xfff4c8 : 0xffd27a,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0,
        }),
      )
      const twinkle: Twinkle = {
        sprite,
        angle: Math.random() * Math.PI * 2,
        radius: 0.03 + Math.random() * 0.22,
        height: 0.02 + Math.random() * 0.4,
        speed: 0.35 + Math.random() * 0.85,
        phase: Math.random() * Math.PI * 2,
        size: 0.028 + Math.random() * 0.055,
      }
      this.twinkles.push(twinkle)
      this.group.add(sprite)
    }
  }

  update(visuals: CandleVisuals, dt: number): void {
    this.time += dt
    this.flameMat.uniforms.uTime!.value = this.time
    this.flameMat.uniforms.uIntensity!.value = visuals.flameIntensity
    this.flameMat.uniforms.uBend!.value = visuals.flameBend
    this.flameMat.uniforms.uTurbulence!.value = visuals.flameTurbulence
    this.flameA.visible = visuals.flameIntensity > 0.02
    this.flameB.visible = visuals.flameIntensity > 0.02
    const flicker = 0.92 + Math.sin(this.time * 17.0) * 0.04 + Math.sin(this.time * 31.0) * 0.025
    const scale = Math.max(0.15, visuals.flameIntensity) * flicker
    this.flameA.scale.set(scale, 0.35 + 0.65 * visuals.flameIntensity, 1)
    this.flameB.scale.copy(this.flameA.scale)
    this.glow.material.opacity = 0.12 + visuals.flameIntensity * 0.38
    this.glow.scale.set(0.28 + visuals.flameIntensity * 0.32, 0.36 + visuals.flameIntensity * 0.4, 1)
    const emberMat = this.ember.material as THREE.MeshStandardMaterial
    emberMat.emissiveIntensity = visuals.ember * 2.4 + visuals.wickGlow * 1.4
    this.ember.scale.setScalar(0.7 + visuals.ember * 0.8 + visuals.wickGlow * 0.4)
    this.light.intensity = 0.15 + visuals.light * 2.35 * flicker

    this.updateSmoke(visuals, dt)
    this.updateSparks(visuals, dt)
    this.updateTraveler(visuals)
    this.updateTwinkles(visuals)
  }

  private updateTwinkles(visuals: CandleVisuals): void {
    const live = visuals.flameIntensity * visuals.light
    for (const twinkle of this.twinkles) {
      twinkle.angle += twinkle.speed * 0.012
      const x = Math.cos(twinkle.angle) * twinkle.radius
      const z = Math.sin(twinkle.angle) * twinkle.radius * 0.7
      twinkle.sprite.position.set(x, twinkle.height, z)
      const pulse = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(this.time * (2.6 + twinkle.speed * 3.4) + twinkle.phase), 4)
      twinkle.sprite.material.opacity = live * pulse
      const size = twinkle.size * (0.75 + pulse * 0.9)
      twinkle.sprite.scale.set(size, size, 1)
      twinkle.sprite.visible = live > 0.04
    }
  }

  private updateSmoke(visuals: CandleVisuals, dt: number): void {
    this.smokeSpawn += dt * visuals.smoke * 14
    while (this.smokeSpawn > 1 && this.smokes.length < 40) {
      this.smokeSpawn -= 1
      this.smokes.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 0.02, 0.02, (Math.random() - 0.5) * 0.02),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.05, 0.12 + Math.random() * 0.08, (Math.random() - 0.5) * 0.04),
        life: 0,
        max: 0.9 + Math.random() * 0.7,
        size: 0.05 + Math.random() * 0.08,
        spin: (Math.random() - 0.5) * 0.4,
      })
    }
    for (let i = this.smokes.length - 1; i >= 0; i -= 1) {
      const p = this.smokes[i]!
      p.life += dt
      p.pos.addScaledVector(p.vel, dt)
      p.vel.x += p.spin * dt
      p.vel.y *= 1 - dt * 0.15
      if (p.life >= p.max || visuals.smoke < 0.02) this.smokes.splice(i, 1)
    }
    this.smokePos.fill(0)
    this.smokeSize.fill(0)
    for (let i = 0; i < this.smokes.length; i += 1) {
      const p = this.smokes[i]!
      this.smokePos[i * 3] = p.pos.x
      this.smokePos[i * 3 + 1] = p.pos.y
      this.smokePos[i * 3 + 2] = p.pos.z
      this.smokeSize[i] = p.size * (0.4 + p.life / p.max)
    }
    const geom = this.smoke.geometry
    ;(geom.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    const sizeAttr = geom.getAttribute('size')
    if (sizeAttr) (sizeAttr as THREE.BufferAttribute).needsUpdate = true
    ;(this.smoke.material as THREE.PointsMaterial).opacity = 0.12 + visuals.smoke * 0.28
    this.smoke.visible = this.smokes.length > 0
  }

  private updateSparks(visuals: CandleVisuals, dt: number): void {
    if (visuals.spark > 0.4 && this.time - this.lastSpark > 0.25 && this.sparkList.length < 8) {
      this.lastSpark = this.time
      for (let i = 0; i < 18; i += 1) {
        const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize()
        this.sparkList.push({
          pos: new THREE.Vector3(0, 0.03, 0),
          vel: dir.multiplyScalar(0.35 + Math.random() * 0.45),
          life: 0,
          max: 0.22 + Math.random() * 0.18,
        })
      }
    }
    for (let i = this.sparkList.length - 1; i >= 0; i -= 1) {
      const p = this.sparkList[i]!
      p.life += dt
      p.pos.addScaledVector(p.vel, dt)
      p.vel.y -= dt * 0.6
      if (p.life >= p.max) this.sparkList.splice(i, 1)
    }
    this.sparkPos.fill(0)
    for (let i = 0; i < this.sparkList.length; i += 1) {
      const p = this.sparkList[i]!
      this.sparkPos[i * 3] = p.pos.x
      this.sparkPos[i * 3 + 1] = p.pos.y
      this.sparkPos[i * 3 + 2] = p.pos.z
    }
    ;(this.sparks.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    this.sparks.visible = this.sparkList.length > 0
    ;(this.sparks.material as THREE.PointsMaterial).opacity = 0.4 + visuals.spark * 0.6
  }

  private updateTraveler(visuals: CandleVisuals): void {
    const t = visuals.sparkTravel
    const moving = visuals.phase === 'relighting' && t < 0.98 && t > 0.02
    this.traveler.material.opacity = moving ? 0.9 * (1 - t * 0.2) : 0
    const start = new THREE.Vector3(0.16, 0.18, 0.1)
    const mid = new THREE.Vector3(0.05, 0.32, 0.04)
    const end = new THREE.Vector3(0, 0.02, 0)
    const p0 = start.clone().lerp(mid, t)
    const p1 = mid.clone().lerp(end, t)
    this.traveler.position.copy(p0.lerp(p1, t))
    const s = 0.05 + (1 - t) * 0.06
    this.traveler.scale.set(s, s, 1)
  }
}
