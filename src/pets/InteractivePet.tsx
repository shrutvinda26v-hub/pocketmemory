import gsap from 'gsap'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { EyeConfig, PetConfig } from './config'
import { playBoop, playCatBounce, playDoxiePeek, playPartyHop, playRetrieverJump } from './motion'

type Pointer = { x: number; y: number }

type InteractivePetProps = {
  config: PetConfig
  pointer: RefObject<Pointer>
  reducedMotion: boolean
  isHovering: boolean
  lookOnly: boolean
  boopNonce: number
  partyNonce: number
}

function Photo({ src, webp, alt }: { src: string; webp?: string; alt: string }) {
  const img = <img className="pet-photo" src={src} alt={alt} draggable={false} />
  if (!webp) return img
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      {img}
    </picture>
  )
}

export function InteractivePet({
  config,
  pointer,
  reducedMotion,
  isHovering,
  lookOnly,
  boopNonce,
  partyNonce,
}: InteractivePetProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const motionRef = useRef<HTMLDivElement>(null)
  const idleRef = useRef<HTMLDivElement>(null)
  const figureRef = useRef<HTMLDivElement>(null)
  const tailRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const leftEyeRef = useRef<HTMLDivElement>(null)
  const rightEyeRef = useRef<HTMLDivElement>(null)
  const leftInnerRef = useRef<HTMLImageElement>(null)
  const rightInnerRef = useRef<HTMLImageElement>(null)
  const leftEarRef = useRef<HTMLDivElement>(null)
  const rightEarRef = useRef<HTMLDivElement>(null)
  const fxRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const idleTween = useRef<ReturnType<typeof gsap.to> | null>(null)
  const jumpTl = useRef<ReturnType<typeof gsap.timeline> | null>(null)
  const animatingRef = useRef(false)
  const headReadyRef = useRef(config.id !== 'doxie')
  const hoverRef = useRef(isHovering)
  const lookOnlyRef = useRef(lookOnly)
  const lookRef = useRef({ eyeX: 0, eyeY: 0, headX: 0, headY: 0, headRot: 0 })
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    hoverRef.current = isHovering
    lookOnlyRef.current = lookOnly
  }, [isHovering, lookOnly])

  useLayoutEffect(() => {
    const photo = photoRef.current
    if (!photo) return

    const measure = () => {
      const img = photo.querySelector('.pet-photo')
      if (!(img instanceof HTMLElement)) return
      const next = { w: img.offsetWidth, h: img.offsetHeight }
      setSize((current) =>
        current.w === next.w && current.h === next.h ? current : next,
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(photo)
    const img = photo.querySelector('.pet-photo')
    if (img instanceof HTMLImageElement) {
      if (img.complete) measure()
      else img.addEventListener('load', measure, { once: true })
    }
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!config.tail || !tailRef.current) return
    gsap.set(tailRef.current, {
      rotation: config.tail.rotate,
      transformOrigin: config.tail.origin,
    })
  }, [config.tail])

  useLayoutEffect(() => {
    if (reducedMotion) return
    const idle = idleRef.current
    if (!idle) return

    const tween = gsap.to(idle, {
      y: -config.idle.breath,
      duration: config.idle.duration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    idleTween.current = tween
    return () => {
      tween.kill()
      idleTween.current = null
    }
  }, [config.idle.breath, config.idle.duration, reducedMotion])

  useEffect(() => {
    if (!isHovering) {
      headReadyRef.current = true
      return
    }
    headReadyRef.current = false
    const lead = config.id === 'retriever' ? 90 : config.id === 'cat' ? 70 : 100
    const timeout = window.setTimeout(() => {
      headReadyRef.current = true
    }, lead)
    return () => window.clearTimeout(timeout)
  }, [config.id, isHovering])

  useEffect(() => {
    const figure = figureRef.current
    const leftInner = leftInnerRef.current
    const rightInner = rightInnerRef.current
    if (!figure || !leftInner || !rightInner) return

    const setFigRot = gsap.quickSetter(figure, 'rotation', 'deg')
    const setLeftX = gsap.quickSetter(leftInner, 'x', 'px')
    const setLeftY = gsap.quickSetter(leftInner, 'y', 'px')
    const setRightX = gsap.quickSetter(rightInner, 'x', 'px')
    const setRightY = gsap.quickSetter(rightInner, 'y', 'px')

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.008, (now - last) / 1000))
      last = now
      const root = rootRef.current
      const px = pointer.current.x
      const py = pointer.current.y
      if (!root || !Number.isFinite(px) || !Number.isFinite(py)) {
        raf = requestAnimationFrame(tick)
        return
      }

      const rect = root.getBoundingClientRect()
      const faceX = rect.left + rect.width * 0.5
      const faceY = rect.top + rect.height * (config.id === 'retriever' ? 0.3 : 0.4)
      const dx = px - faceX
      const dy = py - faceY
      const dist = Math.hypot(dx, dy)
      const nx = Math.max(-1, Math.min(1, dx / 180))
      const ny = Math.max(-1, Math.min(1, dy / 150))
      const hovered = hoverRef.current
      const watchingOther = lookOnlyRef.current
      const near = dist < config.look.proximity
      const catNear = config.id === 'cat' && near && !watchingOther
      const jumpScale = animatingRef.current ? 0.28 : 1
      const headOn =
        (hovered && headReadyRef.current ? 1 : catNear ? 0.45 : 0) * jumpScale
      const eyeOn = hovered ? 1 : near ? (watchingOther ? 0.28 : 0.42) : 0

      const look = lookRef.current
      const leaving = !hovered && !catNear
      const eyeT = 1 - Math.exp(-(leaving ? 7 : Math.max(6, config.look.eyeLerp * 100)) * dt)
      const headT = 1 - Math.exp(-(leaving ? 4.2 : Math.max(3.5, config.look.headLerp * 140)) * dt)
      look.eyeX += (nx * eyeOn - look.eyeX) * eyeT
      look.eyeY += (ny * eyeOn - look.eyeY) * eyeT
      look.headRot += (nx * headOn - look.headRot) * headT

      setFigRot(look.headRot * config.look.headRot)
      setLeftX(look.eyeX * config.look.pupilX)
      setLeftY(look.eyeY * config.look.pupilY)
      setRightX(look.eyeX * config.look.pupilX)
      setRightY(look.eyeY * config.look.pupilY)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [config, pointer, size.w])

  useEffect(() => {
    if (reducedMotion) return
    const left = leftEyeRef.current
    const right = rightEyeRef.current
    if (!left || !right) return

    let timeout: number
    const blink = () => {
      gsap.to([left, right], {
        scaleY: 0.08,
        duration: 0.06,
        yoyo: true,
        repeat: 1,
        transformOrigin: '50% 55%',
        ease: 'power1.inOut',
      })
      timeout = window.setTimeout(blink, 3200 + Math.random() * 3200)
    }
    timeout = window.setTimeout(blink, 1800 + Math.random() * 2200)
    return () => window.clearTimeout(timeout)
  }, [reducedMotion, size.w])

  useEffect(() => {
    if (reducedMotion || !config.ears) return
    const left = leftEarRef.current
    const right = rightEarRef.current
    if (!left || !right) return

    let timeout: number
    const twitch = () => {
      if (!animatingRef.current) {
        const amount = config.id === 'doxie' ? 3.2 : 2.2
        gsap.to(left, { rotation: amount, duration: 0.18, yoyo: true, repeat: 1, ease: 'sine.inOut' })
        gsap.to(right, { rotation: -amount, duration: 0.18, yoyo: true, repeat: 1, ease: 'sine.inOut' })
      }
      timeout = window.setTimeout(twitch, 4200 + Math.random() * 3800)
    }
    timeout = window.setTimeout(twitch, 2400 + Math.random() * 1800)
    return () => window.clearTimeout(timeout)
  }, [config.ears, config.id, reducedMotion])

  useEffect(() => {
    if (reducedMotion || !isHovering) return
    const motion = motionRef.current
    const fx = fxRef.current
    if (!motion || !fx || animatingRef.current) return

    const delay = window.setTimeout(() => {
      if (!hoverRef.current || animatingRef.current || !motionRef.current || !fxRef.current) {
        return
      }

      animatingRef.current = true
      motion.classList.add('is-jumping')
      idleTween.current?.pause()
      gsap.set(idleRef.current, { y: 0 })

      const targets = {
        motion,
        fx,
        bubble: bubbleRef.current,
        tail: tailRef.current,
        leftEye: leftEyeRef.current,
        rightEye: rightEyeRef.current,
        tailRest: config.tail?.rotate ?? 0,
        bits: config.surprise.bits,
        bubbleText: config.surprise.bubble,
      }

      const timeline =
        config.jump.type === 'retriever'
          ? playRetrieverJump(targets)
          : config.jump.type === 'cat'
            ? playCatBounce(targets)
            : playDoxiePeek(targets)

      jumpTl.current = timeline
      timeline.eventCallback('onComplete', () => {
        animatingRef.current = false
        motion.classList.remove('is-jumping')
        gsap.set(motion, { y: 0, rotation: 0 })
        gsap.set(bubbleRef.current, { opacity: 0, y: 0, scale: 1 })
        idleTween.current?.restart(true)
        jumpTl.current = null
      })
    }, 70)

    return () => window.clearTimeout(delay)
  }, [
    config.jump.type,
    config.surprise.bits,
    config.surprise.bubble,
    config.tail?.rotate,
    isHovering,
    reducedMotion,
  ])

  useEffect(() => {
    if (reducedMotion || !isHovering || boopNonce === 0) return
    const motion = motionRef.current
    const fx = fxRef.current
    if (!motion || !fx || animatingRef.current) return

    animatingRef.current = true
    motion.classList.add('is-jumping')
    idleTween.current?.pause()
    gsap.set(idleRef.current, { y: 0 })
    const timeline = playBoop({
      motion,
      fx,
      bubble: bubbleRef.current,
      tail: tailRef.current,
      leftEye: leftEyeRef.current,
      rightEye: rightEyeRef.current,
      tailRest: config.tail?.rotate ?? 0,
      bits: config.surprise.bits,
      bubbleText: config.surprise.boop,
    })
    jumpTl.current = timeline
    timeline.eventCallback('onComplete', () => {
      animatingRef.current = false
      motion.classList.remove('is-jumping')
      gsap.set(motion, { y: 0, rotation: 0 })
      gsap.set(bubbleRef.current, { opacity: 0, y: 0, scale: 1 })
      idleTween.current?.restart(true)
      jumpTl.current = null
    })
  }, [
    boopNonce,
    config.surprise.bits,
    config.surprise.boop,
    config.tail?.rotate,
    isHovering,
    reducedMotion,
  ])

  useEffect(() => {
    if (reducedMotion || partyNonce === 0) return
    const motion = motionRef.current
    const fx = fxRef.current
    if (!motion || !fx || animatingRef.current) return

    animatingRef.current = true
    motion.classList.add('is-jumping')
    idleTween.current?.pause()
    gsap.set(idleRef.current, { y: 0 })
    const timeline = playPartyHop({
      motion,
      fx,
      bubble: bubbleRef.current,
      tail: tailRef.current,
      leftEye: leftEyeRef.current,
      rightEye: rightEyeRef.current,
      tailRest: 0,
      bits: [],
      bubbleText: '',
    })
    jumpTl.current = timeline
    timeline.eventCallback('onComplete', () => {
      animatingRef.current = false
      motion.classList.remove('is-jumping')
      gsap.set(motion, { y: 0, rotation: 0 })
      idleTween.current?.restart(true)
      jumpTl.current = null
    })
  }, [partyNonce, reducedMotion])

  useEffect(() => {
    return () => {
      jumpTl.current?.kill()
    }
  }, [])

  const eyeWindow = (eye: EyeConfig, side: 'left' | 'right') => {
    const { w, h } = size
    if (!w || !h) return null
    const width = Math.max(w * eye.size, 12)
    const height = width * eye.aspect
    const left = w * eye.x - width / 2
    const top = h * eye.y - height / 2
    return (
      <div
        className="pet-eye"
        ref={side === 'left' ? leftEyeRef : rightEyeRef}
        style={{ width, height, left, top }}
      >
        <img
          ref={side === 'left' ? leftInnerRef : rightInnerRef}
          className="pet-eye-inner"
          src={config.src}
          alt=""
          draggable={false}
          style={{ width: w, height: h, left: -left, top: -top }}
        />
      </div>
    )
  }

  return (
    <div
      className={`pet ${config.className}${isHovering ? ' is-hovered' : ''}`}
      data-pet={config.id}
      ref={rootRef}
    >
      <div className="pet-motion" ref={motionRef}>
        <div className="pet-idle" ref={idleRef}>
          {config.tail ? (
            <div
              className="pet-tail"
              ref={tailRef}
              style={{
                width: `${config.tail.width * 100}%`,
                right: config.tail.right,
                left: config.tail.left,
                bottom: config.tail.bottom,
                transformOrigin: config.tail.origin,
              }}
            >
              <img src={config.tail.src} alt="" draggable={false} />
            </div>
          ) : null}
          <div className="pet-figure" ref={figureRef}>
            <div className="pet-photo-wrap" ref={photoRef}>
              <Photo src={config.src} webp={config.webp} alt={config.alt} />
              {config.ears ? (
                <>
                  <div
                    className="pet-ear"
                    ref={leftEarRef}
                    style={{
                      clipPath: config.ears.left.clip,
                      transformOrigin: config.ears.left.origin,
                    }}
                  >
                    <img src={config.src} alt="" draggable={false} />
                  </div>
                  <div
                    className="pet-ear"
                    ref={rightEarRef}
                    style={{
                      clipPath: config.ears.right.clip,
                      transformOrigin: config.ears.right.origin,
                    }}
                  >
                    <img src={config.src} alt="" draggable={false} />
                  </div>
                </>
              ) : null}
              {eyeWindow(config.eyes.left, 'left')}
              {eyeWindow(config.eyes.right, 'right')}
            </div>
          </div>
        </div>
      </div>
      <div
        className="pet-hit"
        style={{
          top: config.hit.top,
          right: config.hit.right,
          bottom: config.hit.bottom,
          left: config.hit.left,
        }}
        aria-hidden="true"
      />
      <div className="pet-fx" ref={fxRef} aria-hidden="true">
        <div className="pet-bubble" ref={bubbleRef} />
      </div>
    </div>
  )
}
