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
  surprise: {
    bubble: string
    bits: string[]
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
    headX: 0,
    headY: 0,
    headRot: 1.05,
    pupilX: 1.7,
    pupilY: 1.1,
    headLerp: 0.04,
    eyeLerp: 0.1,
    proximity: 200,
  },
  jump: { type: 'retriever' },
  surprise: { bubble: 'woof', bits: ['♥', '♥', '✦', '♥'] },
  idle: { breath: 1.2, duration: 4.8 },
  hit: { top: '0%', right: '8%', bottom: '18%', left: '8%' },
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
    headX: 0,
    headY: 0,
    headRot: 1.2,
    pupilX: 1.6,
    pupilY: 1.1,
    headLerp: 0.045,
    eyeLerp: 0.11,
    proximity: 160,
  },
  jump: { type: 'cat' },
  surprise: { bubble: 'mrrp', bits: ['✦', '✧', '✦'] },
  idle: { breath: 0.9, duration: 5.2 },
  tail: {
    src: '/images/cat-tail.png',
    width: 0.46,
    right: '-16%',
    bottom: '18%',
    origin: '12% 50%',
    rotate: -6,
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
    headX: 0,
    headY: 0,
    headRot: 1,
    pupilX: 1.5,
    pupilY: 1,
    headLerp: 0.04,
    eyeLerp: 0.11,
    proximity: 160,
  },
  jump: { type: 'doxie' },
  surprise: { bubble: 'yap!', bits: ['🦴', '✦', '🦴'] },
  idle: { breath: 1, duration: 4.4 },
  hit: { top: '2%', right: '2%', bottom: '16%', left: '2%' },
}
