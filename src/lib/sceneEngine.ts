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
  /** Fast-moving hand glow + soft trail */
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;
  /** Long-lived awakening memory — areas stay subtly lit */
  private memoryCanvas: HTMLCanvasElement;
  private memoryCtx: CanvasRenderingContext2D;
  private combinedLightCanvas: HTMLCanvasElement;
  private combinedLightCtx: CanvasRenderingContext2D;
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
  private firstAwaken = false;
  private burstCooldown = 0;
  private pulseCooldown = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private destroyed = false;
  private awakenAmount = 0;
  private interactive = false;

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
  private lastHandX = 0;
  private lastHandY = 0;

  onFirstAwaken?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D context unavailable");
    this.ctx = ctx;

    this.lightCanvas = document.createElement("canvas");
    this.memoryCanvas = document.createElement("canvas");
    this.combinedLightCanvas = document.createElement("canvas");
    this.glowCanvas = document.createElement("canvas");
    this.waterCanvas = document.createElement("canvas");
    this.snapshotCanvas = document.createElement("canvas");
    this.lightCtx = this.lightCanvas.getContext("2d")!;
    this.memoryCtx = this.memoryCanvas.getContext("2d")!;
    this.combinedLightCtx = this.combinedLightCanvas.getContext("2d")!;
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
    gsap.to(this, { sceneOpacity: 1, duration: 3.2, ease: "power2.out" });
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
      this.memoryCanvas,
      this.combinedLightCanvas,
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
    this.memoryCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.combinedLightCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.glowCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.waterCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.snapshotCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  setInteraction(point: InteractionPoint) {
    this.interaction = point;
  }

  setParallaxTarget(nx: number, ny: number) {
    this.targetParallax = { x: nx, y: ny };
  }

  setInteractive(enabled: boolean) {
    this.interactive = enabled;
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

  private stampRadial(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    strength: number,
    scale = 1,
  ) {
    const minDim = Math.min(this.width, this.height);
    // Tight spotlight — only the pointed area lights; rest stays dark
    const ambient = minDim * 0.16 * scale;
    const core = minDim * 0.03 * scale;
    const strong = minDim * 0.065 * scale;
    const soft = minDim * 0.11 * scale;

    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, ambient);
    const s = Math.min(1.35, strength * 1.15);
    g.addColorStop(0, `rgba(255,255,255,${0.95 * s})`);
    g.addColorStop(core / ambient, `rgba(255,255,255,${0.7 * s})`);
    g.addColorStop(strong / ambient, `rgba(255,255,255,${0.32 * s})`);
    g.addColorStop(soft / ambient, `rgba(255,255,255,${0.1 * s})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, ambient, 0, Math.PI * 2);
    ctx.fill();
  }

  private stampLight(x: number, y: number, strength: number) {
    this.stampRadial(this.lightCtx, x, y, strength, 1);
  }

  private stampMemory(x: number, y: number, strength: number) {
    // Very subtle short trail only — no lingering awaken across the tree
    this.stampRadial(this.memoryCtx, x, y, strength * 0.12, 0.7);
  }

  private fadeCanvas(ctx: CanvasRenderingContext2D, keep: number) {
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = `rgba(0,0,0,${keep})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = "source-over";
  }

  private rebuildCombinedLight() {
    this.combinedLightCtx.clearRect(0, 0, this.width, this.height);
    this.combinedLightCtx.globalCompositeOperation = "lighter";
    // No global ambient — darkness everywhere except the hand spotlight
    this.combinedLightCtx.drawImage(this.memoryCanvas, 0, 0, this.width, this.height);
    this.combinedLightCtx.drawImage(this.lightCanvas, 0, 0, this.width, this.height);
    this.combinedLightCtx.globalCompositeOperation = "source-over";
  }

  private spawnPulse(x: number, y: number, count = 1) {
    const trunkX = this.width * 0.58;
    const trunkY = this.height * 0.55;
    const baseAngle = Math.atan2(y - trunkY, x - trunkX);

    for (let i = 0; i < count; i++) {
      // Energy prefers flowing outward along branch structure, with some rootward pulls
      const towardCanopy = baseAngle + (Math.random() - 0.5) * 0.9;
      const towardRoot = Math.atan2(this.height * 0.85 - y, trunkX - x) + (Math.random() - 0.5) * 0.5;
      const angle = Math.random() < 0.7 ? towardCanopy : towardRoot;
      this.pulses.push({
        x,
        y,
        angle,
        dist: 0,
        maxDist: 40 + Math.random() * 70,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.45,
        width: 10 + Math.random() * 14,
      });
    }
    if (this.pulses.length > 36) this.pulses.splice(0, this.pulses.length - 36);
  }

  private updatePulses(dt: number) {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.life += dt;
      p.dist += dt * (120 + (1 - p.life / p.maxLife) * 80);
      // Slight curve like traveling through bark
      p.angle += Math.sin(this.time * 3 + p.life * 4) * 0.01;

      const px = p.x + Math.cos(p.angle) * p.dist;
      const py = p.y + Math.sin(p.angle) * p.dist;
      const fade = 1 - p.life / p.maxLife;
      // Keep energy pulses local to the hand zone
      if (p.dist < p.maxDist * 0.45) {
        this.stampLight(px, py, fade * 0.22);
      }

      if (p.life >= p.maxLife) this.pulses.splice(i, 1);
    }
  }

  private drawPulses(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.pulses) {
      const t = p.life / p.maxLife;
      const alpha = (1 - t) * 0.65;
      const x = p.x + Math.cos(p.angle) * p.dist + ox;
      const y = p.y + Math.sin(p.angle) * p.dist + oy;
      // streak along travel direction
      const tx = Math.cos(p.angle);
      const ty = Math.sin(p.angle);
      const g = ctx.createRadialGradient(x, y, 0, x, y, p.width);
      g.addColorStop(0, `rgba(220,255,255,${alpha})`);
      g.addColorStop(0.35, `rgba(0,229,255,${alpha * 0.75})`);
      g.addColorStop(1, "rgba(0,80,180,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, p.width * 1.4, p.width * 0.55, Math.atan2(ty, tx), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawWater(sceneSnapshot: HTMLCanvasElement, ox: number) {
    const waterTop = this.height * 0.78;
    const waterH = this.height - waterTop;
    if (waterH <= 0) return;

    this.waterCtx.clearRect(0, 0, this.width, this.height);
    const sampleH = Math.min(waterH * 1.15, this.height * 0.35);
    this.waterCtx.save();
    this.waterCtx.translate(0, waterTop + sampleH);
    this.waterCtx.scale(1, -1);

    const slices = this.tier === "low" ? 16 : 32;
    const sliceH = sampleH / slices;
    const rippleAmp = 2.5 + this.awakenAmount * 2.5;
    for (let i = 0; i < slices; i++) {
      const sy = waterTop - sampleH + i * sliceH;
      const wave =
        Math.sin(this.time * 2.2 + i * 0.55) * rippleAmp +
        Math.sin(this.time * 1.1 + i * 0.2) * (rippleAmp * 0.4);
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

    this.waterCtx.globalCompositeOperation = "destination-in";
    const alphaMask = this.waterCtx.createLinearGradient(0, waterTop, 0, this.height);
    alphaMask.addColorStop(0, "rgba(0,0,0,0)");
    alphaMask.addColorStop(0.15, "rgba(0,0,0,0.55)");
    alphaMask.addColorStop(1, "rgba(0,0,0,0.85)");
    this.waterCtx.fillStyle = alphaMask;
    this.waterCtx.fillRect(0, waterTop, this.width, waterH);

    this.waterCtx.globalCompositeOperation = "source-atop";
    const grad = this.waterCtx.createLinearGradient(0, waterTop, 0, this.height);
    grad.addColorStop(0, "rgba(0,8,20,0.12)");
    grad.addColorStop(0.35, "rgba(0,20,40,0.4)");
    grad.addColorStop(1, "rgba(0,5,15,0.85)");
    this.waterCtx.fillStyle = grad;
    this.waterCtx.fillRect(0, waterTop, this.width, waterH);
    this.waterCtx.globalCompositeOperation = "source-over";

    this.waterCtx.globalCompositeOperation = "lighter";
    const shimmerCount = 4 + Math.floor(this.awakenAmount * 6);
    for (let i = 0; i < shimmerCount; i++) {
      const sx =
        ((this.time * 30 + i * 97) % (this.width + 100)) - 50 + Math.sin(this.time + i) * 20;
      const sy = waterTop + 10 + ((i * 37) % waterH);
      const shimmer = this.waterCtx.createRadialGradient(sx, sy, 0, sx, sy, 40);
      const a = 0.06 + this.awakenAmount * 0.12;
      shimmer.addColorStop(0, `rgba(80,200,255,${a})`);
      shimmer.addColorStop(1, "rgba(80,200,255,0)");
      this.waterCtx.fillStyle = shimmer;
      this.waterCtx.beginPath();
      this.waterCtx.ellipse(sx, sy, 50, 8, 0, 0, Math.PI * 2);
      this.waterCtx.fill();
    }

    this.ctx.drawImage(this.waterCanvas, 0, 0, this.width, this.height);
  }

  private drawCursor(ctx: CanvasRenderingContext2D) {
    if (!this.interactive) return;
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
    this.pulseCooldown = Math.max(0, this.pulseCooldown - dt);

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

    const handActive =
      this.interactive &&
      (this.interaction.active || this.interaction.strength > 0.2);
    const hx = this.interaction.x;
    const hy = this.interaction.y;
    const strength = this.interactive
      ? Math.max(this.interaction.strength, this.interaction.active ? 1 : 0)
      : 0;

    // Spotlight follows the hand tightly; other regions fall back to dark quickly
    this.fadeCanvas(this.lightCtx, Math.max(0.72, 1 - dt * 1.8));
    this.fadeCanvas(this.memoryCtx, Math.max(0.82, 1 - dt * 0.9));

    if (handActive && strength > 0.05) {
      this.stampLight(hx, hy, strength);
      this.stampMemory(hx, hy, strength * 0.5);

      // Palm is a tight secondary core only (not a wide wash)
      if (
        this.interaction.source === "hand" &&
        this.interaction.palmX != null &&
        this.interaction.palmY != null
      ) {
        this.stampLight(this.interaction.palmX, this.interaction.palmY, strength * 0.35);
      }

      this.trail.push({ x: hx, y: hy, life: 1 });
      if (this.trail.length > 10) this.trail.shift();

      const moved =
        this.interaction.vx != null && this.interaction.vy != null
          ? Math.hypot(this.interaction.vx, this.interaction.vy)
          : Math.hypot(hx - this.lastHandX, hy - this.lastHandY);
      this.lastHandX = hx;
      this.lastHandY = hy;
      this.awakenAmount = Math.min(1, this.awakenAmount + dt * 0.25);

      if (!this.firstAwaken) {
        this.firstAwaken = true;
        this.onFirstAwaken?.();
        spawnBurst(this.particles, hx, hy, 22, this.width, this.height);
        this.spawnPulse(hx, hy, 4);
        gsap.fromTo(
          this,
          { awakenAmount: 0.15 },
          { awakenAmount: 0.55, duration: 1.2, ease: "power2.out" },
        );
      }

      if (this.pulseCooldown <= 0 && moved > 8) {
        this.spawnPulse(hx, hy, 1);
        this.pulseCooldown = 0.22;
      }

      if (
        this.burstCooldown <= 0 &&
        moved > 4 &&
        (this.interaction.source === "hand" ||
          this.interaction.source === "touch" ||
          this.interaction.source === "mouse")
      ) {
        if (Math.random() < 0.4) {
          spawnBurst(this.particles, hx, hy, 5, this.width, this.height);
          this.burstCooldown = 0.16;
        }
      }
    } else {
      this.awakenAmount = Math.max(0, this.awakenAmount - dt * 0.05);
    }

    for (const t of this.trail) {
      t.life -= dt * 2.8;
      if (t.life > 0) this.stampLight(t.x, t.y, t.life * 0.12 * strength);
    }
    this.trail = this.trail.filter((t) => t.life > 0);

    this.updatePulses(dt);
    this.rebuildCombinedLight();

    updateParticles(
      this.particles,
      dt,
      hx,
      hy,
      handActive,
      this.width,
      this.height,
      this.awakenAmount,
    );
    updateButterflies(this.butterflies, dt, hx, hy, handActive, this.time);

    const ctx = this.ctx;
    ctx.globalAlpha = 1;
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, "#000814");
    sky.addColorStop(0.55, "#001d3d");
    sky.addColorStop(0.78, "#002b5b");
    sky.addColorStop(1, "#0a1628");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

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
      // Keep the tree mostly dark; only the hand spotlight reveals fluorescence
      this.glowCtx.clearRect(0, 0, this.width, this.height);
      this.coverDraw(this.glowCtx, this.baseImg, treeX, treeY);
      this.glowCtx.globalCompositeOperation = "source-atop";
      this.glowCtx.fillStyle = "rgba(0, 4, 14, 0.55)";
      this.glowCtx.fillRect(0, 0, this.width, this.height);
      this.glowCtx.globalCompositeOperation = "source-over";
      ctx.drawImage(this.glowCanvas, 0, 0, this.width, this.height);
    }

    if (this.glowImg) {
      this.glowCtx.clearRect(0, 0, this.width, this.height);
      this.coverDraw(this.glowCtx, this.glowImg, treeX, treeY);
      // Punch fluorescent cyan into the glow layer before masking
      this.glowCtx.globalCompositeOperation = "screen";
      this.glowCtx.fillStyle = "rgba(0, 255, 220, 0.28)";
      this.glowCtx.fillRect(0, 0, this.width, this.height);
      this.glowCtx.globalCompositeOperation = "lighter";
      this.glowCtx.fillStyle = "rgba(80, 255, 255, 0.18)";
      this.glowCtx.fillRect(0, 0, this.width, this.height);
      this.glowCtx.globalCompositeOperation = "destination-in";
      this.glowCtx.drawImage(this.combinedLightCanvas, 0, 0, this.width, this.height);
      this.glowCtx.globalCompositeOperation = "source-over";

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1 * this.sceneOpacity;
      ctx.drawImage(this.glowCanvas, 0, 0, this.width, this.height);

      // Extra fluorescent bloom only inside the spotlight
      if (this.tier !== "low") {
        ctx.filter = this.tier === "high" ? "blur(22px)" : "blur(14px)";
        ctx.globalAlpha = 0.55 * this.sceneOpacity;
        ctx.drawImage(this.glowCanvas, 0, 0, this.width, this.height);
        ctx.filter = this.tier === "high" ? "blur(40px)" : "blur(24px)";
        ctx.globalAlpha = 0.28 * this.sceneOpacity;
        ctx.drawImage(this.glowCanvas, 0, 0, this.width, this.height);
        ctx.filter = "none";
      }

      // Neon core around the hand
      if (handActive && strength > 0.05) {
        const neon = ctx.createRadialGradient(hx, hy, 0, hx, hy, Math.min(this.width, this.height) * 0.12);
        neon.addColorStop(0, `rgba(180, 255, 255, ${0.45 * strength})`);
        neon.addColorStop(0.35, `rgba(0, 255, 220, ${0.28 * strength})`);
        neon.addColorStop(1, "rgba(0, 180, 255, 0)");
        ctx.fillStyle = neon;
        ctx.beginPath();
        ctx.arc(hx, hy, Math.min(this.width, this.height) * 0.12, 0, Math.PI * 2);
        ctx.fill();
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

    const vig = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width * 0.25,
      this.width / 2,
      this.height / 2,
      this.width * 0.75,
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.58)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.width, this.height);

    this.raf = requestAnimationFrame(this.loop);
  };
}
