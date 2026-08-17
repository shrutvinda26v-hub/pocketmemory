let context: AudioContext | null = null
let enabled = true

function getContext(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context ??= new Ctor()
  return context
}

export async function unlockAudio(): Promise<void> {
  const ctx = getContext()
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume()
  }
}

export function setAudioEnabled(value: boolean): void {
  enabled = value
}

function tone(frequency: number, duration: number, type: OscillatorType, gain = 0.035): void {
  const ctx = getContext()
  if (!ctx || ctx.state !== 'running') return
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)
  amp.gain.setValueAtTime(gain, ctx.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export function playSummon(): void {
  tone(523.25, 0.18, 'sine', 0.03)
  tone(783.99, 0.28, 'triangle', 0.02)
}

export function playDissolve(): void {
  tone(392, 0.22, 'sine', 0.025)
  tone(311.13, 0.32, 'triangle', 0.018)
}

export function playMaterialize(): void {
  tone(659.25, 0.2, 'sine', 0.028)
  tone(987.77, 0.28, 'triangle', 0.016)
}

export function playReset(): void {
  tone(246.94, 0.24, 'sine', 0.02)
}
