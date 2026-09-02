import gsap from 'gsap'
import type { PetId } from './config'

gsap.config({ reducedMotion: 'off' } as Parameters<typeof gsap.config>[0] & {
  reducedMotion: 'off'
})

export type JumpTargets = {
  motion: HTMLElement
  fx: HTMLElement
  bubble: HTMLElement | null
  tail: HTMLElement | null
  leftEye: HTMLElement | null
  rightEye: HTMLElement | null
  tailRest: number
  bits: string[]
  bubbleText: string
}

function popBubble(bubble: HTMLElement | null, text: string, at = 0.12) {
  if (!bubble) return
  bubble.textContent = text
  gsap.fromTo(
    bubble,
    { opacity: 0, scale: 0.55, y: 8 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.28,
      ease: 'back.out(2.2)',
      delay: at,
    },
  )
  gsap.to(bubble, {
    opacity: 0,
    y: -6,
    scale: 0.92,
    duration: 0.22,
    delay: at + 0.9,
    ease: 'sine.in',
  })
}

function burstBits(fx: HTMLElement, bits: string[], kind: PetId) {
  const faceY = kind === 'retriever' ? 26 : 34
  bits.forEach((glyph, index) => {
    const node = document.createElement('span')
    node.className = `pet-bit pet-bit-${kind}`
    node.textContent = glyph
    node.setAttribute('aria-hidden', 'true')
    const drift = (index - (bits.length - 1) / 2) * 22 + (Math.random() * 10 - 5)
    node.style.left = `calc(50% + ${drift}px)`
    node.style.top = `${faceY}%`
    fx.appendChild(node)

    gsap.fromTo(
      node,
      { opacity: 0, y: 8, scale: 0.4, rotation: -12 + Math.random() * 24 },
      {
        opacity: 1,
        y: -36 - Math.random() * 28,
        x: drift * 0.35,
        scale: 1,
        duration: 0.7 + Math.random() * 0.18,
        delay: 0.08 + index * 0.06,
        ease: 'power2.out',
      },
    )
    gsap.to(node, {
      opacity: 0,
      duration: 0.28,
      delay: 0.72 + index * 0.06,
      ease: 'sine.in',
      onComplete: () => node.remove(),
    })
  })
}

function flySpark(fx: HTMLElement) {
  const spark = document.createElement('span')
  spark.className = 'pet-spark'
  spark.setAttribute('aria-hidden', 'true')
  fx.appendChild(spark)
  const tl = gsap.timeline({ onComplete: () => spark.remove() })
  tl.fromTo(
    spark,
    { opacity: 0, x: 42, y: 18, scale: 0.4, rotation: -20 },
    { opacity: 1, x: 8, y: -6, scale: 1, rotation: 8, duration: 0.32, ease: 'sine.out' },
  )
    .to(spark, { x: -10, y: 10, scale: 0.85, rotation: -12, duration: 0.22, ease: 'sine.inOut' })
    .to(spark, { opacity: 0, x: -28, y: -22, scale: 0.4, duration: 0.28, ease: 'sine.in' })
}

export function playRetrieverJump({
  motion,
  fx,
  bubble,
  leftEye,
  rightEye,
  bits,
  bubbleText,
}: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, { y: 3, rotation: -1.2, duration: 0.12, ease: 'sine.in' })
    .to(motion, { y: -26, rotation: 2.2, duration: 0.32, ease: 'power2.out' })
    .to(motion, { y: -4, rotation: -0.8, duration: 0.2, ease: 'power1.in' })
    .to(motion, { y: -18, rotation: 1.4, duration: 0.22, ease: 'power2.out' })
    .to(motion, { y: 0, rotation: 0, duration: 0.34, ease: 'sine.inOut' })

  if (leftEye && rightEye) {
    tl.to(
      [leftEye, rightEye],
      { scale: 1.12, duration: 0.16, ease: 'sine.out', yoyo: true, repeat: 1 },
      0.12,
    )
  }

  tl.add(() => {
    burstBits(fx, bits, 'retriever')
    popBubble(bubble, bubbleText, 0)
  }, 0.18)

  return tl
}

export function playCatBounce({
  motion,
  fx,
  bubble,
  tail,
  tailRest,
  bits,
  bubbleText,
}: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.add(() => flySpark(fx), 0)
  tl.to(motion, { y: 3, rotation: 2, duration: 0.14, ease: 'sine.in' }, 0.18)
    .to(motion, { y: -20, rotation: -3.5, duration: 0.26, ease: 'power2.out' })
    .to(motion, { y: 0, rotation: 0, duration: 0.34, ease: 'sine.inOut' })

  if (tail) {
    tl.to(tail, { rotation: tailRest + 18, duration: 0.18, ease: 'sine.out' }, 0.2)
      .to(tail, { rotation: tailRest - 14, duration: 0.16, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest + 6, duration: 0.14, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest, duration: 0.28, ease: 'sine.out' })
  }

  tl.add(() => {
    burstBits(fx, bits, 'cat')
    popBubble(bubble, bubbleText, 0)
  }, 0.28)

  return tl
}

export function playDoxiePeek({
  motion,
  fx,
  bubble,
  bits,
  bubbleText,
}: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, { y: -32, rotation: -2.4, duration: 0.36, ease: 'power2.out' })
    .to(motion, { rotation: 3.2, duration: 0.12, ease: 'sine.inOut' })
    .to(motion, { rotation: -2.6, duration: 0.1, ease: 'sine.inOut' })
    .to(motion, { y: -8, rotation: 1.2, duration: 0.18, ease: 'power1.inOut' })
    .to(motion, { y: 0, rotation: 0, duration: 0.28, ease: 'sine.inOut' })

  tl.add(() => {
    burstBits(fx, bits, 'doxie')
    popBubble(bubble, bubbleText, 0)
  }, 0.16)

  return tl
}
