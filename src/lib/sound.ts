"use client";

import { useEffect, useRef } from "react";
import {
  useExperienceStore,
  type Season,
} from "@/store/useExperienceStore";

/**
 * Soothing seasonal wind-chime beds + soft interaction tones.
 * Each season has its own scale, tempo, and chime character.
 */
type SeasonChimeProfile = {
  /** Frequencies for random sweet chimes (Hz) */
  notes: number[];
  /** Soft underpinning drone (very quiet) */
  drone: number[];
  /** How often ambient chimes fire (ms) */
  intervalMin: number;
  intervalMax: number;
  /** Chime brightness / filter */
  brightness: number;
  /** Decay length of each chime */
  decay: number;
  /** Volume of ambient chimes */
  volume: number;
  /** Partial count feel: more = sweeter metal */
  harmonics: number;
};

const SEASON_CHIMES: Record<Season, SeasonChimeProfile> = {
  // Soft raindrop / temple tones — cool, watery, calm
  rain: {
    notes: [349.23, 392.0, 466.16, 523.25, 587.33, 698.46], // F4–F5 softer
    drone: [87.31, 130.81],
    intervalMin: 2600,
    intervalMax: 4800,
    brightness: 2200,
    decay: 3.0,
    volume: 0.038,
    harmonics: 2,
  },
  // Warm wooden wind chimes — calm afternoon
  summer: {
    notes: [392.0, 440.0, 493.88, 587.33, 659.25, 784.0], // G4–G5
    drone: [98.0, 146.83],
    intervalMin: 2800,
    intervalMax: 5200,
    brightness: 2400,
    decay: 3.2,
    volume: 0.042,
    harmonics: 2,
  },
  // Amber temple tones — deeper, slower, nostalgic
  autumn: {
    notes: [293.66, 349.23, 392.0, 440.0, 523.25, 587.33], // D4–D5 warmer
    drone: [87.31, 130.81],
    intervalMin: 3600,
    intervalMax: 6500,
    brightness: 1800,
    decay: 3.8,
    volume: 0.04,
    harmonics: 2,
  },
  // Crystal ice chimes — sparse, clear, hush
  winter: {
    notes: [659.25, 783.99, 987.77, 1174.7, 1318.5], // E5–E6 sparse
    drone: [82.41, 123.47],
    intervalMin: 4500,
    intervalMax: 8000,
    brightness: 4000,
    decay: 4.2,
    volume: 0.032,
    harmonics: 4,
  },
};

function createAmbientEngine() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let windGain: GainNode | null = null;
  let birdsGain: GainNode | null = null;
  let insectsGain: GainNode | null = null;
  let musicGain: GainNode | null = null;
  let sfxGain: GainNode | null = null;
  let windSource: AudioBufferSourceNode | null = null;
  let waterSource: AudioBufferSourceNode | null = null;
  let insectSource: AudioBufferSourceNode | null = null;
  let droneOscs: OscillatorNode[] = [];
  let birdTimer: ReturnType<typeof setInterval> | null = null;
  let chimeTimer: ReturnType<typeof setTimeout> | null = null;
  let started = false;
  let musicOn = false;
  let lastRustle = 0;
  let lastChime = 0;
  let currentSeason: Season = "summer";

  function ensure() {
    if (typeof window === "undefined") return false;
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.62;
      master.connect(ctx.destination);

      birdsGain = ctx.createGain();
      birdsGain.gain.value = 0.85;
      birdsGain.connect(master);

      musicGain = ctx.createGain();
      musicGain.gain.value = 0.0;
      musicGain.connect(master);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.9;
      sfxGain.connect(master);
    }
    return true;
  }

  function profile() {
    return SEASON_CHIMES[currentSeason];
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
    const freq = 1600 + Math.random() * 900;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.18);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.018, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(g);
    g.connect(birdsGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Sweet metallic / glass wind chime with soft harmonics */
  function playSweetChime(
    freq: number,
    volume: number,
    decay: number,
    brightness: number,
    harmonics: number,
    dest: GainNode | null = musicGain
  ) {
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const masterG = ctx.createGain();
    masterG.gain.setValueAtTime(0, now);
    masterG.gain.linearRampToValueAtTime(volume, now + 0.012);
    masterG.gain.exponentialRampToValueAtTime(0.001, now + decay);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = brightness;
    filter.Q.value = 0.7;
    filter.connect(masterG);
    masterG.connect(dest);

    // Fundamental + shimmering partials (inharmonic like real chimes)
    const partials = [1, 2.76, 5.4, 8.93].slice(0, Math.max(2, harmonics));
    const gains = [1, 0.35, 0.18, 0.08];

    partials.forEach((ratio, i) => {
      const osc = ctx!.createOscillator();
      const g = ctx!.createGain();
      osc.type = i === 0 ? "sine" : "sine";
      const f = Math.max(40, freq * ratio);
      osc.frequency.setValueAtTime(f, now);
      // Tiny detune shimmer
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
      g.gain.value = gains[i] ?? 0.05;
      osc.connect(g);
      g.connect(filter);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  }

  function playRandomAmbientChime() {
    if (!ctx || !musicGain || !musicOn) return;
    const p = profile();
    const note = p.notes[Math.floor(Math.random() * p.notes.length)];
    playSweetChime(note, p.volume, p.decay, p.brightness, p.harmonics, musicGain);
    // Occasional soft second chime for sweetness
    if (Math.random() > 0.55) {
      const delay = 180 + Math.random() * 320;
      const note2 = p.notes[Math.floor(Math.random() * p.notes.length)];
      setTimeout(() => {
        if (!musicOn) return;
        playSweetChime(
          note2,
          p.volume * 0.65,
          p.decay * 0.9,
          p.brightness,
          p.harmonics,
          musicGain
        );
      }, delay);
    }
  }

  function scheduleNextChime() {
    if (chimeTimer) clearTimeout(chimeTimer);
    if (!musicOn) return;
    const p = profile();
    const wait =
      p.intervalMin + Math.random() * (p.intervalMax - p.intervalMin);
    chimeTimer = setTimeout(() => {
      playRandomAmbientChime();
      scheduleNextChime();
    }, wait);
  }

  function startDrone() {
    if (!ctx || !musicGain) return;
    stopDrone(true);
    const p = profile();
    p.drone.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const osc2 = ctx!.createOscillator();
      const g = ctx!.createGain();
      const filter = ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      osc.type = "sine";
      osc2.type = "sine";
      osc.frequency.value = freq;
      osc2.frequency.value = freq * 1.002;
      g.gain.value = 0.09 - i * 0.02;
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(g);
      g.connect(musicGain!);
      osc.start();
      osc2.start();
      droneOscs.push(osc, osc2);
    });
  }

  function stopDrone(immediate = false) {
    droneOscs.forEach((o) => {
      try {
        o.stop(immediate ? undefined : undefined);
      } catch {
        /* already stopped */
      }
    });
    droneOscs = [];
  }

  function startChimeMusic() {
    if (!ctx || !musicGain) return;
    musicOn = true;
    const now = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), now);
    musicGain.gain.linearRampToValueAtTime(0.85, now + 1.4);
    startDrone();
    // Opening chime welcome
    const p = profile();
    playSweetChime(
      p.notes[Math.min(2, p.notes.length - 1)],
      p.volume * 1.2,
      p.decay,
      p.brightness,
      p.harmonics,
      musicGain
    );
    setTimeout(() => {
      if (musicOn)
        playSweetChime(
          p.notes[0],
          p.volume * 0.9,
          p.decay * 1.1,
          p.brightness,
          p.harmonics,
          musicGain
        );
    }, 500);
    scheduleNextChime();
  }

  function stopChimeMusic() {
    if (!ctx || !musicGain) return;
    musicOn = false;
    const now = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
    if (chimeTimer) {
      clearTimeout(chimeTimer);
      chimeTimer = null;
    }
    setTimeout(() => stopDrone(true), 1100);
  }

  return {
    async enable() {
      if (!ensure() || !ctx || !master) return;
      if (ctx.state === "suspended") await ctx.resume();
      currentSeason = useExperienceStore.getState().season;
      if (started) {
        master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.5);
        if (!musicOn) startChimeMusic();
        return;
      }
      started = true;

      const wind = startLoop(noiseBuffer(4, "brown"), 0.045, 360);
      windSource = wind.source;
      windGain = wind.gain;

      const water = startLoop(noiseBuffer(3, "pink"), 0.025, 800);
      waterSource = water.source;

      const insects = startLoop(noiseBuffer(2, "white"), 0.0, 2800);
      insectSource = insects.source;
      insectsGain = insects.gain;

      startChimeMusic();

      birdTimer = setInterval(() => {
        if (Math.random() > 0.55) chirp();
      }, 10000 + Math.random() * 8000);
    },
    disable() {
      if (!ctx || !master) return;
      stopChimeMusic();
      master.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    },
    setSeason(season: Season) {
      const prev = currentSeason;
      currentSeason = season;
      if (!musicOn || !ctx || !musicGain) return;
      if (prev === season) return;
      // Crossfade character: restart soft drone + play a signature chime
      startDrone();
      const p = profile();
      playSweetChime(
        p.notes[Math.floor(p.notes.length / 2)],
        p.volume * 1.35,
        p.decay,
        p.brightness,
        p.harmonics,
        musicGain
      );
      setTimeout(() => {
        if (!musicOn) return;
        playSweetChime(
          p.notes[0],
          p.volume,
          p.decay * 1.15,
          p.brightness,
          p.harmonics,
          musicGain
        );
      }, 350);
      scheduleNextChime();
    },
    setNightInsects(on: boolean) {
      if (!insectsGain || !ctx) return;
      insectsGain.gain.linearRampToValueAtTime(
        on ? 0.015 : 0,
        ctx.currentTime + 1.5
      );
    },
    setWindStrength(v: number) {
      if (!windGain || !ctx) return;
      windGain.gain.linearRampToValueAtTime(
        0.03 + v * 0.04,
        ctx.currentTime + 0.5
      );
    },
    /** Soft leaf rustle + tiny seasonal sparkle */
    playLeafRustle() {
      if (!ensure() || !ctx || !sfxGain) return;
      const nowMs = performance.now();
      if (nowMs - lastRustle < 90) return;
      lastRustle = nowMs;
      void ctx.resume();
      currentSeason = useExperienceStore.getState().season;

      const buf = noiseBuffer(0.18, "pink");
      if (!buf) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1500 + Math.random() * 900;
      filter.Q.value = 0.7;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.08, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      src.connect(filter);
      filter.connect(g);
      g.connect(sfxGain);
      src.start(now);
      src.stop(now + 0.18);

      const p = profile();
      const note = p.notes[Math.floor(Math.random() * p.notes.length)];
      playSweetChime(
        note,
        0.016,
        1.1,
        p.brightness * 0.85,
        Math.min(2, p.harmonics),
        sfxGain
      );
    },
    /** Sweet seasonal chime on click / interaction */
    playInteractionChime() {
      if (!ensure() || !ctx || !sfxGain) return;
      const nowMs = performance.now();
      if (nowMs - lastChime < 160) return;
      lastChime = nowMs;
      void ctx.resume();
      currentSeason = useExperienceStore.getState().season;
      const p = profile();
      const i = Math.floor(Math.random() * p.notes.length);
      const note = p.notes[i];
      playSweetChime(note, 0.055, p.decay * 0.85, p.brightness, p.harmonics, sfxGain);
      playSweetChime(
        p.notes[(i + 2) % p.notes.length],
        0.032,
        p.decay,
        p.brightness,
        p.harmonics,
        sfxGain
      );
    },
    playWoodTap() {
      if (!ensure() || !ctx || !sfxGain) return;
      void ctx.resume();
      const p = profile();
      playSweetChime(p.notes[0] * 0.5, 0.025, 0.6, 900, 2, sfxGain);
      this.playLeafRustle();
    },
    playBlossomTone() {
      if (!ensure() || !ctx || !sfxGain) return;
      void ctx.resume();
      currentSeason = useExperienceStore.getState().season;
      const p = profile();
      playSweetChime(
        p.notes[p.notes.length - 1],
        0.035,
        1.6,
        p.brightness,
        p.harmonics,
        sfxGain
      );
    },
    playBirdLand() {
      if (!ensure() || !ctx || !sfxGain) return;
      void ctx.resume();
      chirp();
      const p = profile();
      playSweetChime(p.notes[1] ?? p.notes[0], 0.02, 0.8, p.brightness, 2, sfxGain);
    },
    playSeasonChange(next?: Season) {
      if (!ensure() || !ctx || !sfxGain) return;
      void ctx.resume();
      const season = next ?? useExperienceStore.getState().season;
      this.setSeason(season);
      const p = SEASON_CHIMES[season];
      playSweetChime(p.notes[0], 0.05, p.decay, p.brightness, p.harmonics, sfxGain);
      setTimeout(() => {
        playSweetChime(
          p.notes[Math.min(3, p.notes.length - 1)],
          0.04,
          p.decay,
          p.brightness,
          p.harmonics,
          sfxGain
        );
      }, 280);
    },
    dispose() {
      if (birdTimer) clearInterval(birdTimer);
      if (chimeTimer) clearTimeout(chimeTimer);
      stopChimeMusic();
      windSource?.stop();
      waterSource?.stop();
      insectSource?.stop();
      ctx?.close();
      started = false;
      musicOn = false;
      ctx = null;
      droneOscs = [];
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
        : season === "rain"
          ? 0.85
          : season === "winter"
            ? 0.4
            : 0.45;
    engineRef.current.setWindStrength(strength);
    engineRef.current.setSeason(season);
  }, [season]);

  useEffect(() => {
    return () => engineRef.current.dispose();
  }, []);
}
