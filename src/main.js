const IMAGE = { w: 1280, h: 720 };

/**
 * Native-pixel eye sockets on sheep.webp.
 * Tight ellipses sit inside the palpebral fissure so only the globe
 * translates — wool, lashes, jewelry, and the head stay still.
 */
const EYES = [
  { cx: 578, cy: 218, rx: 20.4, ry: 13.6 },
  { cx: 712, cy: 217, rx: 21.2, ry: 13.6 },
];

const MAX_LOOK = { x: 8.4, y: 5.2 };
const RANGE = { x: 0.34, y: 0.3 };

const portrait = document.getElementById("portrait");
const still = document.getElementById("still");
const canvas = document.getElementById("eyes");
const ctx = canvas.getContext("2d", { alpha: true });

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(hover: none)").matches;
const debug = new URLSearchParams(location.search).has("debug");

const pointer = { x: innerWidth / 2, y: innerHeight / 2, inside: false };
const cursorPos = { x: -80, y: -80, tx: -80, ty: -80 };

const eyes = EYES.map((eye) => ({
  ...eye,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  tx: 0,
  ty: 0,
}));

const blink = {
  amount: 0,
  phase: "open",
  t: 0,
  hold: 0,
  double: false,
  queued: false,
};

let cssW = 0;
let cssH = 0;
let dpr = 1;
let last = performance.now();
let nextBlink = 1100;
const maskCache = new Map();

const cursorEl = document.createElement("div");
cursorEl.className = "cursor";
if (!coarse && !reduceMotion) document.body.appendChild(cursorEl);

function eyeMask(rx, ry) {
  const key = `${rx.toFixed(2)}x${ry.toFixed(2)}`;
  if (maskCache.has(key)) return maskCache.get(key);

  const blur = 1.15;
  const pad = blur * 4;
  const mw = Math.ceil(rx * 2 + pad * 2);
  const mh = Math.ceil(ry * 2 + pad * 2);
  const c = document.createElement("canvas");
  c.width = mw;
  c.height = mh;
  const g = c.getContext("2d");
  g.filter = `blur(${blur}px)`;
  g.fillStyle = "#fff";
  g.beginPath();
  g.ellipse(mw / 2, mh / 2, Math.max(1, rx - 0.7), Math.max(1, ry - 0.7), 0, 0, Math.PI * 2);
  g.fill();
  maskCache.set(key, c);
  return c;
}

const layer = document.createElement("canvas");
const lctx = layer.getContext("2d");

function sizeCanvas() {
  const rect = portrait.getBoundingClientRect();
  cssW = rect.width;
  cssH = rect.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(cssW * dpr));
  canvas.height = Math.max(1, Math.round(cssH * dpr));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  maskCache.clear();
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function spring(pos, vel, target, dt, omega, zeta) {
  const acc = -2 * zeta * omega * vel - omega * omega * (pos - target);
  vel += acc * dt;
  pos += vel * dt;
  return [pos, vel];
}

function lookAt(clientX, clientY) {
  if (reduceMotion) return;
  const rect = portrait.getBoundingClientRect();
  const sx = rect.width / IMAGE.w;
  const sy = rect.height / IMAGE.h;
  const rangeX = Math.max(160, innerWidth * RANGE.x);
  const rangeY = Math.max(120, innerHeight * RANGE.y);

  for (const eye of eyes) {
    const ex = rect.left + eye.cx * sx;
    const ey = rect.top + eye.cy * sy;
    const nx = clamp((clientX - ex) / rangeX, -1, 1);
    const ny = clamp((clientY - ey) / rangeY, -1, 1);
    // Ease-out near the extremes so the globe never hits the lid.
    const ux = Math.sign(nx) * (1 - (1 - Math.abs(nx)) ** 1.35);
    const uy = Math.sign(ny) * (1 - (1 - Math.abs(ny)) ** 1.45);
    eye.tx = ux * MAX_LOOK.x;
    eye.ty = uy * MAX_LOOK.y;
  }
}

function restEyes() {
  for (const eye of eyes) {
    eye.tx = 0;
    eye.ty = 0;
  }
}

function triggerBlink(double = false) {
  if (blink.phase !== "open") {
    blink.queued = true;
    blink.double = blink.double || double;
    return;
  }
  blink.phase = "closing";
  blink.t = 0;
  blink.double = double;
}

function scheduleBlink() {
  nextBlink = 2400 + Math.random() * 3400;
}

function stepBlink(dt) {
  if (reduceMotion) {
    blink.amount = 0;
    return;
  }

  nextBlink -= dt * 1000;
  if (nextBlink <= 0 && blink.phase === "open") {
    triggerBlink(Math.random() < 0.26);
    scheduleBlink();
  }

  if (blink.phase === "closing") {
    blink.t += dt;
    const u = clamp(blink.t / 0.068, 0, 1);
    blink.amount = 1 - (1 - u) ** 2;
    if (u >= 1) {
      blink.phase = "shut";
      blink.hold = 0.04 + Math.random() * 0.03;
      blink.t = 0;
    }
  } else if (blink.phase === "shut") {
    blink.amount = 1;
    blink.t += dt;
    if (blink.t >= blink.hold) {
      blink.phase = "opening";
      blink.t = 0;
    }
  } else if (blink.phase === "opening") {
    blink.t += dt;
    const u = clamp(blink.t / 0.13, 0, 1);
    blink.amount = (1 - u) ** 2;
    if (u >= 1) {
      blink.amount = 0;
      if (blink.double) {
        blink.double = false;
        blink.phase = "closing";
        blink.t = 0;
      } else {
        blink.phase = "open";
        if (blink.queued) {
          blink.queued = false;
          triggerBlink(false);
        }
      }
    }
  }
}

function draw() {
  if (!cssW || !still.naturalWidth) return;
  ctx.clearRect(0, 0, cssW, cssH);

  const sx = cssW / IMAGE.w;
  const sy = cssH / IMAGE.h;

  eyes.forEach((eye, index) => {
    const cx = eye.cx * sx;
    const cy = eye.cy * sy;
    const rx = eye.rx * sx;
    const ry = eye.ry * sy;
    const ox = eye.x * sx;
    const oy = eye.y * sy;

    const lid = clamp(blink.amount + (index ? -0.06 : 0), 0, 1);
    const open = 1 - lid;
    const ryOpen = ry * (0.08 + 0.92 * open);
    const cyOpen = cy + (ry - ryOpen) * 0.7;
    const lidPull = lid * ry * 1.55;

    const mask = eyeMask(rx, ryOpen);
    const lw = mask.width;
    const lh = mask.height;
    const lx = cx - lw / 2;
    const ly = cyOpen - lh / 2;

    if (layer.width !== lw || layer.height !== lh) {
      layer.width = lw;
      layer.height = lh;
    }

    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.globalCompositeOperation = "source-over";
    lctx.clearRect(0, 0, lw, lh);
    lctx.drawImage(still, ox - lx, oy - ly + lidPull, cssW, cssH);

    lctx.globalCompositeOperation = "destination-in";
    lctx.drawImage(mask, 0, 0);
    ctx.drawImage(layer, lx, ly);

    if (debug) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 80, 80, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  });
}

function tick(now) {
  const dt = clamp((now - last) / 1000, 0.001, 0.033);
  last = now;

  if (!reduceMotion) {
    for (const eye of eyes) {
      const err = Math.hypot(eye.tx - eye.x, eye.ty - eye.y);
      const saccade = err > 1.8;
      const omega = saccade ? 28 : 17.5;
      const zeta = saccade ? 0.76 : 0.86;
      [eye.x, eye.vx] = spring(eye.x, eye.vx, eye.tx, dt, omega, zeta);
      [eye.y, eye.vy] = spring(eye.y, eye.vy, eye.ty, dt, omega * 0.92, zeta);
    }

    cursorPos.tx = pointer.x;
    cursorPos.ty = pointer.y;
    cursorPos.x += (cursorPos.tx - cursorPos.x) * (1 - Math.exp(-dt * 18));
    cursorPos.y += (cursorPos.ty - cursorPos.y) * (1 - Math.exp(-dt * 18));
    if (cursorEl.isConnected) {
      cursorEl.style.transform = `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`;
    }
  }

  stepBlink(dt);
  draw();
  requestAnimationFrame(tick);
}

function onPointer(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.inside = true;
  lookAt(event.clientX, event.clientY);
}

window.addEventListener("pointermove", onPointer, { passive: true });
window.addEventListener("pointerdown", onPointer, { passive: true });
window.addEventListener("pointerleave", () => {
  pointer.inside = false;
  restEyes();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) restEyes();
});

window.addEventListener("resize", sizeCanvas);
if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(sizeCanvas).observe(portrait);
}

function start() {
  sizeCanvas();
  last = performance.now();
  requestAnimationFrame(tick);
  if (!reduceMotion) scheduleBlink();
}

if (still.complete && still.naturalWidth) start();
else still.addEventListener("load", start, { once: true });
still.addEventListener("error", start, { once: true });
