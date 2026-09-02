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

export function playBoop({
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

  tl.to(motion, { y: 4, rotation: -1.6, duration: 0.14, ease: 'sine.in' })
    .to(motion, { y: -8, rotation: 1.2, duration: 0.22, ease: 'power2.out' })
    .to(motion, { y: 0, rotation: 0, duration: 0.28, ease: 'sine.inOut' })

  if (leftEye && rightEye) {
    tl.to(
      [leftEye, rightEye],
      {
        scaleY: 0.08,
        duration: 0.08,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 3,
        transformOrigin: '50% 55%',
      },
      0,
    )
  }

  tl.add(() => {
    burstBits(fx, bits, 'retriever')
    popBubble(bubble, bubbleText, 0)
  }, 0.04)

  return tl
}

export function playPartyHop({ motion }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
  gsap.set(motion, { transformOrigin: '50% 100%' })
  tl.to(motion, { y: -16, rotation: 2, duration: 0.28, ease: 'power2.out' })
    .to(motion, { y: 0, rotation: 0, duration: 0.32, ease: 'sine.inOut' })
  return tl
}

const TOY_CLASS: Record<PetId, string> = {
  retriever: 'pet-toy pet-toy-ball',
  cat: 'pet-toy pet-toy-yarn',
  doxie: 'pet-toy pet-toy-treat',
}

export function tossToy(stage: HTMLElement, id: PetId) {
  const pet = document.querySelector(`.pet-${id}`)
  if (!(pet instanceof HTMLElement)) return

  const stageBox = stage.getBoundingClientRect()
  const petBox = pet.getBoundingClientRect()
  const toX = petBox.left + petBox.width * 0.5 - stageBox.left
  const toY = petBox.top + petBox.height * (id === 'retriever' ? 0.3 : 0.38) - stageBox.top

  const toy = document.createElement('div')
  toy.className = TOY_CLASS[id]
  toy.setAttribute('aria-hidden', 'true')
  stage.appendChild(toy)

  const fromX =
    id === 'doxie' ? 90 : id === 'cat' ? stageBox.width - 90 : stageBox.width * 0.5
  const fromY = id === 'retriever' ? 36 : 90

  const tl = gsap.timeline({ onComplete: () => toy.remove() })
  if (id === 'retriever') {
    gsap.set(toy, { x: fromX, y: fromY, opacity: 1, rotation: 0 })
    tl.to(toy, { x: toX, y: toY - 8, rotation: 240, duration: 0.52, ease: 'power2.in' })
      .to(toy, { y: toY + 10, duration: 0.12, ease: 'power1.in' })
      .to(toy, { y: toY - 20, rotation: 300, duration: 0.16, ease: 'power1.out' })
      .to(toy, { opacity: 0, y: toY + 8, scale: 0.55, duration: 0.2, ease: 'sine.in' })
  } else if (id === 'cat') {
    gsap.set(toy, { x: fromX, y: toY + 24, opacity: 1, rotation: 0 })
    tl.to(toy, { x: toX + 12, y: toY + 6, rotation: 380, duration: 0.48, ease: 'power1.inOut' })
      .to(toy, { x: toX - 14, y: toY + 12, rotation: 520, duration: 0.2, ease: 'sine.inOut' })
      .to(toy, { opacity: 0, scale: 0.5, duration: 0.18, ease: 'sine.in' })
  } else {
    gsap.set(toy, { x: toX, y: fromY, opacity: 0, scale: 0.6 })
    tl.to(toy, { opacity: 1, y: toY, scale: 1, duration: 0.42, ease: 'bounce.out' }).to(toy, {
      opacity: 0,
      y: toY + 12,
      duration: 0.2,
      ease: 'sine.in',
    })
  }
}

export function dropPawPrint(stage: HTMLElement, x: number, y: number) {
  const print = document.createElement('span')
  print.className = 'paw-print'
  print.setAttribute('aria-hidden', 'true')
  print.innerHTML =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><ellipse cx="12" cy="16.5" rx="4.2" ry="3.4"/><circle cx="6.2" cy="10.2" r="2.1"/><circle cx="10" cy="7.4" r="2.2"/><circle cx="14.4" cy="7.4" r="2.2"/><circle cx="18" cy="10.2" r="2.1"/></svg>'
  stage.appendChild(print)
  gsap.set(print, { x, y, opacity: 0.45, rotation: -18 + Math.random() * 36, scale: 0.85 })
  gsap.to(print, {
    opacity: 0,
    y: y + 10,
    duration: 0.9,
    ease: 'sine.in',
    onComplete: () => print.remove(),
  })
}

export function rainPaws(stage: HTMLElement) {
  const box = stage.getBoundingClientRect()
  for (let i = 0; i < 14; i += 1) {
    const print = document.createElement('span')
    print.className = 'paw-print paw-print-rain'
    print.setAttribute('aria-hidden', 'true')
    print.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><ellipse cx="12" cy="16.5" rx="4.2" ry="3.4"/><circle cx="6.2" cy="10.2" r="2.1"/><circle cx="10" cy="7.4" r="2.2"/><circle cx="14.4" cy="7.4" r="2.2"/><circle cx="18" cy="10.2" r="2.1"/></svg>'
    stage.appendChild(print)
    const x = 40 + Math.random() * (box.width - 80)
    gsap.set(print, { x, y: -20, opacity: 0, rotation: -24 + Math.random() * 48 })
    gsap.to(print, {
      y: box.height * 0.42 + Math.random() * 80,
      opacity: 0.55,
      duration: 0.7 + Math.random() * 0.4,
      delay: i * 0.05,
      ease: 'power1.out',
    })
    gsap.to(print, {
      opacity: 0,
      duration: 0.35,
      delay: 1.1 + i * 0.05,
      onComplete: () => print.remove(),
    })
  }
}
