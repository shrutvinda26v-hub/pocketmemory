"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * Procedural-ish ambient beds via tiny data URIs / oscillators would be heavy.
 * We use Howler with soft generated noise loops from Web Audio when enabled,
 * falling back gracefully if AudioContext is blocked.
 */
function createAmbientEngine() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let windGain: GainNode | null = null;
  let birdsGain: GainNode | null = null;
  let waterGain: GainNode | null = null;
  let insectsGain: GainNode | null = null;
  let windSource: AudioBufferSourceNode | null = null;
  let waterSource: AudioBufferSourceNode | null = null;
  let insectSource: AudioBufferSourceNode | null = null;
  let birdTimer: ReturnType<typeof setInterval> | null = null;
  let bellTimer: ReturnType<typeof setInterval> | null = null;
  let started = false;

  function noiseBuffer(seconds: number, color: "white" | "pink" | "brown") {
    if (!ctx) return null;
    const rate = ctx.sampleRate;
    const length = rate * seconds;
    const buffer = ctx.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (color === "white") data[i] = white * 0.4;
      else if (color === "pink") {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3;
      } else {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 4.5;
      }
    }
    return buffer;
  }

  function startLoop(
    buffer: AudioBuffer | null,
    gainValue: number,
    filterFreq: number
  ) {
    if (!ctx || !master || !buffer) return { source: null as AudioBufferSourceNode | null, gain: null as GainNode | null };
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.value = gainValue;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start();
    return { source, gain };
  }

  function chirp() {
    if (!ctx || !birdsGain) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    const now = ctx.currentTime;
    const freq = 1800 + Math.random() * 1200;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.18);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.03, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(g);
    g.connect(birdsGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  function templeBell() {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 3);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.045, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 4);
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 4.2);
  }

  return {
    async enable() {
      if (typeof window === "undefined") return;
      if (!ctx) {
        ctx = new AudioContext();
        master = ctx.createGain();
        master.gain.value = 0.55;
        master.connect(ctx.destination);
        birdsGain = ctx.createGain();
        birdsGain.gain.value = 1;
        birdsGain.connect(master);
      }
      if (ctx.state === "suspended") await ctx.resume();
      if (started) {
        if (master) master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.8);
        return;
      }
      started = true;

      const wind = startLoop(noiseBuffer(4, "brown"), 0.08, 400);
      windSource = wind.source;
      windGain = wind.gain;

      const water = startLoop(noiseBuffer(3, "pink"), 0.04, 900);
      waterSource = water.source;
      waterGain = water.gain;

      const insects = startLoop(noiseBuffer(2, "white"), 0.0, 3000);
      insectSource = insects.source;
      insectsGain = insects.gain;

      birdTimer = setInterval(() => {
        if (Math.random() > 0.45) chirp();
      }, 8000 + Math.random() * 6000);

      bellTimer = setInterval(() => {
        templeBell();
      }, 180000);

      // Soft first bell after a minute
      setTimeout(() => templeBell(), 60000);
    },
    disable() {
      if (!ctx || !master) return;
      master.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    },
    setNightInsects(on: boolean) {
      if (!insectsGain || !ctx) return;
      insectsGain.gain.linearRampToValueAtTime(on ? 0.025 : 0, ctx.currentTime + 1.5);
    },
    setWindStrength(v: number) {
      if (!windGain || !ctx) return;
      windGain.gain.linearRampToValueAtTime(0.05 + v * 0.06, ctx.currentTime + 0.5);
    },
    dispose() {
      if (birdTimer) clearInterval(birdTimer);
      if (bellTimer) clearInterval(bellTimer);
      windSource?.stop();
      waterSource?.stop();
      insectSource?.stop();
      ctx?.close();
      started = false;
      ctx = null;
    },
  };
}

export type AmbientEngine = ReturnType<typeof createAmbientEngine>;

let engine: AmbientEngine | null = null;

export function getAmbientEngine() {
  if (!engine) engine = createAmbientEngine();
  return engine;
}

export function useAmbientSound() {
  const soundEnabled = useExperienceStore((s) => s.soundEnabled);
  const progress = useExperienceStore((s) => s.progress);
  const season = useExperienceStore((s) => s.season);
  const engineRef = useRef(getAmbientEngine());

  useEffect(() => {
    const e = engineRef.current;
    if (soundEnabled) void e.enable();
    else e.disable();
  }, [soundEnabled]);

  useEffect(() => {
    const e = engineRef.current;
    const night = progress > 0.9;
    e.setNightInsects(night && soundEnabled);
  }, [progress, soundEnabled]);

  useEffect(() => {
    const strength =
      season === "autumn" ? 0.9 : season === "spring" ? 0.7 : season === "winter" ? 0.35 : 0.55;
    engineRef.current.setWindStrength(strength);
  }, [season]);

  useEffect(() => {
    return () => engineRef.current.dispose();
  }, []);
}

/** Keep Howler imported for future sample-based layers */
void Howl;
