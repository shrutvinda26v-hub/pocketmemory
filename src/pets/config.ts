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

export type PetConfig = {
  id: 'retriever' | 'cat' | 'doxie'
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
    headX: 8,
    headY: 5,
    headRot: 3,
    pupilX: 3.4,
    pupilY: 2.6,
    headLerp: 0.055,
    eyeLerp: 0.12,
    proximity: 340,
  },
  jump: { type: 'retriever' },
  idle: { breath: 2.4, duration: 3.6 },
  tail: {
    src: '/images/retriever-tail.png',
    width: 0.42,
    right: '-2%',
    bottom: '26%',
    origin: '18% 58%',
    rotate: 18,
  },
  hit: { top: '6%', right: '12%', bottom: '32%', left: '12%' },
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
    headX: 6,
    headY: 4,
    headRot: 4,
    pupilX: 3,
    pupilY: 2.4,
    headLerp: 0.07,
    eyeLerp: 0.14,
    proximity: 220,
  },
  jump: { type: 'cat' },
  idle: { breath: 1.4, duration: 4.2 },
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
  hit: { top: '8%', right: '8%', bottom: '28%', left: '8%' },
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
    headX: 5,
    headY: 3,
    headRot: 3,
    pupilX: 2.8,
    pupilY: 2.2,
    headLerp: 0.048,
    eyeLerp: 0.16,
    proximity: 220,
  },
  jump: { type: 'doxie' },
  idle: { breath: 1.8, duration: 3.2 },
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
  hit: { top: '10%', right: '10%', bottom: '26%', left: '10%' },
}
