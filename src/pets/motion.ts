import gsap from 'gsap'

gsap.config({ reducedMotion: 'off' } as Parameters<typeof gsap.config>[0] & {
  reducedMotion: 'off'
})

type JumpTargets = {
  motion: HTMLElement
  tail: HTMLElement | null
  leftEar: HTMLElement | null
  rightEar: HTMLElement | null
  tailRest: number
}

export function playRetrieverJump({ motion, tail, tailRest }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, {
    y: 3,
    scaleY: 0.985,
    duration: 0.18,
    ease: 'power2.in',
  })
    .to(motion, {
      y: -14,
      scaleY: 1.012,
      rotation: 0.35,
      duration: 0.38,
      ease: 'power3.out',
    })
    .to(motion, {
      y: 0,
      scaleY: 0.99,
      rotation: 0,
      duration: 0.32,
      ease: 'power2.inOut',
    })
    .to(motion, {
      scaleY: 1,
      duration: 0.22,
      ease: 'sine.out',
    })

  if (tail) {
    tl.to(tail, { rotation: tailRest - 7, duration: 0.16, ease: 'sine.inOut' }, 0.14)
      .to(tail, { rotation: tailRest + 9, duration: 0.18, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest - 5, duration: 0.16, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest + 4, duration: 0.16, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest, duration: 0.28, ease: 'sine.out' })
  }

  return tl
}

export function playCatBounce({ motion, tail, leftEar, rightEar, tailRest }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, {
    y: 2,
    scale: 0.99,
    duration: 0.12,
    ease: 'power1.in',
  })
    .to(motion, {
      y: -8,
      scale: 1.015,
      rotation: -0.4,
      duration: 0.28,
      ease: 'power2.out',
    })
    .to(motion, {
      y: 0,
      scale: 0.995,
      rotation: 0,
      duration: 0.3,
      ease: 'power2.inOut',
    })
    .to(motion, {
      scale: 1,
      duration: 0.18,
      ease: 'sine.out',
    })

  if (tail) {
    tl.to(tail, { rotation: tailRest + 6, duration: 0.22, ease: 'sine.out' }, 0.08)
      .to(tail, { rotation: tailRest - 4, duration: 0.2, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest, duration: 0.32, ease: 'sine.out' })
  }

  if (leftEar && rightEar) {
    tl.to(leftEar, { rotation: -3, duration: 0.16, ease: 'sine.out' }, 0.04)
      .to(rightEar, { rotation: 3, duration: 0.16, ease: 'sine.out' }, 0.04)
      .to([leftEar, rightEar], { rotation: 0, duration: 0.36, ease: 'sine.out' }, 0.28)
  }

  return tl
}

export function playDoxiePeek({ motion, leftEar, rightEar }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, {
    y: -12,
    rotation: -0.5,
    duration: 0.42,
    ease: 'power2.out',
  })
    .to(motion, {
      y: -2,
      rotation: 0,
      duration: 0.26,
      ease: 'power1.inOut',
    })
    .to(motion, {
      y: -5,
      duration: 0.16,
      ease: 'sine.out',
    })
    .to(motion, {
      y: 0,
      duration: 0.22,
      ease: 'sine.inOut',
    })

  if (leftEar && rightEar) {
    tl.to(leftEar, { rotation: 4, duration: 0.2, ease: 'sine.out' }, 0.1)
      .to(rightEar, { rotation: -4, duration: 0.2, ease: 'sine.out' }, 0.1)
      .to([leftEar, rightEar], { rotation: 0, duration: 0.4, ease: 'sine.out' }, 0.4)
  }

  return tl
}
