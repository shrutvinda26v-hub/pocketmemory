import { describe, expect, it } from 'vitest'
import { CANDLE_TIMING, CandleMachine } from './candleMachine.ts'

describe('CandleMachine', () => {
  it('starts lit and ignores snaps', () => {
    const candle = new CandleMachine(0)
    candle.notifySnap(true, 10)
    const snap = candle.update(16)
    expect(snap.phase).toBe('lit')
    expect(snap.visuals.flameIntensity).toBe(1)
    expect(snap.hint).toBe('blow')
  })

  it('extinguishes after a confirmed blow', () => {
    const candle = new CandleMachine(0)
    candle.notifyBlow(0.8, true, 40)
    expect(candle.update(40).phase).toBe('extinguishing')
    expect(candle.update(40).visuals.flameBend).toBeGreaterThan(0.3)
    expect(candle.update(CANDLE_TIMING.EXTINGUISH_MS + 50).phase).toBe('extinguished')
    expect(candle.snapshot().visuals.flameIntensity).toBe(0)
    expect(candle.snapshot().hint).toBe('snap')
  })

  it('relights from a snap while extinguished', () => {
    const candle = new CandleMachine(0)
    candle.notifyBlow(1, true, 10)
    candle.update(CANDLE_TIMING.EXTINGUISH_MS + 20)
    candle.notifySnap(true, 2000)
    expect(candle.update(2000).phase).toBe('relighting')
    expect(candle.update(2000).visuals.spark).toBeGreaterThan(0)
    expect(candle.update(2000 + CANDLE_TIMING.RELIGHT_MS + 20).phase).toBe('lit')
    expect(candle.snapshot().visuals.flameIntensity).toBe(1)
    expect(candle.snapshot().hint).toBe('blow')
  })

  it('ignores blow while extinguished', () => {
    const candle = new CandleMachine(0)
    candle.notifyBlow(1, true, 0)
    candle.update(CANDLE_TIMING.EXTINGUISH_MS + 10)
    candle.notifyBlow(1, true, 1800)
    expect(candle.update(1800).phase).toBe('extinguished')
  })

  it('bends the flame from live blow intensity before the threshold', () => {
    const candle = new CandleMachine(0)
    candle.notifyBlow(0.6, false, 30)
    const snap = candle.update(30)
    expect(snap.phase).toBe('lit')
    expect(snap.visuals.flameBend).toBeGreaterThan(0.4)
    expect(snap.visuals.flameTurbulence).toBeGreaterThan(0.7)
  })
})
