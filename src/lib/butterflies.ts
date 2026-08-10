import type { Butterfly, ButterflyState } from "./sceneTypes";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const REST_SPOTS: Array<[number, number]> = [
  [0.28, 0.38],
  [0.35, 0.52],
  [0.48, 0.62],
  [0.58, 0.45],
  [0.68, 0.35],
  [0.72, 0.55],
  [0.4, 0.78],
  [0.55, 0.82],
  [0.22, 0.7],
  [0.78, 0.42],
  [0.62, 0.7],
  [0.33, 0.28],
  [0.5, 0.22],
  [0.75, 0.68],
];

export function createButterflies(count: number, width: number, height: number): Butterfly[] {
  const list: Butterfly[] = [];
  for (let i = 0; i < count; i++) {
    const spot = REST_SPOTS[i % REST_SPOTS.length];
    const jitterX = rand(-0.04, 0.04);
    const jitterY = rand(-0.03, 0.03);
    const homeX = (spot[0] + jitterX) * width;
    const homeY = (spot[1] + jitterY) * height;
    list.push({
      id: i,
      homeX,
      homeY,
      x: homeX,
      y: homeY,
      vx: 0,
      vy: 0,
      scale: rand(0.95, 1.65),
      rotation: rand(-0.25, 0.25),
      wingPhase: rand(0, Math.PI * 2),
      wingSpeed: rand(6, 11),
      glow: rand(0.55, 0.85),
      state: Math.random() < 0.08 ? "flying" : "resting",
      stateTimer: rand(2, 10),
      followChance: Math.random(),
      pathOffset: rand(0, Math.PI * 2),
      activationRadius: rand(120, 200),
    });
  }
  return list;
}

function setState(b: Butterfly, state: ButterflyState, timer: number) {
  b.state = state;
  b.stateTimer = timer;
}

export function updateButterflies(
  butterflies: Butterfly[],
  dt: number,
  handX: number,
  handY: number,
  handActive: boolean,
  time: number,
) {
  for (const b of butterflies) {
    b.stateTimer -= dt;
    b.wingPhase += dt * (b.state === "resting" ? b.wingSpeed * 0.35 : b.wingSpeed * 1.25);

    const dx = b.x - handX;
    const dy = b.y - handY;
    const dist = Math.hypot(dx, dy);

    if (handActive && dist < b.activationRadius && (b.state === "resting" || b.state === "settling")) {
      setState(b, "waking", rand(0.35, 0.9));
      b.glow = Math.min(1, b.glow + 0.45);
    }

    if (b.state === "waking") {
      b.glow += (1 - b.glow) * 0.12;
      b.vy -= 16 * dt;
      b.rotation += Math.sin(time + b.pathOffset) * 0.015;
      if (b.stateTimer <= 0) {
        setState(b, "flying", rand(3.5, 8));
        const angle = rand(-Math.PI * 0.9, -Math.PI * 0.1);
        const speed = rand(55, 110);
        b.vx = Math.cos(angle) * speed * 0.025;
        b.vy = Math.sin(angle) * speed * 0.025;
      }
    } else if (b.state === "flying") {
      b.glow += (1 - b.glow) * 0.08;
      b.vx += Math.sin(time * 1.4 + b.pathOffset) * 0.05;
      b.vy += Math.cos(time * 1.1 + b.pathOffset) * 0.04 - 0.015;

      if (handActive && b.followChance > 0.45 && dist < 320) {
        b.vx += (handX - b.x) * 0.002;
        b.vy += (handY - 50 - b.y) * 0.002;
      } else if (handActive) {
        b.vx += (handX + Math.cos(b.pathOffset) * 70 - b.x) * 0.001;
        b.vy += (handY + Math.sin(b.pathOffset) * 50 - b.y) * 0.001;
      }

      b.vx *= 0.985;
      b.vy *= 0.985;
      b.rotation = Math.atan2(b.vy, b.vx) * 0.25 + Math.sin(time * 2 + b.id) * 0.18;

      if (b.stateTimer <= 0) {
        if (Math.random() < 0.45) {
          setState(b, "settling", rand(1.5, 3));
        } else {
          setState(b, "flying", rand(2, 5));
        }
      }
    } else if (b.state === "settling") {
      b.vx += (b.homeX - b.x) * 0.01;
      b.vy += (b.homeY - b.y) * 0.01;
      b.vx *= 0.9;
      b.vy *= 0.9;
      b.glow += (0.7 - b.glow) * 0.05;
      b.rotation += (0 - b.rotation) * 0.05;
      if (b.stateTimer <= 0 || Math.hypot(b.homeX - b.x, b.homeY - b.y) < 8) {
        b.x = b.homeX;
        b.y = b.homeY;
        b.vx = 0;
        b.vy = 0;
        setState(b, "resting", rand(2, 10));
      }
    } else {
      b.x = b.homeX + Math.sin(time * 0.8 + b.pathOffset) * 3;
      b.y = b.homeY + Math.cos(time * 0.6 + b.pathOffset) * 2;
      b.glow += (0.65 - b.glow) * 0.04;
      b.rotation = Math.sin(time * 0.5 + b.id) * 0.1;
      if (b.stateTimer <= 0 && Math.random() < 0.12) {
        setState(b, "flying", rand(2, 4));
      } else if (b.stateTimer <= 0) {
        b.stateTimer = rand(2, 8);
      }
    }

    b.x += b.vx;
    b.y += b.vy;
  }
}

export function drawButterflies(
  ctx: CanvasRenderingContext2D,
  butterflies: Butterfly[],
  sprite: HTMLImageElement | null,
  parallaxX: number,
  parallaxY: number,
) {
  if (!sprite) return;
  ctx.save();
  for (const b of butterflies) {
    const x = b.x + parallaxX;
    const y = b.y + parallaxY;
    const flap = 0.72 + Math.sin(b.wingPhase) * 0.28;
    const w = 96 * b.scale * flap;
    const h = 96 * b.scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(b.rotation);

    // Loud fluorescent aura
    ctx.globalCompositeOperation = "lighter";
    const glowR = 56 * b.scale * (0.85 + b.glow);
    const outer = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR * 1.6);
    outer.addColorStop(0, `rgba(180, 255, 255, ${0.55 * b.glow})`);
    outer.addColorStop(0.35, `rgba(0, 255, 220, ${0.4 * b.glow})`);
    outer.addColorStop(0.7, `rgba(0, 200, 255, ${0.18 * b.glow})`);
    outer.addColorStop(1, "rgba(0, 120, 255, 0)");
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.arc(0, 0, glowR * 1.6, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR * 0.55);
    core.addColorStop(0, `rgba(240, 255, 255, ${0.85 * b.glow})`);
    core.addColorStop(0.5, `rgba(0, 255, 230, ${0.45 * b.glow})`);
    core.addColorStop(1, "rgba(0, 255, 200, 0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, glowR * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.85 + b.glow * 0.15;
    ctx.scale(flap, 1);
    ctx.drawImage(sprite, -w / 2, -h / 2, w, h);

    // Extra neon wing wash
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.35 + b.glow * 0.35;
    ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.restore();
}
