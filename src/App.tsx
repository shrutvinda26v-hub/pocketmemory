import { useEffect, useRef, useState } from 'react'
import type { FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision'
import { playIgnite, playWhoosh, unlockAudio } from './lib/audio.ts'
import { BlowDetector } from './lib/blowDetector.ts'
import { CandleMachine } from './lib/candleMachine.ts'
import { SnapDetector } from './lib/snapDetector.ts'
import type { AppMode, CandlePhase, TrackingFrame } from './lib/types.ts'
import type { CakeScene } from './scene/CakeScene.ts'

function cameraSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

function statusLabel(phase: CandlePhase, tracking: TrackingFrame | null, live: boolean): string {
  if (!live) return 'Camera off'
  if (phase === 'lit' || phase === 'extinguishing') {
    return tracking?.faceActive ? 'Face Tracking Active' : 'Looking for your face'
  }
  return tracking?.handsActive ? 'Hand Tracking Active' : 'Looking for a hand'
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<CakeScene | null>(null)
  const machineRef = useRef(new CandleMachine(0))
  const blowRef = useRef(new BlowDetector())
  const snapRef = useRef(new SnapDetector())
  const faceLm = useRef<FaceLandmarker | null>(null)
  const handLm = useRef<HandLandmarker | null>(null)
  const detectRef = useRef<typeof import('./lib/tracker.ts').detectTracking | null>(null)
  const modeRef = useRef<AppMode>('gate')
  const lastPhase = useRef<CandlePhase>('lit')
  const trackingRef = useRef<TrackingFrame | null>(null)

  const [mode, setMode] = useState<AppMode>('gate')
  const [hint, setHint] = useState<'blow' | 'snap'>('blow')
  const [phase, setPhase] = useState<CandlePhase>('lit')
  const [tracking, setTracking] = useState<TrackingFrame | null>(null)
  const [starting, setStarting] = useState(false)
  const [status, setStatus] = useState('')
  const [denied, setDenied] = useState(false)
  const [unsupported, setUnsupported] = useState(!cameraSupported())

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    void import('./lib/tracker.ts').then((mod) => {
      detectRef.current = mod.detectTracking
      void mod.preloadTracker()
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let frame = 0
    let scene: CakeScene | null = null
    let last = performance.now()
    let lastUi = ''

    const onResize = () => scene?.resize(window.innerWidth, window.innerHeight)

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const machine = machineRef.current

      if (modeRef.current === 'live' && faceLm.current && handLm.current && videoRef.current && detectRef.current) {
        try {
          trackingRef.current = detectRef.current(faceLm.current, handLm.current, videoRef.current, now)
        } catch {
          // Keep last tracking frame if MediaPipe rejects a timestamp.
        }
        const tracked = trackingRef.current
        const blow = blowRef.current.update(tracked?.face ?? null, now)
        const snap = snapRef.current.update(tracked?.hands ?? [], now)
        if (machine.getPhase() === 'lit') machine.notifyBlow(blow.intensity, blow.fired, now)
        if (machine.getPhase() === 'extinguished') machine.notifySnap(snap.fired, now)
      }

      const snapshot = machine.update(now)
      if (snapshot.phase !== lastPhase.current) {
        if (snapshot.phase === 'extinguishing') playWhoosh()
        if (snapshot.phase === 'relighting') playIgnite()
        lastPhase.current = snapshot.phase
      }

      scene?.update(dt, snapshot.visuals)
      scene?.render()

      const uiKey = `${snapshot.phase}|${snapshot.hint}|${trackingRef.current?.faceActive}|${trackingRef.current?.handsActive}`
      if (uiKey !== lastUi) {
        lastUi = uiKey
        setHint(snapshot.hint)
        setPhase(snapshot.phase)
        setTracking(trackingRef.current)
      }

      frame = requestAnimationFrame(tick)
    }

    void import('./scene/CakeScene.ts').then(({ CakeScene }) => {
      if (cancelled || !canvasRef.current) return
      scene = new CakeScene(canvasRef.current)
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
      const now = performance.now()
      if (event.key === 'b' || event.key === 'B') machineRef.current.notifyBlow(1, true, now)
      if (event.key === 's' || event.key === 'S') machineRef.current.notifySnap(true, now)
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
        setStarting(false)
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
      setStatus('Warming up tracking…')
      const tracker = await import('./lib/tracker.ts')
      detectRef.current = tracker.detectTracking
      const [face, hands] = await tracker.preloadTracker()
      faceLm.current = face
      handLm.current = hands
      setDenied(false)
      setMode('live')
      modeRef.current = 'live'
      setStatus('')
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      setDenied(name === 'NotAllowedError' || name === 'PermissionDeniedError')
      setStatus('')
    } finally {
      setStarting(false)
    }
  }

  const live = mode === 'live'
  const trackingOn =
    live && ((phase === 'lit' || phase === 'extinguishing' ? tracking?.faceActive : tracking?.handsActive) ?? false)

  return (
    <div className="app">
      <h1 className="sr-only">Make a wish — blow out the candle, then snap to light it</h1>
      <canvas ref={canvasRef} className="stage" aria-hidden="true" />

      <video
        ref={videoRef}
        className={live ? 'cam' : 'cam is-hidden'}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
      />

      {live && (
        <div className={`status ${trackingOn ? 'is-on' : 'is-wait'}`} aria-live="polite">
          <span className="dot" />
          {statusLabel(phase, tracking, live)}
        </div>
      )}

      {mode === 'gate' && (
        <div className="gate">
          <p className="kicker">a little ritual</p>
          <h2 className="title">Make a wish</h2>
          <p className="copy">
            Blow the candle out with your breath, then snap your fingers to light it again. Your camera never leaves
            this device.
          </p>
          {unsupported ? (
            <p className="copy dim">This browser has no webcam API.</p>
          ) : (
            <button type="button" className="cta" onClick={() => void startCamera()} disabled={starting}>
              {starting ? status || 'Starting…' : 'Allow Camera'}
            </button>
          )}
          {denied && <p className="copy dim">Camera access was denied. You can still watch the flame, or retry.</p>}
        </div>
      )}

      {live && (
        <p className="hint" aria-live="polite">
          {hint === 'blow' ? '💨 Blow to put it out' : '🤌 Snap to light it'}
        </p>
      )}

      {denied && mode === 'gate' && (
        <button type="button" className="retry" onClick={() => void startCamera()}>
          Try camera again
        </button>
      )}
    </div>
  )
}
