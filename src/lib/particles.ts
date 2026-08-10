import type { Particle } from "./sceneTypes";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Tree-biased spawn regions in normalized 0–1 space */
function spawnRegion(): { nx: number; ny: number; kind: Particle["kind"] } {
  const roll = Math.random();
  if (roll < 0.35) {
    // canopy / branches
    return { nx: rand(0.22, 0.88), ny: rand(0.05, 0.42), kind: "ambient" };
  }
  if (roll < 0.58) {
    // trunk
    return { nx: rand(0.42, 0.72), ny: rand(0.28, 0.72), kind: "ember" };
  }
  if (roll < 0.78) {
    // roots / ground
    return { nx: rand(0.18, 0.85), ny: rand(0.68, 0.92), kind: "ambient" };
  }
  if (roll < 0.9) {
    // air mist
    return { nx: rand(0.05, 0.95), ny: rand(0.1, 0.75), kind: "ambient" };
  }
  // water shimmer
  return { nx: rand(0.05, 0.55), ny: rand(0.78, 0.98), kind: "ember" };
}

export function createParticles(count: number, width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const { nx, ny, kind } = spawnRegion();
    const x = nx * width;
    const y = ny * height;
    const baseAlpha = kind === "ember" ? rand(0.15, 0.45) : rand(0.08, 0.32);
    particles.push({
      x,
      y,
      baseX: x,
      baseY: y,
      vx: rand(-0.08, 0.08),
      vy: rand(-0.12, 0.05),
      size: kind === "ember" ? rand(1.2, 2.8) : rand(0.7, 2.2),
      alpha: baseAlpha,
      baseAlpha,
      life: rand(0, 1),
      maxLife: rand(4, 12),
      kind,
      flicker: rand(0, Math.PI * 2),
    });
  }
  return particles;
}

export function spawnBurst(
  particles: Particle[],
  x: number,
  y: number,
  amount: number,
  width: number,
  height: number,
) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(0.4, 2.2);
    particles.push({
      x,
      y,
      baseX: x,
      baseY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.7 - rand(0.2, 1.2),
      size: rand(1, 3.2),
      alpha: rand(0.5, 1),
      baseAlpha: 0.8,
      life: 0,
      maxLife: rand(0.8, 2.2),
      kind: "burst",
      flicker: Math.random() * Math.PI * 2,
    });
  }
  // Cap total particles
  const max = Math.floor(width * height * 0.00018) + 80;
  if (particles.length > max) {
    particles.splice(0, particles.length - max);
  }
}

export function updateParticles(
  particles: Particle[],
  dt: number,
  handX: number,
  handY: number,
  handActive: boolean,
  width: number,
  height: number,
) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += dt;
    p.flicker += dt * 6;
    p.x += p.vx;
    p.y += p.vy;

    if (p.kind === "burst") {
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha = p.baseAlpha * (1 - p.life / p.maxLife);
      if (p.life >= p.maxLife || p.alpha <= 0.02) {
        particles.splice(i, 1);
        continue;
      }
    } else {
      // gentle drift around home
      p.vx += (p.baseX - p.x) * 0.0008;
      p.vy += (p.baseY - p.y) * 0.0008;
      p.vx += Math.sin(p.flicker * 0.3) * 0.01;
      p.vy += Math.cos(p.flicker * 0.25) * 0.008;
      p.vx *= 0.99;
      p.vy *= 0.99;

      const dx = p.x - handX;
      const dy = p.y - handY;
      const dist = Math.hypot(dx, dy);
      if (handActive && dist < 220) {
        const influence = 1 - dist / 220;
        p.alpha = Math.min(1, p.baseAlpha + influence * 0.85);
        p.size = Math.min(4, p.size + influence * 0.02);
        // push slightly outward
        if (dist > 1) {
          p.vx += (dx / dist) * influence * 0.35;
          p.vy += (dy / dist) * influence * 0.35;
        }
      } else {
        p.alpha += (p.baseAlpha - p.alpha) * 0.04;
      }

      // respawn if drifted too far
      if (p.life > p.maxLife) {
        const { nx, ny, kind } = spawnRegion();
        p.baseX = nx * width;
        p.baseY = ny * height;
        p.x = p.baseX;
        p.y = p.baseY;
        p.kind = kind;
        p.life = 0;
        p.maxLife = rand(4, 12);
        p.baseAlpha = kind === "ember" ? rand(0.15, 0.45) : rand(0.08, 0.32);
        p.alpha = p.baseAlpha;
      }
    }
  }
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  parallaxX: number,
  parallaxY: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const p of particles) {
    const flicker = 0.75 + Math.sin(p.flicker) * 0.25;
    const a = Math.max(0, Math.min(1, p.alpha * flicker));
    if (a < 0.02) continue;
    const x = p.x + parallaxX;
    const y = p.y + parallaxY;
    const r = p.size;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
    g.addColorStop(0, `rgba(220, 255, 255, ${a})`);
    g.addColorStop(0.35, `rgba(0, 229, 255, ${a * 0.7})`);
    g.addColorStop(1, "rgba(0, 80, 180, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
