type Osc = OscillatorNode;

function freqFromHex(hex: string, base = 392) {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  const t = (n % 1000) / 1000;
  return base * (1 + t * 0.35);
}

class Soundscape {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: GainNode | null = null;
  private muted = false;
  private hoverOsc: Osc | null = null;
  private hoverGain: GainNode | null = null;

  unlock() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.7;
    this.master.connect(ctx.destination);
    this.startAmbient();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
  }

  hover(hex: string, intensity: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    if (!this.hoverOsc) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 680;
      osc.type = "sine";
      gain.gain.value = 0;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      osc.start();
      this.hoverOsc = osc;
      this.hoverGain = gain;
    }
    this.hoverOsc.frequency.setTargetAtTime(freqFromHex(hex, 740), ctx.currentTime, 0.08);
    this.hoverGain!.gain.setTargetAtTime(intensity * 0.018, ctx.currentTime, 0.08);
  }

  chime(hex: string) {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    const now = ctx.currentTime;
    const root = freqFromHex(hex, 523);
    [0, 4, 7].forEach((semi, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.value = root * Math.pow(2, semi / 12);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07 / (i + 1), now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      osc.connect(gain);
      gain.connect(this.master!);
      osc.start(now);
      osc.stop(now + 1.5);
    });
  }

  transform(hex: string) {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 6;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freqFromHex(hex, 220), now);
    osc.frequency.exponentialRampToValueAtTime(freqFromHex(hex, 660), now + 1.4);
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 1.4);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 1.85);
  }

  resolve() {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 392;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 1.15);
  }

  private startAmbient() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const ambient = ctx.createGain();
    ambient.gain.value = 0.22;
    ambient.connect(this.master);
    this.ambient = ambient;

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.18;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambient);
    noise.start();

    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = "sine";
    drone.frequency.value = 98;
    droneGain.gain.value = 0.03;
    drone.connect(droneGain);
    droneGain.connect(ambient);
    drone.start();

    const chirp = () => {
      if (!this.ctx || !this.ambient) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sine";
      o.frequency.value = 1800 + Math.random() * 1400;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.012, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g);
      g.connect(this.ambient);
      o.start(t);
      o.stop(t + 0.14);
      window.setTimeout(chirp, 2200 + Math.random() * 5000);
    };
    window.setTimeout(chirp, 1600);
  }
}

export const soundscape = new Soundscape();
