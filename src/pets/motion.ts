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

export function playRetrieverJump({ motion }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, {
    y: 2,
    duration: 0.14,
    ease: 'sine.in',
  })
    .to(motion, {
      y: -11,
      duration: 0.34,
      ease: 'power2.out',
    })
    .to(motion, {
      y: 0,
      duration: 0.42,
      ease: 'sine.inOut',
    })

  return tl
}

export function playCatBounce({ motion, tail, tailRest }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, {
    y: -7,
    duration: 0.28,
    ease: 'power2.out',
  }).to(motion, {
    y: 0,
    duration: 0.36,
    ease: 'sine.inOut',
  })

  if (tail) {
    tl.to(tail, { rotation: tailRest + 5, duration: 0.22, ease: 'sine.out' }, 0)
      .to(tail, { rotation: tailRest - 3, duration: 0.2, ease: 'sine.inOut' })
      .to(tail, { rotation: tailRest, duration: 0.28, ease: 'sine.out' })
  }

  return tl
}

export function playDoxiePeek({ motion }: JumpTargets) {
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  gsap.set(motion, { transformOrigin: '50% 100%' })

  tl.to(motion, {
    y: -9,
    duration: 0.36,
    ease: 'power2.out',
  })
    .to(motion, {
      y: -3,
      duration: 0.2,
      ease: 'sine.inOut',
    })
    .to(motion, {
      y: 0,
      duration: 0.28,
      ease: 'sine.inOut',
    })

  return tl
}
