const KIND_COLORS = {
  embers: ["#ffb347", "#ff6b1a", "#ffd27a", "#ff3b00"],
  leaves: ["#7bc96f", "#d4c15a", "#2f8f6b", "#e7d28a"],
  sparkles: ["#ffe9a8", "#fff6d6", "#e0c56a", "#fff"],
  bubbles: ["#b7ecff", "#7ad4f0", "#e9fbff", "#5eb8d6"],
  stars: ["#f4e9ff", "#c9a6ff", "#fff", "#8ec5ff"],
  petals: ["#ffb3c9", "#ffd6e0", "#f4c18a", "#fff1d6"],
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(list) {
  return list[(Math.random() * list.length) | 0];
}

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  const v = parseInt(n.length === 3 ? n.split("").map((c) => c + c).join("") : n, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

export class ParticleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.particles = [];
    this.ambient = [];
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.tint = hexToRgb("#c45a12");
    this.dpr = 1;
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });
    this.seedAmbient();
    this.raf = requestAnimationFrame(this.tick);
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(window.innerWidth * this.dpr);
    this.canvas.height = Math.floor(window.innerHeight * this.dpr);
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
  }

  setTint(hex) {
    this.tint = hexToRgb(hex);
  }

  seedAmbient() {
    const count = this.reduced ? 12 : 42;
    this.ambient = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: rand(0.4, 1.6),
      s: rand(0.04, 0.14),
      a: rand(0.08, 0.28),
      p: rand(0, Math.PI * 2),
    }));
  }

  burst(kind, origin, intensity = 1) {
    if (this.reduced) return;
    const colors = KIND_COLORS[kind] || KIND_COLORS.sparkles;
    const count = Math.round(rand(22, 38) * intensity);
    for (let i = 0; i < count; i += 1) {
      const angle = rand(-Math.PI * 0.85, -Math.PI * 0.15);
      const speed = rand(0.6, 3.4) * intensity;
      this.particles.push({
        kind,
        color: pick(colors),
        x: origin.x + rand(-18, 18),
        y: origin.y + rand(-24, 24),
        vx: Math.cos(angle) * speed + rand(-0.4, 0.6),
        vy: Math.sin(angle) * speed + rand(-1.8, -0.2),
        life: 1,
        decay: rand(0.006, 0.014),
        size: rand(1.6, 5.4),
        rot: rand(0, Math.PI * 2),
        spin: rand(-0.08, 0.08),
        wobble: rand(0.4, 1.6),
      });
    }
  }

  originFromBook(bookEl, side = "right") {
    const rect = bookEl.getBoundingClientRect();
    if (side === "left") {
      return { x: rect.left + rect.width * 0.22, y: rect.top + rect.height * 0.62 };
    }
    return { x: rect.left + rect.width * 0.78, y: rect.top + rect.height * 0.7 };
  }

  tick() {
    const { ctx, canvas, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawAmbient();
    this.drawParticles();
    this.raf = requestAnimationFrame(this.tick);
  }

  drawAmbient() {
    const { ctx, tint } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = performance.now() * 0.001;
    for (const p of this.ambient) {
      const x = p.x * w + Math.sin(t * p.s + p.p) * 18;
      const y = ((p.y + t * p.s * 0.04) % 1) * h;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${tint.r},${tint.g},${tint.b},${p.a})`;
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawParticles() {
    const { ctx } = this;
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.kind === "bubbles" ? -0.012 : 0.012;
      p.vx += Math.sin(p.life * 8 * p.wobble) * 0.02;
      p.rot += p.spin;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      this.drawKind(ctx, p);
      ctx.restore();
    }
  }

  drawKind(ctx, p) {
    ctx.fillStyle = p.color;
    ctx.strokeStyle = p.color;
    switch (p.kind) {
      case "embers": {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2.2);
        g.addColorStop(0, "#fff6d2");
        g.addColorStop(0.35, p.color);
        g.addColorStop(1, "rgba(255,80,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "leaves": {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.55, p.size * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "sparkles": {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.22, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.22, 0);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha *= 0.7;
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.lineTo(0, p.size * 0.22);
        ctx.lineTo(p.size, 0);
        ctx.lineTo(0, -p.size * 0.22);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "bubbles": {
        ctx.globalAlpha *= 0.55;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.strokeWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-p.size * 0.28, -p.size * 0.28, p.size * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "stars": {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.6);
        ctx.lineTo(0, p.size * 1.6);
        ctx.moveTo(-p.size * 1.1, 0);
        ctx.lineTo(p.size * 1.1, 0);
        ctx.stroke();
        break;
      }
      case "petals": {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.45, p.size * 1.1, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha *= 0.65;
        ctx.beginPath();
        ctx.ellipse(p.size * 0.15, 0, p.size * 0.32, p.size * 0.9, -0.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      default: {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
