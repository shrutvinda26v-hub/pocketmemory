import gsap from "gsap";
import { createButterflies, drawButterflies, updateButterflies } from "./butterflies";
import {
  createParticles,
  drawParticles,
  spawnBurst,
  updateParticles,
} from "./particles";
import { cappedDpr, detectDeviceTier, getButterflyCount, getParticleBudget } from "./performance";
import type {
  Butterfly,
  EnergyPulse,
  InteractionPoint,
  ParallaxOffset,
  Particle,
} from "./sceneTypes";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export class SceneEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;
  private glowCanvas: HTMLCanvasElement;
  private glowCtx: CanvasRenderingContext2D;
  private waterCanvas: HTMLCanvasElement;
  private waterCtx: CanvasRenderingContext2D;
  private snapshotCanvas: HTMLCanvasElement;
  private snapshotCtx: CanvasRenderingContext2D;
  private tier = detectDeviceTier();

  private baseImg: HTMLImageElement | null = null;
  private glowImg: HTMLImageElement | null = null;
  private butterflyImg: HTMLImageElement | null = null;

  private particles: Particle[] = [];
  private butterflies: Butterfly[] = [];
  private pulses: EnergyPulse[] = [];

  private raf = 0;
  private lastTime = 0;
  private time = 0;
  private sceneOpacity = 0;
  private ambientGlow = 0.08;
  private firstAwaken = false;
  private burstCooldown = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private destroyed = false;

  private interaction: InteractionPoint = {
    x: 0,
    y: 0,
    active: false,
    source: "none",
    strength: 0,
  };
  private parallax: ParallaxOffset = { x: 0, y: 0 };
  private targetParallax: ParallaxOffset = { x: 0, y: 0 };
  private trail: Array<{ x: number; y: number; life: number }> = [];

  onFirstAwaken?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D context unavailable");
    this.ctx = ctx;

    this.lightCanvas = document.createElement("canvas");
    this.glowCanvas = document.createElement("canvas");
    this.waterCanvas = document.createElement("canvas");
    this.snapshotCanvas = document.createElement("canvas");
    this.lightCtx = this.lightCanvas.getContext("2d")!;
    this.glowCtx = this.glowCanvas.getContext("2d")!;
    this.waterCtx = this.waterCanvas.getContext("2d")!;
    this.snapshotCtx = this.snapshotCanvas.getContext("2d")!;
  }

  async init() {
    this.tier = detectDeviceTier();
    const [base, glow, butterfly] = await Promise.all([
      loadImage("/assets/tree-base-dark.webp"),
      loadImage("/assets/tree-glow-awake.webp"),
      loadImage("/assets/butterfly.webp"),
    ]);
    if (this.destroyed) return;
    this.baseImg = base;
    this.glowImg = glow;
    this.butterflyImg = butterfly;
    this.resize();
    this.particles = createParticles(getParticleBudget(this.tier), this.width, this.height);
    this.butterflies = createButterflies(getButterflyCount(this.tier), this.width, this.height);
    gsap.to(this, { sceneOpacity: 1, duration: 2.8, ease: "power2.out" });
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  resize = () => {
    this.dpr = cappedDpr();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    for (const c of [
      this.canvas,
      this.lightCanvas,
      this.glowCanvas,
      this.waterCanvas,
      this.snapshotCanvas,
    ]) {
      c.width = Math.floor(this.width * this.dpr);
      c.height = Math.floor(this.height * this.dpr);
      c.style.width = `${this.width}px`;
      c.style.height = `${this.height}px`;
    }
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.lightCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.glowCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.waterCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.snapshotCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  setInteraction(point: InteractionPoint) {
    this.interaction = point;
  }

  setParallaxTarget(nx: number, ny: number) {
    // nx/ny in -1..1
    this.targetParallax = { x: nx, y: ny };
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    gsap.killTweensOf(this);
  }

  private coverDraw(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    ox: number,
    oy: number,
  ) {
    const scale = Math.max(this.width / img.width, this.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (this.width - w) / 2 + ox;
    const y = (this.height - h) / 2 + oy;
    ctx.drawImage(img, x, y, w, h);
  }

  private stampLight(x: number, y: number, strength: number) {
    const minDim = Math.min(this.width, this.height);
    const core = minDim * 0.055;
    const strong = minDim * 0.11;
    const soft = minDim * 0.22;
    const ambient = minDim * 0.36;

    const g = this.lightCtx.createRadialGradient(x, y, 0, x, y, ambient);
    g.addColorStop(0, `rgba(255,255,255,${0.55 * strength})`);
    g.addColorStop(core / ambient, `rgba(255,255,255,${0.38 * strength})`);
    g.addColorStop(strong / ambient, `rgba(255,255,255,${0.2 * strength})`);
    g.addColorStop(soft / ambient, `rgba(255,255,255,${0.08 * strength})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    this.lightCtx.globalCompositeOperation = "lighter";
    this.lightCtx.fillStyle = g;
    this.lightCtx.beginPath();
    this.lightCtx.arc(x, y, ambient, 0, Math.PI * 2);
    this.lightCtx.fill();
  }

  private fadeLightMap(dt: number) {
    // Slow decay leaves a subtle trail of awakening
    this.lightCtx.globalCompositeOperation = "destination-in";
    this.lightCtx.fillStyle = `rgba(0,0,0,${Math.max(0.92, 1 - dt * 0.18)})`;
    this.lightCtx.fillRect(0, 0, this.width, this.height);
    this.lightCtx.globalCompositeOperation = "source-over";
  }

  private spawnPulse(x: number, y: number) {
    // Prefer energy flowing along branch-like angles from trunk center
    const trunkX = this.width * 0.58;
    const trunkY = this.height * 0.55;
    const angle = Math.atan2(y - trunkY, x - trunkX) + (Math.random() - 0.5) * 0.6;
    this.pulses.push({
      x,
      y,
      angle,
      dist: 0,
      maxDist: 80 + Math.random() * 140,
      life: 0,
      maxLife: 0.9 + Math.random() * 0.7,
      width: 10 + Math.random() * 18,
    });
    if (this.pulses.length > 24) this.pulses.shift();
  }

  private updatePulses(dt: number) {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.life += dt;
      p.dist += dt * 140;
      if (p.life >= p.maxLife) this.pulses.splice(i, 1);
    }
  }

  private drawPulses(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.pulses) {
      const t = p.life / p.maxLife;
      const alpha = (1 - t) * 0.55;
      const x = p.x + Math.cos(p.angle) * p.dist + ox;
      const y = p.y + Math.sin(p.angle) * p.dist + oy;
      const g = ctx.createRadialGradient(x, y, 0, x, y, p.width);
      g.addColorStop(0, `rgba(200,255,255,${alpha})`);
      g.addColorStop(0.4, `rgba(0,229,255,${alpha * 0.7})`);
      g.addColorStop(1, "rgba(0,80,180,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, p.width, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawWater(sceneSnapshot: HTMLCanvasElement, ox: number) {
    const waterTop = this.height * 0.78;
    const waterH = this.height - waterTop;
    if (waterH <= 0) return;

    this.waterCtx.clearRect(0, 0, this.width, this.height);
    // Sample from just above water line, flipped
    const sampleH = Math.min(waterH * 1.15, this.height * 0.35);
    this.waterCtx.save();
    this.waterCtx.translate(0, waterTop + sampleH);
    this.waterCtx.scale(1, -1);

    // Ripple slices
    const slices = 28;
    const sliceH = sampleH / slices;
    for (let i = 0; i < slices; i++) {
      const sy = waterTop - sampleH + i * sliceH;
      const wave =
        Math.sin(this.time * 2.2 + i * 0.55) * 3.5 +
        Math.sin(this.time * 1.1 + i * 0.2) * 1.5;
      this.waterCtx.drawImage(
        sceneSnapshot,
        0,
        sy * this.dpr,
        this.width * this.dpr,
        sliceH * this.dpr,
        wave + ox * 0.3,
        i * sliceH,
        this.width,
        sliceH + 1,
      );
    }
    this.waterCtx.restore();

    // Soft fade + tint
    const grad = this.waterCtx.createLinearGradient(0, waterTop, 0, this.height);
    grad.addColorStop(0, "rgba(0,8,20,0.15)");
    grad.addColorStop(0.35, "rgba(0,20,40,0.45)");
    grad.addColorStop(1, "rgba(0,5,15,0.85)");
    this.waterCtx.globalCompositeOperation = "destination-in";
    const alphaMask = this.waterCtx.createLinearGradient(0, waterTop, 0, this.height);
    alphaMask.addColorStop(0, "rgba(0,0,0,0)");
    alphaMask.addColorStop(0.15, "rgba(0,0,0,0.55)");
    alphaMask.addColorStop(1, "rgba(0,0,0,0.85)");
    this.waterCtx.fillStyle = alphaMask;
    this.waterCtx.fillRect(0, waterTop, this.width, waterH);
    this.waterCtx.globalCompositeOperation = "source-atop";
    this.waterCtx.fillStyle = grad;
    this.waterCtx.fillRect(0, waterTop, this.width, waterH);
    this.waterCtx.globalCompositeOperation = "source-over";

    // shimmer highlights when lit
    this.waterCtx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {
      const sx =
        ((this.time * 30 + i * 97) % (this.width + 100)) - 50 + Math.sin(this.time + i) * 20;
      const sy = waterTop + 10 + ((i * 37) % waterH);
      const shimmer = this.waterCtx.createRadialGradient(sx, sy, 0, sx, sy, 40);
      shimmer.addColorStop(0, "rgba(80,200,255,0.12)");
      shimmer.addColorStop(1, "rgba(80,200,255,0)");
      this.waterCtx.fillStyle = shimmer;
      this.waterCtx.beginPath();
      this.waterCtx.ellipse(sx, sy, 50, 8, 0, 0, Math.PI * 2);
      this.waterCtx.fill();
    }

    this.ctx.drawImage(this.waterCanvas, 0, 0, this.width, this.height);
  }

  private drawCursor(ctx: CanvasRenderingContext2D) {
    if (!this.interaction.active && this.interaction.strength <= 0.05) return;
    if (this.interaction.source === "mouse" && !this.interaction.active) return;
    const { x, y, strength } = this.interaction;
    const pulse = 0.85 + Math.sin(this.time * 8) * 0.15;
    const r = 10 + strength * 8;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, `rgba(230,255,255,${0.9 * strength * pulse})`);
    g.addColorStop(0.25, `rgba(0,229,255,${0.55 * strength})`);
    g.addColorStop(1, "rgba(0,100,200,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(240,255,255,${0.85 * strength})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private loop = (now: number) => {
    if (this.destroyed) return;
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.time += dt;
    this.burstCooldown = Math.max(0, this.burstCooldown - dt);

    this.ambientGlow = 0.07 + Math.sin(this.time * 0.7) * 0.015;

    // Parallax ease
    this.parallax.x += (this.targetParallax.x - this.parallax.x) * 0.06;
    this.parallax.y += (this.targetParallax.y - this.parallax.y) * 0.06;

    const bgX = this.parallax.x * 5;
    const bgY = this.parallax.y * 5;
    const treeX = this.parallax.x * 10;
    const treeY = this.parallax.y * 10;
    const partX = this.parallax.x * 15;
    const partY = this.parallax.y * 15;
    const fgX = this.parallax.x * 20;
    const fgY = this.parallax.y * 20;

    const handActive = this.interaction.active || this.interaction.strength > 0.2;
    const hx = this.interaction.x;
    const hy = this.interaction.y;
    const strength = Math.max(
      this.interaction.strength,
      this.interaction.active ? 1 : 0,
    );

    // Light map
    this.fadeLightMap(dt);
    // ambient base illumination so tree isn't fully dead
    this.lightCtx.globalCompositeOperation = "lighter";
    this.lightCtx.fillStyle = `rgba(255,255,255,${this.ambientGlow * 0.04})`;
    this.lightCtx.fillRect(0, 0, this.width, this.height);

    if (handActive && strength > 0.05) {
      this.stampLight(hx, hy, strength);
      this.trail.push({ x: hx, y: hy, life: 1 });
      if (this.trail.length > 18) this.trail.shift();

      if (!this.firstAwaken) {
        this.firstAwaken = true;
        this.onFirstAwaken?.();
        spawnBurst(this.particles, hx, hy, 18, this.width, this.height);
        this.spawnPulse(hx, hy);
      }

      if (this.burstCooldown <= 0 && (this.interaction.source === "hand" || this.interaction.source === "touch")) {
        if (Math.random() < 0.35) {
          spawnBurst(this.particles, hx, hy, 6, this.width, this.height);
          this.spawnPulse(hx, hy);
          this.burstCooldown = 0.18;
        }
      }
    }

    for (const t of this.trail) {
      t.life -= dt * 1.6;
      if (t.life > 0) this.stampLight(t.x, t.y, t.life * 0.25 * strength);
    }
    this.trail = this.trail.filter((t) => t.life > 0);

    updateParticles(this.particles, dt, hx, hy, handActive, this.width, this.height);
    updateButterflies(this.butterflies, dt, hx, hy, handActive, this.time);
    this.updatePulses(dt);

    // --- Compose scene ---
    const ctx = this.ctx;
    ctx.globalAlpha = 1;
    // Background atmosphere
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, "#000814");
    sky.addColorStop(0.55, "#001d3d");
    sky.addColorStop(0.78, "#002b5b");
    sky.addColorStop(1, "#0a1628");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    // Warm horizon wash
    const horizon = ctx.createRadialGradient(
      this.width * 0.12 + bgX,
      this.height * 0.72 + bgY,
      0,
      this.width * 0.12 + bgX,
      this.height * 0.72 + bgY,
      this.width * 0.45,
    );
    horizon.addColorStop(0, "rgba(255,140,0,0.28)");
    horizon.addColorStop(0.45, "rgba(255,100,20,0.08)");
    horizon.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.globalAlpha = this.sceneOpacity;

    if (this.baseImg) {
      this.coverDraw(ctx, this.baseImg, treeX, treeY);
    }

    // Build masked glow layer
    if (this.glowImg) {
      this.glowCtx.clearRect(0, 0, this.width, this.height);
      this.coverDraw(this.glowCtx, this.glowImg, treeX, treeY);
      this.glowCtx.globalCompositeOperation = "destination-in";
      this.glowCtx.drawImage(this.lightCanvas, 0, 0, this.width, this.height);
      this.glowCtx.globalCompositeOperation = "source-over";

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.95 * this.sceneOpacity;
      ctx.drawImage(this.glowCanvas, 0, 0, this.width, this.height);

      // Soft bloom from light map (skip heavy blur on low-end)
      if (this.tier !== "low") {
        ctx.filter = this.tier === "high" ? "blur(18px)" : "blur(10px)";
        ctx.globalAlpha = 0.35 * this.sceneOpacity;
        ctx.drawImage(this.glowCanvas, 0, 0, this.width, this.height);
        ctx.filter = "none";
      }
      ctx.restore();
    }

    this.drawPulses(ctx, treeX * 0.2, treeY * 0.2);
    drawParticles(ctx, this.particles, partX, partY);
    drawButterflies(ctx, this.butterflies, this.butterflyImg, fgX, fgY);

    this.snapshotCtx.clearRect(0, 0, this.width, this.height);
    this.snapshotCtx.drawImage(this.canvas, 0, 0, this.width, this.height);
    this.drawWater(this.snapshotCanvas, treeX * 0.2);

    this.drawCursor(ctx);
    ctx.restore();

    // Vignette
    const vig = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width * 0.25,
      this.width / 2,
      this.height / 2,
      this.width * 0.75,
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.width, this.height);

    this.raf = requestAnimationFrame(this.loop);
  };
}
