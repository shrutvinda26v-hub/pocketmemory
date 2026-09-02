export type EyeConfig = {
  x: number
  y: number
  size: number
  aspect: number
}

export type TailConfig = {
  src: string
  width: number
  right?: string
  left?: string
  bottom: string
  origin: string
  rotate: number
}

export type EarConfig = {
  clip: string
  origin: string
}

export type PetId = 'retriever' | 'cat' | 'doxie'

export type PetConfig = {
  id: PetId
  src: string
  webp?: string
  alt: string
  className: string
  eyes: { left: EyeConfig; right: EyeConfig }
  look: {
    headX: number
    headY: number
    headRot: number
    pupilX: number
    pupilY: number
    headLerp: number
    eyeLerp: number
    proximity: number
  }
  jump: {
    type: 'retriever' | 'cat' | 'doxie'
  }
  idle: {
    breath: number
    duration: number
  }
  tail?: TailConfig
  ears?: { left: EarConfig; right: EarConfig }
  hit: {
    top: string
    right: string
    bottom: string
    left: string
  }
}

export const retrieverPet: PetConfig = {
  id: 'retriever',
  src: '/images/golden-retriever.png',
  webp: '/images/golden-retriever.webp',
  alt: 'Golden retriever looking at the camera',
  className: 'pet-retriever',
  eyes: {
    left: { x: 0.408, y: 0.312, size: 0.092, aspect: 0.82 },
    right: { x: 0.592, y: 0.312, size: 0.092, aspect: 0.82 },
  },
  look: {
    headX: 2.6,
    headY: 1.1,
    headRot: 1.35,
    pupilX: 2.3,
    pupilY: 1.5,
    headLerp: 0.038,
    eyeLerp: 0.09,
    proximity: 240,
  },
  jump: { type: 'retriever' },
  idle: { breath: 1.5, duration: 4.6 },
  tail: {
    src: '/images/retriever-tail.png',
    width: 0.36,
    right: '-1%',
    bottom: '28%',
    origin: '18% 58%',
    rotate: 14,
  },
  hit: { top: '0%', right: '6%', bottom: '20%', left: '6%' },
}

export const catPet: PetConfig = {
  id: 'cat',
  src: '/images/tabby-cat.png',
  alt: 'Orange tabby cat peeking over the page',
  className: 'pet-cat',
  eyes: {
    left: { x: 0.386, y: 0.372, size: 0.132, aspect: 1.02 },
    right: { x: 0.614, y: 0.372, size: 0.132, aspect: 1.02 },
  },
  look: {
    headX: 2.4,
    headY: 1.2,
    headRot: 1.6,
    pupilX: 2.1,
    pupilY: 1.4,
    headLerp: 0.046,
    eyeLerp: 0.1,
    proximity: 180,
  },
  jump: { type: 'cat' },
  idle: { breath: 1, duration: 5 },
  tail: {
    src: '/images/cat-tail.png',
    width: 0.5,
    right: '-18%',
    bottom: '18%',
    origin: '12% 50%',
    rotate: -8,
  },
  ears: {
    left: {
      clip: 'ellipse(18% 16% at 32% 24%)',
      origin: '32% 38%',
    },
    right: {
      clip: 'ellipse(18% 16% at 68% 24%)',
      origin: '68% 38%',
    },
  },
  hit: { top: '2%', right: '2%', bottom: '18%', left: '2%' },
}

export const doxiePet: PetConfig = {
  id: 'doxie',
  src: '/images/dachshund.png',
  alt: 'Brown dachshund peeking over the page',
  className: 'pet-doxie',
  eyes: {
    left: { x: 0.412, y: 0.398, size: 0.108, aspect: 0.9 },
    right: { x: 0.572, y: 0.398, size: 0.108, aspect: 0.9 },
  },
  look: {
    headX: 2.2,
    headY: 1,
    headRot: 1.3,
    pupilX: 2,
    pupilY: 1.3,
    headLerp: 0.04,
    eyeLerp: 0.11,
    proximity: 180,
  },
  jump: { type: 'doxie' },
  idle: { breath: 1.1, duration: 4.2 },
  ears: {
    left: {
      clip: 'ellipse(20% 22% at 28% 42%)',
      origin: '34% 28%',
    },
    right: {
      clip: 'ellipse(20% 22% at 72% 42%)',
      origin: '66% 28%',
    },
  },
  hit: { top: '2%', right: '2%', bottom: '16%', left: '2%' },
}
