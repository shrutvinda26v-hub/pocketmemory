import { useEffect, useRef, useState } from 'react'
import type { HandLandmarker } from '@mediapipe/tasks-vision'
import { ROSTER, accentFor, padDex, wrapIndex } from './data/pokemon.ts'
import { playDissolve, playMaterialize, playReset, playSummon, unlockAudio } from './lib/audio.ts'
import { demoHands } from './lib/demoScript.ts'
import { ShowcaseMachine } from './lib/showcaseMachine.ts'
import { type Phase, type ShowcaseSnapshot, type TrackedHand } from './lib/types.ts'
import { FRUSTUM_HEIGHT, landmarkToWorld, worldToScreen, type MappingOptions } from './lib/mapping.ts'
import { HAND_BONES } from './lib/handBones.ts'
import type { ShowcaseScene } from './scene/ShowcaseScene.ts'
import './index.css'

type Mode = 'gate' | 'live' | 'demo' | 'browse'

function initialMode(): Mode {
  const params = new URLSearchParams(window.location.search)
  if (params.get('browse') === '1') return 'browse'
  if (params.get('demo') === '1') return 'demo'
  return 'gate'
}

function emptySnapshot(): ShowcaseSnapshot {
  return {
    phase: 'idle',
    phaseAgeMs: 0,
    index: 0,
    pendingIndex: 0,
    rosterLength: ROSTER.length,
    anchorHand: null,
    cubeSolid: false,
    pulse: 0,
    swapDirection: 1,
    caught: [],
    handsDetected: false,
    labelVisible: false,
    pinchActive: false,
    pinchDelta: 0,
    trackingLost: false,
    hint: '',
    handReports: [],
  }
}

function cameraSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<ShowcaseScene | null>(null)
  const machineRef = useRef(new ShowcaseMachine(ROSTER.length, performance.now()))
  const landmarkerRef = useRef<HandLandmarker | null>(null)
  const modeRef = useRef<Mode>(initialMode())
  const lastPhase = useRef<Phase>('idle')
  const lastUiKey = useRef('')
  const demoOrigin = useRef(performance.now())
  const handsRef = useRef<TrackedHand[]>([])
  const detectRef = useRef<typeof import('./lib/handTracker.ts').detectTrackedHands | null>(null)

  const [mode, setMode] = useState<Mode>(initialMode)
  const [ui, setUi] = useState<ShowcaseSnapshot>(emptySnapshot)
  const [status, setStatus] = useState('')
  const [unsupported, setUnsupported] = useState(!cameraSupported())
  const [denied, setDenied] = useState(false)
  const [starting, setStarting] = useState(false)

  modeRef.current = mode

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let frame = 0
    let scene: ShowcaseScene | null = null
    let last = performance.now()

    const onResize = () => {
      scene?.resize(window.innerWidth, window.innerHeight)
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const currentMode = modeRef.current
      let hands: TrackedHand[] = []
      if (currentMode === 'demo') {
        hands = demoHands((now - demoOrigin.current) / 1000)
      } else if (currentMode === 'live' && landmarkerRef.current && videoRef.current && detectRef.current) {
        try {
          handsRef.current = detectRef.current(landmarkerRef.current, videoRef.current, now)
        } catch {
          // Keep the last stable frame if MediaPipe rejects a timestamp.
        }
        hands = handsRef.current
      }

      const snapshot =
        currentMode === 'browse' ? machineRef.current.getSnapshot(now) : machineRef.current.update(now, hands)

      if (snapshot.phase !== lastPhase.current) {
        if (snapshot.phase === 'summoning') playSummon()
        if (snapshot.phase === 'dissolving') playDissolve()
        if (snapshot.phase === 'materializing') playMaterialize()
        if (snapshot.phase === 'idle' && lastPhase.current !== 'idle') playReset()
        lastPhase.current = snapshot.phase
      }

      const sceneNow = sceneRef.current
      const pokemon = ROSTER[snapshot.index] ?? ROSTER[0]!
      const video = videoRef.current
      const mapping: MappingOptions = {
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        videoW: video?.videoWidth ?? 0,
        videoH: video?.videoHeight ?? 0,
        frustumHeight: FRUSTUM_HEIGHT,
        mirror: currentMode === 'live',
      }
      if (sceneNow && currentMode !== 'browse') {
        sceneNow.preload([
          wrapIndex(snapshot.index - 1, ROSTER.length),
          snapshot.index,
          wrapIndex(snapshot.index + 1, ROSTER.length),
          snapshot.pendingIndex,
        ])
        sceneNow.update(dt, snapshot, hands, mapping, pokemon)
        sceneNow.render()
        if (labelRef.current) {
          labelRef.current.style.transform = `translate(-50%, 18px) translate(${sceneNow.cubeScreen.x}px, ${sceneNow.cubeScreen.y}px)`
          labelRef.current.style.opacity = snapshot.labelVisible && snapshot.phase !== 'idle' ? '1' : '0'
        }
      }
      if (overlayRef.current && currentMode === 'live') {
        drawHandOverlay(overlayRef.current, hands, mapping)
      } else if (overlayRef.current) {
        overlayRef.current.getContext('2d')?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
      }

      const key = `${snapshot.phase}|${snapshot.index}|${snapshot.handsDetected}|${snapshot.caught.length}`
      if (key !== lastUiKey.current) {
        lastUiKey.current = key
        setUi({ ...snapshot })
      }

      frame = requestAnimationFrame(tick)
    }

    void import('./scene/ShowcaseScene.ts').then(({ ShowcaseScene }) => {
      if (cancelled || !canvasRef.current) return
      scene = new ShowcaseScene(canvasRef.current)
      scene.setRoster(ROSTER)
      scene.preload([0, 1, ROSTER.length - 1])
      sceneRef.current = scene
      window.addEventListener('resize', onResize)
      last = performance.now()
      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      scene?.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (modeRef.current === 'browse' || modeRef.current === 'gate') return
      const now = performance.now()
      if (event.key === 'ArrowRight') machineRef.current.cycle(now, 1)
      if (event.key === 'ArrowLeft') machineRef.current.cycle(now, -1)
      if (event.key === 'Escape') machineRef.current.reset(now)
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        machineRef.current.summon(now)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const startCamera = async () => {
    setStarting(true)
    setStatus('Requesting camera…')
    await unlockAudio()
    try {
      if (!cameraSupported()) {
        setUnsupported(true)
        setMode('demo')
        modeRef.current = 'demo'
        demoOrigin.current = performance.now()
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setStatus('Loading hand tracking…')
      const tracker = await import('./lib/handTracker.ts')
      detectRef.current = tracker.detectTrackedHands
      landmarkerRef.current = await tracker.getHandLandmarker()
      setDenied(false)
      setMode('live')
      modeRef.current = 'live'
      setStatus('')
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      setDenied(name === 'NotAllowedError' || name === 'PermissionDeniedError')
      setMode('demo')
      modeRef.current = 'demo'
      demoOrigin.current = performance.now()
      setStatus('')
    } finally {
      setStarting(false)
    }
  }

  const startDemo = async () => {
    await unlockAudio()
    machineRef.current = new ShowcaseMachine(ROSTER.length, performance.now())
    demoOrigin.current = performance.now()
    lastPhase.current = 'idle'
    setMode('demo')
    modeRef.current = 'demo'
  }

  const pokemon = ROSTER[ui.index] ?? ROSTER[0]!
  const accent = accentFor(pokemon)
  const showStage = mode !== 'browse'

  return (
    <div className="app" style={{ ['--accent' as string]: accent }}>
      <h1 className="sr-only">pocketmemory, a hand-tracked Pokémon showcase</h1>
      <p className="sr-only" id="instructions">
        Enable your camera, then point your index finger up to summon a cube around your hand.
        Swipe a closed fist with your other hand to cycle Pokémon. Open both palms to reset.
        Video is processed locally in your browser and is never uploaded. You can also browse the
        roster without a camera, or use arrow keys in demo mode.
      </p>
      <div aria-live="polite" className="sr-only">
        {ui.phase === 'holding' ? `${pokemon.name}, number ${padDex(pokemon.id)}` : ''}
      </div>

      <video
        ref={videoRef}
        className={mode === 'live' ? 'cam cam-live' : 'cam cam-hidden'}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
      />
      <div className="vignette" />
      <div className="grain" />
      <canvas ref={canvasRef} className="stage-canvas" aria-hidden="true" />
      <canvas ref={overlayRef} className="hand-overlay" aria-hidden="true" />

      <div ref={labelRef} className="poke-label" aria-hidden="true">
        <span className="poke-num">#{padDex(pokemon.id)}</span>
        <span className="poke-name">{pokemon.name}</span>
      </div>

      {mode === 'gate' && (
        <CameraPrompt
          starting={starting}
          status={status}
          onEnable={() => void startCamera()}
          onDemo={() => void startDemo()}
          onBrowse={() => setMode('browse')}
        />
      )}

      {mode === 'demo' && (
        <div className="banner">
          <p>
            {unsupported
              ? 'This browser has no webcam API. Playing a walkthrough instead.'
              : denied
                ? 'Camera access was denied. Playing a walkthrough instead.'
                : 'Walkthrough mode — best viewed on desktop with a webcam.'}
          </p>
          {cameraSupported() && !denied && (
            <button type="button" className="text-btn" onClick={() => void startCamera()}>
              Enable camera
            </button>
          )}
        </div>
      )}

      {showStage && mode !== 'gate' && (
        <>
          <CaughtDots caught={ui.caught} />
          <footer className="brand">
            <span>pocketmemory</span>
            <span className="privacy">Video stays on-device. Nothing is uploaded or stored.</span>
            <button type="button" className="text-btn" onClick={() => setMode('browse')}>
              Browse Pokémon
            </button>
          </footer>
        </>
      )}

      {mode === 'browse' && (
        <BrowseGrid
          caught={ui.caught}
          onBack={() => setMode(denied || unsupported ? 'demo' : videoRef.current?.srcObject ? 'live' : 'gate')}
          onDemo={() => void startDemo()}
        />
      )}
    </div>
  )
}

function CameraPrompt({
  starting,
  status,
  onEnable,
  onDemo,
  onBrowse,
}: {
  starting: boolean
  status: string
  onEnable: () => void
  onDemo: () => void
  onBrowse: () => void
}) {
  return (
    <div className="gate">
      <p className="hero-kicker">pocketmemory</p>
      <h2 className="gate-title">
        Your hand is
        <br />
        the interface.
      </h2>
      <p className="gate-copy">
        Camera frames are processed locally in your browser — never uploaded.
      </p>
      <button type="button" className="cta" onClick={onEnable} disabled={starting}>
        {starting ? status || 'Starting…' : 'Enable your camera to begin'}
      </button>
      <div className="gate-alts">
        <button type="button" className="text-btn" onClick={onDemo}>
          Watch a walkthrough
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" className="text-btn" onClick={onBrowse}>
          Browse Pokémon
        </button>
      </div>
    </div>
  )
}

function drawHandOverlay(
  canvas: HTMLCanvasElement,
  hands: TrackedHand[],
  mapping: MappingOptions,
): void {
  const width = window.innerWidth
  const height = window.innerHeight
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  for (const hand of hands) {
    const color =
      hand.gesture === 'point'
        ? '#f7d02c'
        : hand.gesture === 'fist'
          ? '#f57d31'
          : hand.gesture === 'open_palm'
            ? '#7ac74c'
            : hand.gesture === 'pinch'
              ? '#f95587'
              : 'rgba(244,239,228,0.7)'
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.lineWidth = 2.8
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    for (const [a, b] of HAND_BONES) {
      const pa = hand.landmarks[a]
      const pb = hand.landmarks[b]
      if (!pa || !pb) continue
      const sa = worldToScreen(landmarkToWorld(pa, mapping), mapping.viewportW, mapping.viewportH, mapping.frustumHeight)
      const sb = worldToScreen(landmarkToWorld(pb, mapping), mapping.viewportW, mapping.viewportH, mapping.frustumHeight)
      ctx.beginPath()
      ctx.moveTo(sa.x, sa.y)
      ctx.lineTo(sb.x, sb.y)
      ctx.stroke()
    }
    for (let i = 0; i < hand.landmarks.length; i += 1) {
      const landmark = hand.landmarks[i]
      if (!landmark) continue
      const world = landmarkToWorld(landmark, mapping)
      const screen = worldToScreen(world, mapping.viewportW, mapping.viewportH, mapping.frustumHeight)
      const tip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20
      ctx.beginPath()
      ctx.arc(screen.x, screen.y, tip ? 5.5 : 3.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function CaughtDots({ caught }: { caught: number[] }) {
  if (caught.length === 0) return null
  return (
    <div className="caught" aria-label={`${caught.length} Pokémon held this session`}>
      {ROSTER.map((pokemon, index) => {
        const on = caught.includes(index)
        return (
          <span
            key={pokemon.id}
            className={on ? 'dot is-on' : 'dot'}
            style={on ? { background: accentFor(pokemon) } : undefined}
            title={on ? pokemon.name : undefined}
          />
        )
      })}
    </div>
  )
}

function BrowseGrid({
  caught,
  onBack,
  onDemo,
}: {
  caught: number[]
  onBack: () => void
  onDemo: () => void
}) {
  return (
    <div className="browse">
      <header className="browse-head">
        <div>
          <p className="hero-kicker">roster</p>
          <h2>Browse Pokémon</h2>
        </div>
        <div className="browse-actions">
          <button type="button" className="text-btn" onClick={onDemo}>
            Walkthrough
          </button>
          <button type="button" className="cta cta-small" onClick={onBack}>
            Back
          </button>
        </div>
      </header>
      <ul className="grid">
        {ROSTER.map((pokemon, index) => (
          <li key={pokemon.id} className="card" style={{ ['--accent' as string]: accentFor(pokemon) }}>
            <img src={pokemon.sprite} alt="" />
            <p className="poke-num">#{padDex(pokemon.id)}</p>
            <h3>{pokemon.name}</h3>
            <p className="types">{pokemon.types.join(' / ')}</p>
            {caught.includes(index) && <p className="held">held this session</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
