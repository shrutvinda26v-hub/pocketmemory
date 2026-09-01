import gsap from 'gsap'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { EyeConfig, PetConfig } from './config'

type Pointer = { x: number; y: number }

type InteractivePetProps = {
  config: PetConfig
  pointer: RefObject<Pointer>
  reducedMotion: boolean
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

function playRetrieverJump(motion: HTMLElement, tail: HTMLElement | null, rest = 0) {
  const tl = gsap.timeline()
  tl.to(motion, {
    y: 5,
    scaleY: 0.98,
    duration: 0.13,
    ease: 'power2.in',
    transformOrigin: '50% 100%',
  })
    .to(motion, {
      y: -26,
      scaleY: 1.025,
      rotation: 0.9,
      duration: 0.28,
      ease: 'power2.out',
    })
    .to(motion, {
      y: 0,
      scaleY: 0.97,
      rotation: 0,
      duration: 0.12,
      ease: 'power2.in',
    })
    .to(motion, {
      scaleY: 1,
      duration: 0.16,
      ease: 'power1.out',
    })

  if (tail) {
    tl.to(tail, { rotation: rest - 12, duration: 0.1, ease: 'sine.inOut' }, 0.08)
      .to(tail, { rotation: rest + 15, duration: 0.1, ease: 'sine.inOut' })
      .to(tail, { rotation: rest - 10, duration: 0.1, ease: 'sine.inOut' })
      .to(tail, { rotation: rest + 8, duration: 0.09, ease: 'sine.inOut' })
      .to(tail, { rotation: rest, duration: 0.2, ease: 'power2.out' })
  }

  return tl
}

function playCatBounce(motion: HTMLElement, tail: HTMLElement | null, rest = 0) {
  const tl = gsap.timeline()
  tl.to(motion, {
    y: -13,
    scale: 1.04,
    rotation: -1.2,
    duration: 0.22,
    ease: 'power2.out',
    transformOrigin: '50% 100%',
  })
    .to(motion, {
      y: -4,
      scale: 0.98,
      rotation: 1,
      duration: 0.18,
      ease: 'power1.inOut',
    })
    .to(motion, {
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 0.28,
      ease: 'power2.out',
    })

  if (tail) {
    tl.to(tail, { rotation: rest + 10, duration: 0.18, ease: 'sine.out' }, 0.04)
      .to(tail, { rotation: rest - 8, duration: 0.16, ease: 'sine.inOut' })
      .to(tail, { rotation: rest, duration: 0.28, ease: 'power2.out' })
  }

  return tl
}

function playDoxiePeek(motion: HTMLElement) {
  return gsap
    .timeline()
    .to(motion, {
      y: -20,
      rotation: -1.4,
      duration: 0.42,
      ease: 'power2.out',
      transformOrigin: '50% 100%',
    })
    .to(motion, {
      y: -15,
      duration: 0.14,
      ease: 'power1.in',
    })
    .to(motion, {
      y: -20,
      rotation: 0.8,
      duration: 0.16,
      ease: 'power1.out',
    })
    .to(motion, {
      y: 0,
      rotation: 0,
      duration: 0.28,
      ease: 'power2.inOut',
    })
}

export function InteractivePet({ config, pointer, reducedMotion }: InteractivePetProps) {
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
  const idleTween = useRef<ReturnType<typeof gsap.to> | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const hoverRef = useRef(false)
  const animatingRef = useRef(false)
  const lookRef = useRef({ eyeX: 0, eyeY: 0, headX: 0, headY: 0, headRot: 0 })

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
    if (reducedMotion) return
    const figure = figureRef.current
    const leftInner = leftInnerRef.current
    const rightInner = rightInnerRef.current
    if (!figure || !leftInner || !rightInner) return

    const setFigX = gsap.quickSetter(figure, 'x', 'px')
    const setFigY = gsap.quickSetter(figure, 'y', 'px')
    const setFigRot = gsap.quickSetter(figure, 'rotation', 'deg')
    const setLeftX = gsap.quickSetter(leftInner, 'x', 'px')
    const setLeftY = gsap.quickSetter(leftInner, 'y', 'px')
    const setRightX = gsap.quickSetter(rightInner, 'x', 'px')
    const setRightY = gsap.quickSetter(rightInner, 'y', 'px')

    let raf = 0
    const tick = () => {
      const root = rootRef.current
      if (!root) {
        raf = requestAnimationFrame(tick)
        return
      }

      const rect = root.getBoundingClientRect()
      const faceX = rect.left + rect.width * 0.5
      const faceY = rect.top + rect.height * (config.id === 'retriever' ? 0.32 : 0.4)
      const dx = pointer.current.x - faceX
      const dy = pointer.current.y - faceY
      const dist = Math.hypot(dx, dy)
      const nx = Math.max(-1, Math.min(1, dx / 140))
      const ny = Math.max(-1, Math.min(1, dy / 110))
      const hovered = hoverRef.current
      const near = dist < config.look.proximity
      const headOn = hovered ? 1 : 0
      const eyeOn = hovered ? 1 : near ? 0.42 : 0

      const targetEyeX = nx * eyeOn
      const targetEyeY = ny * eyeOn
      const targetHeadX = nx * headOn
      const targetHeadY = ny * headOn
      const targetHeadRot = nx * headOn

      const look = lookRef.current
      const eyeLerp = config.look.eyeLerp
      const headLerp = hovered ? config.look.headLerp : 0.045
      look.eyeX += (targetEyeX - look.eyeX) * eyeLerp
      look.eyeY += (targetEyeY - look.eyeY) * eyeLerp
      look.headX += (targetHeadX - look.headX) * headLerp
      look.headY += (targetHeadY - look.headY) * headLerp
      look.headRot += (targetHeadRot - look.headRot) * headLerp

      setFigX(look.headX * config.look.headX)
      setFigY(look.headY * config.look.headY)
      setFigRot(look.headRot * config.look.headRot)
      setLeftX(look.eyeX * config.look.pupilX)
      setLeftY(look.eyeY * config.look.pupilY)
      setRightX(look.eyeX * config.look.pupilX)
      setRightY(look.eyeY * config.look.pupilY)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [config, pointer, reducedMotion, size.w])

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

  const playReaction = () => {
    if (reducedMotion || animatingRef.current) return
    const motion = motionRef.current
    if (!motion) return
    animatingRef.current = true
    idleTween.current?.pause()
    gsap.set(idleRef.current, { y: 0 })

    const timeline =
      config.jump.type === 'retriever'
        ? playRetrieverJump(motion, tailRef.current, config.tail?.rotate ?? 0)
        : config.jump.type === 'cat'
          ? playCatBounce(motion, tailRef.current, config.tail?.rotate ?? 0)
          : playDoxiePeek(motion)

    timeline.eventCallback('onComplete', () => {
      animatingRef.current = false
      idleTween.current?.restart(true)
    })
  }

  const onEnter = () => {
    hoverRef.current = true
    playReaction()
  }

  const onLeave = () => {
    hoverRef.current = false
  }

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
    <div className={`pet ${config.className}`} ref={rootRef}>
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
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        aria-label={config.alt}
      />
    </div>
  )
}
