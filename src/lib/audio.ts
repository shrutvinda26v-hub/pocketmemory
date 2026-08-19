let context: AudioContext | null = null
let enabled = true

function getContext(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context ??= new Ctor()
  return context
}

export async function unlockAudio(): Promise<void> {
  const ctx = getContext()
  if (ctx && ctx.state === 'suspended') await ctx.resume()
}

function noiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
  return buffer
}

function playNoise(
  ctx: AudioContext,
  duration: number,
  gain: number,
  filterType: BiquadFilterType,
  startFreq: number,
  endFreq: number,
): void {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(ctx, duration)
  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.frequency.setValueAtTime(startFreq, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(Math.max(60, endFreq), ctx.currentTime + duration)
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(gain, ctx.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + duration)
  src.connect(filter)
  filter.connect(amp)
  amp.connect(ctx.destination)
  src.start()
  src.stop(ctx.currentTime + duration)
}

function tone(ctx: AudioContext, freq: number, duration: number, type: OscillatorType, gain: number): void {
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  amp.gain.setValueAtTime(gain, ctx.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export function playWhoosh(): void {
  const ctx = getContext()
  if (!ctx || ctx.state !== 'running') return
  playNoise(ctx, 0.32, 0.055, 'lowpass', 1400, 280)
  playNoise(ctx, 0.18, 0.03, 'bandpass', 900, 420)
}

export function playIgnite(): void {
  const ctx = getContext()
  if (!ctx || ctx.state !== 'running') return
  playNoise(ctx, 0.045, 0.05, 'highpass', 2400, 1800)
  tone(ctx, 1760, 0.12, 'triangle', 0.03)
  tone(ctx, 880, 0.16, 'sine', 0.018)
  tone(ctx, 196, 0.28, 'sine', 0.02)
  playNoise(ctx, 0.2, 0.02, 'bandpass', 700, 500)
}
