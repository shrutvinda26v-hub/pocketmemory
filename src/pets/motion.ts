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
    y: 5,
    scaleY: 0.98,
    duration: 0.12,
    ease: 'power2.in',
  })
    .to(motion, {
      y: -26,
      scaleY: 1.035,
      rotation: 1,
      duration: 0.28,
      ease: 'power2.out',
    })
    .to(motion, {
      y: -24,
      scaleY: 1.02,
      rotation: -0.85,
      duration: 0.08,
      ease: 'sine.inOut',
    })
    .to(motion, {
      y: 0,
      scaleY: 0.97,
      rotation: 0,
      duration: 0.22,
      ease: 'power2.in',
    })
    .to(motion, {
      scaleY: 1,
      duration: 0.14,
      ease: 'power1.out',
    })

  if (tail) {
    tl.to(tail, { rotation: tailRest - 12, duration: 0.1, ease: 'sine.inOut' }, 0.1)
      .to(tail, { rotation: tailRest + 15, duration: 0.1, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest - 10, duration: 0.1, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest + 8, duration: 0.09, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest, duration: 0.2, ease: 'power2.out' })
  }

  return tl
}

export function playCatBounce({ motion, tail, leftEar, rightEar, tailRest }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, {
    y: -13,
    scale: 1.04,
    rotation: -1,
    duration: 0.22,
    ease: 'power2.out',
  })
    .to(motion, {
      y: -4,
      scale: 0.98,
      rotation: 0.8,
      duration: 0.18,
      ease: 'sine.inOut',
    })
    .to(motion, {
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 0.32,
      ease: 'power2.out',
    })

  if (tail) {
    tl.to(tail, { rotation: tailRest + 10, duration: 0.18, ease: 'sine.out' }, 0.04)
      .to(tail, { rotation: tailRest - 8, duration: 0.16, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest, duration: 0.28, ease: 'power2.out' })
  }

  if (leftEar && rightEar) {
    tl.to(leftEar, { rotation: -7, duration: 0.14, ease: 'sine.out' }, 0)
      .to(rightEar, { rotation: 7, duration: 0.14, ease: 'sine.out' }, 0)
      .to(leftEar, { rotation: 4, duration: 0.16, ease: 'sine.inOut' }, 0.14)
      .to(rightEar, { rotation: -4, duration: 0.16, ease: 'sine.inOut' }, 0.14)
      .to([leftEar, rightEar], { rotation: 0, duration: 0.32, ease: 'power2.out' }, 0.3)
  }

  return tl
}

export function playDoxiePeek({ motion, leftEar, rightEar }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, {
    y: -20,
    rotation: -1.2,
    duration: 0.38,
    ease: 'power2.out',
  })
    .to(motion, {
      y: 0,
      rotation: 0.4,
      duration: 0.18,
      ease: 'power1.in',
    })
    .to(motion, {
      y: -5,
      rotation: 0,
      duration: 0.1,
      ease: 'power1.out',
    })
    .to(motion, {
      y: 0,
      duration: 0.12,
      ease: 'power1.inOut',
    })

  if (leftEar && rightEar) {
    tl.to(leftEar, { rotation: 8, duration: 0.16, ease: 'sine.out' }, 0.08)
      .to(rightEar, { rotation: -8, duration: 0.16, ease: 'sine.out' }, 0.08)
      .to(leftEar, { rotation: -5, duration: 0.18, ease: 'sine.inOut' }, 0.24)
      .to(rightEar, { rotation: 5, duration: 0.18, ease: 'sine.inOut' }, 0.24)
      .to([leftEar, rightEar], { rotation: 0, duration: 0.28, ease: 'power2.out' }, 0.42)
  }

  return tl
}
