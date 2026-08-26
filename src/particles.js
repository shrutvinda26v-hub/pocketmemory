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
    this.world = "dragon";
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.tint = hexToRgb("#c45a12");
    this.dpr = 1;
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });
    this.seedAmbient("dragon");
    this.raf = requestAnimationFrame(this.tick);
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(window.innerWidth * this.dpr);
    this.canvas.height = Math.floor(window.innerHeight * this.dpr);
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
  }

  setWorld(id, hex) {
    this.world = id;
    this.tint = hexToRgb(hex);
    this.seedAmbient(id);
  }

  seedAmbient(id) {
    const count = this.reduced ? 16 : 70;
    this.ambient = Array.from({ length: count }, (_, i) => {
      const base = {
        x: Math.random(),
        y: Math.random(),
        r: rand(0.5, 2.2),
        s: rand(0.03, 0.16),
        a: rand(0.12, 0.42),
        p: rand(0, Math.PI * 2),
        kind: "dust",
      };
      if (id === "dragon") {
        base.kind = i % 5 === 0 ? "spark" : "ember";
        base.r = rand(0.8, 3.2);
      } else if (id === "forest") {
        base.kind = i % 3 === 0 ? "leaf" : "firefly";
        base.r = rand(1.1, 3.4);
      } else if (id === "castle") {
        base.kind = i % 4 === 0 ? "mote" : "sparkle";
        base.r = rand(0.7, 2.6);
      } else if (id === "underwater") {
        base.kind = "bubble";
        base.r = rand(1.4, 5.5);
      } else if (id === "galaxy") {
        base.kind = i % 8 === 0 ? "shoot" : "star";
        base.r = rand(0.5, 2.1);
      } else {
        base.kind = i % 4 === 0 ? "petal" : "pollen";
        base.r = rand(1.2, 3.8);
      }
      return base;
    });
  }

  burst(kind, origin, intensity = 1) {
    if (this.reduced) return;
    const colors = KIND_COLORS[kind] || KIND_COLORS.sparkles;
    const count = Math.round(rand(28, 52) * intensity);
    for (let i = 0; i < count; i += 1) {
      const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      const speed = rand(0.8, 4.2) * intensity;
      this.particles.push({
        kind,
        color: pick(colors),
        x: origin.x + rand(-22, 22),
        y: origin.y + rand(-28, 28),
        vx: Math.cos(angle) * speed + rand(-0.5, 0.8),
        vy: Math.sin(angle) * speed + rand(-2.2, -0.2),
        life: 1,
        decay: rand(0.005, 0.012),
        size: rand(2, 7.2),
        rot: rand(0, Math.PI * 2),
        spin: rand(-0.1, 0.1),
        wobble: rand(0.4, 1.8),
      });
    }
  }

  originFromBook(bookEl, side = "right") {
    const rect = bookEl.getBoundingClientRect();
    if (side === "left") {
      return { x: rect.left + rect.width * 0.22, y: rect.top + rect.height * 0.58 };
    }
    return { x: rect.left + rect.width * 0.78, y: rect.top + rect.height * 0.62 };
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
      let x = p.x * w + Math.sin(t * p.s * 2 + p.p) * 22;
      let y = p.y * h;
      if (p.kind === "ember" || p.kind === "spark" || p.kind === "bubble" || p.kind === "pollen") {
        y = ((p.y - t * p.s * 0.08) % 1 + 1) % 1 * h;
      } else if (p.kind === "leaf" || p.kind === "petal") {
        y = ((p.y + t * p.s * 0.07) % 1) * h;
        x += Math.sin(t * 0.8 + p.p) * 36;
      } else if (p.kind === "firefly") {
        x = p.x * w + Math.sin(t * 0.7 + p.p) * 28;
        y = p.y * h + Math.cos(t * 0.9 + p.p) * 18;
      } else if (p.kind === "shoot") {
        x = ((p.x + t * 0.12) % 1) * w;
        y = ((p.y + t * 0.06) % 1) * h;
      } else {
        y = ((p.y + t * p.s * 0.03) % 1) * h;
      }
      ctx.save();
      ctx.translate(x, y);
      if (p.kind === "leaf" || p.kind === "petal") ctx.rotate(t + p.p);
      this.drawAmbientKind(ctx, p, tint);
      ctx.restore();
    }
  }

  drawAmbientKind(ctx, p, tint) {
    if (p.kind === "ember" || p.kind === "spark") {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r * 3);
      g.addColorStop(0, "rgba(255, 236, 180, 0.95)");
      g.addColorStop(0.4, `rgba(${tint.r},${tint.g},${tint.b},${p.a})`);
      g.addColorStop(1, "rgba(255,80,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, p.r * 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (p.kind === "firefly") {
      const pulse = 0.45 + Math.sin(performance.now() * 0.006 + p.p) * 0.35;
      ctx.fillStyle = `rgba(210,255,140,${pulse})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (p.kind === "bubble") {
      ctx.strokeStyle = `rgba(180,230,255,${p.a})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(-p.r * 0.3, -p.r * 0.3, p.r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (p.kind === "leaf") {
      ctx.fillStyle = pick(KIND_COLORS.leaves);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 0.45, p.r * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (p.kind === "petal") {
      ctx.fillStyle = pick(KIND_COLORS.petals);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 0.4, p.r * 1.1, 0.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (p.kind === "star" || p.kind === "sparkle" || p.kind === "shoot") {
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
      if (p.kind === "shoot") {
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-18, 8);
        ctx.stroke();
      }
      return;
    }
    ctx.fillStyle = `rgba(${tint.r},${tint.g},${tint.b},${p.a})`;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
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
      p.vy += p.kind === "bubbles" ? -0.014 : 0.012;
      p.vx += Math.sin(p.life * 8 * p.wobble) * 0.025;
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
        break;
      }
      case "bubbles": {
        ctx.globalAlpha *= 0.55;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case "stars": {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "petals": {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.45, p.size * 1.1, 0.4, 0, Math.PI * 2);
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
