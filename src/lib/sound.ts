"use client";

import { useEffect, useRef } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * Web Audio ambient bed + soft interaction tones.
 * Soothing pentatonic pad for music; rustle/chime/tap for interactions.
 */
function createAmbientEngine() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let windGain: GainNode | null = null;
  let birdsGain: GainNode | null = null;
  let waterGain: GainNode | null = null;
  let insectsGain: GainNode | null = null;
  let musicGain: GainNode | null = null;
  let sfxGain: GainNode | null = null;
  let windSource: AudioBufferSourceNode | null = null;
  let waterSource: AudioBufferSourceNode | null = null;
  let insectSource: AudioBufferSourceNode | null = null;
  let musicOscs: OscillatorNode[] = [];
  let birdTimer: ReturnType<typeof setInterval> | null = null;
  let bellTimer: ReturnType<typeof setInterval> | null = null;
  let musicTimer: ReturnType<typeof setInterval> | null = null;
  let started = false;
  let lastRustle = 0;
  let lastChime = 0;

  function ensure() {
    if (typeof window === "undefined") return false;
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.65;
      master.connect(ctx.destination);

      birdsGain = ctx.createGain();
      birdsGain.gain.value = 1;
      birdsGain.connect(master);

      musicGain = ctx.createGain();
      musicGain.gain.value = 0.0;
      musicGain.connect(master);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.95;
      sfxGain.connect(master);
    }
    return true;
  }

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
    if (!ctx || !master || !buffer)
      return {
        source: null as AudioBufferSourceNode | null,
        gain: null as GainNode | null,
      };
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
    g.gain.linearRampToValueAtTime(0.025, now + 0.02);
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
    g.gain.linearRampToValueAtTime(0.04, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 4);
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 4.2);
  }

  /** Soft pentatonic pad — G major-ish calm tones */
  const PAD_NOTES = [98, 123.47, 146.83, 196, 246.94, 293.66]; // G2–D4 family

  function startMusicPad() {
    if (!ctx || !musicGain || musicOscs.length) return;
    const now = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0.16, now + 2.0);

    // Two slow detuned sines per drone note
    [PAD_NOTES[0], PAD_NOTES[2], PAD_NOTES[3]].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const osc2 = ctx!.createOscillator();
      const g = ctx!.createGain();
      const filter = ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 600;
      osc.type = "sine";
      osc2.type = "sine";
      osc.frequency.value = freq;
      osc2.frequency.value = freq * 1.002;
      g.gain.value = 0.32 - i * 0.05;
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(g);
      g.connect(musicGain!);
      osc.start();
      osc2.start();
      musicOscs.push(osc, osc2);
    });

    // Occasional soft melody notes
    musicTimer = setInterval(() => {
      if (!ctx || !musicGain) return;
      playSoftNote(PAD_NOTES[2 + Math.floor(Math.random() * 4)], 0.028, 2.0);
    }, 7000 + Math.random() * 5000);
  }

  function stopMusicPad() {
    if (!ctx || !musicGain) return;
    const now = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    setTimeout(() => {
      musicOscs.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* already stopped */
        }
      });
      musicOscs = [];
    }, 1400);
  }

  function playSoftNote(freq: number, volume: number, duration: number) {
    if (!ctx || !sfxGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + duration);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(volume, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(filter);
    filter.connect(g);
    g.connect(sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  return {
    async enable() {
      if (!ensure() || !ctx || !master) return;
      if (ctx.state === "suspended") await ctx.resume();
      if (started) {
        master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.6);
        startMusicPad();
        return;
      }
      started = true;

      const wind = startLoop(noiseBuffer(4, "brown"), 0.06, 380);
      windSource = wind.source;
      windGain = wind.gain;

      const water = startLoop(noiseBuffer(3, "pink"), 0.035, 850);
      waterSource = water.source;
      waterGain = water.gain;

      const insects = startLoop(noiseBuffer(2, "white"), 0.0, 2800);
      insectSource = insects.source;
      insectsGain = insects.gain;

      startMusicPad();

      birdTimer = setInterval(() => {
        if (Math.random() > 0.5) chirp();
      }, 9000 + Math.random() * 7000);

      bellTimer = setInterval(() => templeBell(), 180000);
      setTimeout(() => templeBell(), 45000);
    },
    disable() {
      if (!ctx || !master) return;
      stopMusicPad();
      master.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    },
    setNightInsects(on: boolean) {
      if (!insectsGain || !ctx) return;
      insectsGain.gain.linearRampToValueAtTime(
        on ? 0.02 : 0,
        ctx.currentTime + 1.5
      );
    },
    setWindStrength(v: number) {
      if (!windGain || !ctx) return;
      windGain.gain.linearRampToValueAtTime(
        0.04 + v * 0.05,
        ctx.currentTime + 0.5
      );
    },
    /** Soft leaf rustle — throttled for hover */
    playLeafRustle() {
      if (!ensure() || !ctx || !sfxGain) return;
      const nowMs = performance.now();
      if (nowMs - lastRustle < 90) return;
      lastRustle = nowMs;
      void ctx.resume();

      const buf = noiseBuffer(0.18, "pink");
      if (!buf) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800 + Math.random() * 900;
      filter.Q.value = 0.8;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.09, now + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      src.connect(filter);
      filter.connect(g);
      g.connect(sfxGain);
      src.start(now);
      src.stop(now + 0.2);
    },
    /** Soft chime on leaf click / meaningful interaction */
    playInteractionChime() {
      if (!ensure() || !ctx || !sfxGain) return;
      const nowMs = performance.now();
      if (nowMs - lastChime < 180) return;
      lastChime = nowMs;
      void ctx.resume();
      const note = PAD_NOTES[3 + Math.floor(Math.random() * 3)];
      playSoftNote(note, 0.07, 1.6);
      playSoftNote(note * 1.5, 0.035, 1.3);
      playSoftNote(note * 2, 0.02, 1.0);
    },
    playWoodTap() {
      if (!ensure() || !ctx || !sfxGain) return;
      void ctx.resume();
      playSoftNote(180 + Math.random() * 40, 0.03, 0.35);
      this.playLeafRustle();
    },
    playBlossomTone() {
      if (!ensure() || !ctx) return;
      void ctx.resume();
      playSoftNote(392 + Math.random() * 80, 0.03, 1.2);
    },
    playBirdLand() {
      if (!ensure() || !ctx) return;
      void ctx.resume();
      chirp();
      playSoftNote(220, 0.02, 0.5);
    },
    playSeasonChange() {
      if (!ensure() || !ctx) return;
      void ctx.resume();
      playSoftNote(164.81, 0.03, 1.6);
      setTimeout(() => playSoftNote(246.94, 0.025, 1.4), 220);
    },
    dispose() {
      if (birdTimer) clearInterval(birdTimer);
      if (bellTimer) clearInterval(bellTimer);
      if (musicTimer) clearInterval(musicTimer);
      stopMusicPad();
      windSource?.stop();
      waterSource?.stop();
      insectSource?.stop();
      ctx?.close();
      started = false;
      ctx = null;
      musicOscs = [];
    },
  };
}

export type AmbientEngine = ReturnType<typeof createAmbientEngine>;

let engine: AmbientEngine | null = null;

export function getAmbientEngine() {
  if (!engine) engine = createAmbientEngine();
  return engine;
}

/** Enable sound on first gesture if not already on */
export function ensureSoundOnInteraction() {
  const store = useExperienceStore.getState();
  const e = getAmbientEngine();
  if (!store.soundEnabled) {
    store.setSoundEnabled(true);
  }
  void e.enable();
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
      season === "autumn"
        ? 0.9
        : season === "spring"
          ? 0.7
          : season === "winter"
            ? 0.35
            : 0.55;
    engineRef.current.setWindStrength(strength);
  }, [season]);

  useEffect(() => {
    return () => engineRef.current.dispose();
  }, []);
}
