const IMAGE = { w: 1536, h: 1024 };

const EYES = [
  { cx: 624, cy: 447, rx: 53, ry: 62, outer: -1 },
  { cx: 911, cy: 447, rx: 53, ry: 62, outer: 1 },
];

const IRIS = 40;
const PUPIL = { rx: 17.5, ry: 15.5 };
const MAX_LOOK = { x: 26, y: 20 };
const RANGE = { x: 0.38, y: 0.34 };
const LID = "#eadbc9";
const LASH = "#3d1c14";

const portrait = document.getElementById("portrait");
const still = document.getElementById("still");
const canvas = document.getElementById("eyes");
const ctx = canvas.getContext("2d", { alpha: true });

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;

const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
const cursorPos = { x: -80, y: -80 };

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
let nextBlink = 900;
let restTimer = 0;

const cursorEl = document.createElement("div");
cursorEl.className = "cursor";
if (!coarse && !reduceMotion) document.body.appendChild(cursorEl);

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

function toCss(nx, ny) {
  return [(nx / IMAGE.w) * cssW, (ny / IMAGE.h) * cssH];
}

function lookAt(clientX, clientY) {
  if (reduceMotion) return;
  const rect = portrait.getBoundingClientRect();
  const rangeX = Math.max(180, innerWidth * RANGE.x);
  const rangeY = Math.max(140, innerHeight * RANGE.y);

  for (const eye of eyes) {
    const [ex, ey] = toCss(eye.cx, eye.cy);
    const nx = clamp((clientX - (rect.left + ex)) / rangeX, -1, 1);
    const ny = clamp((clientY - (rect.top + ey)) / rangeY, -1, 1);
    let tx = nx * MAX_LOOK.x;
    let ty = ny * MAX_LOOK.y;
    const m = Math.hypot(tx / MAX_LOOK.x, ty / MAX_LOOK.y);
    if (m > 1) {
      tx /= m;
      ty /= m;
    }
    eye.tx = tx;
    eye.ty = ty;
  }
}

function restEyes() {
  for (const eye of eyes) {
    eye.tx = 0;
    eye.ty = 0;
  }
}

function cancelRest() {
  window.clearTimeout(restTimer);
}

function scheduleRest() {
  cancelRest();
  restTimer = window.setTimeout(restEyes, 500);
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
  nextBlink = 2600 + Math.random() * 2800;
}

function stepBlink(dt) {
  if (reduceMotion) {
    blink.amount = 0;
    return;
  }

  nextBlink -= dt * 1000;
  if (nextBlink <= 0 && blink.phase === "open") {
    triggerBlink(Math.random() < 0.28);
    scheduleBlink();
  }

  if (blink.phase === "closing") {
    blink.t += dt;
    const u = clamp(blink.t / 0.08, 0, 1);
    blink.amount = 1 - (1 - u) ** 2;
    if (u >= 1) {
      blink.phase = "shut";
      blink.hold = 0.05 + Math.random() * 0.04;
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
    const u = clamp(blink.t / 0.15, 0, 1);
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

function drawIris(ix, iy, irisR) {
  const g = ctx.createRadialGradient(
    ix - irisR * 0.18,
    iy - irisR * 0.22,
    irisR * 0.08,
    ix,
    iy,
    irisR
  );
  g.addColorStop(0, "#c8e8fb");
  g.addColorStop(0.22, "#5eb4ea");
  g.addColorStop(0.55, "#2b8fd4");
  g.addColorStop(0.82, "#1a6aae");
  g.addColorStop(1, "#0e3f72");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(ix, iy, irisR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#12100e";
  ctx.beginPath();
  ctx.ellipse(ix, iy, PUPIL.rx * (irisR / IRIS), PUPIL.ry * (irisR / IRIS), 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.arc(ix - irisR * 0.28, iy - irisR * 0.32, irisR * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ix + irisR * 0.22, iy + irisR * 0.18, irisR * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

function drawLashes(cx, cy, rx, ry, outer) {
  ctx.save();
  ctx.strokeStyle = LASH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 8; i++) {
    const t = 0.06 + i * 0.1;
    const ang = -Math.PI * 0.58 + outer * (0.12 + t * 1.02);
    const x0 = cx + Math.cos(ang) * rx * 0.94;
    const y0 = cy + Math.sin(ang) * ry * 0.72 - ry * 0.14;
    const flare = 0.5 + t * 0.4;
    const x1 = x0 + outer * rx * 0.2 * flare;
    const y1 = y0 - ry * (0.34 + t * 0.1);
    ctx.lineWidth = Math.max(1.5, rx * (0.05 - t * 0.016));
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + outer * rx * 0.05, y0 - ry * 0.16, x1, y1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLids(cx, cy, rx, ry, amount) {
  if (amount < 0.02) return;
  const t = amount;
  ctx.fillStyle = LID;
  ctx.beginPath();
  ctx.ellipse(cx, cy - ry + ry * t * 1.05, rx * 1.12, ry * t * 1.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + ry - ry * t * 0.55, rx * 1.08, ry * t * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = LASH;
  ctx.lineWidth = Math.max(2, rx * 0.065);
  ctx.lineCap = "round";
  ctx.beginPath();
  const lidY = cy - ry + ry * 2 * t * 0.92;
  ctx.moveTo(cx - rx * 0.92, lidY);
  ctx.quadraticCurveTo(cx, lidY + ry * 0.06 * (1 - t), cx + rx * 0.92, lidY);
  ctx.stroke();
}

function draw() {
  if (!cssW) return;
  ctx.clearRect(0, 0, cssW, cssH);

  const sx = cssW / IMAGE.w;
  const sy = cssH / IMAGE.h;

  eyes.forEach((eye, index) => {
    const [cx, cy] = toCss(eye.cx, eye.cy);
    const rx = eye.rx * sx;
    const ry = eye.ry * sy;
    const irisR = IRIS * sx;
    const ox = eye.x * sx;
    const oy = eye.y * sy;
    const lid = clamp(blink.amount + (index ? -0.05 : 0), 0, 1);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "#fbfcfd";
    ctx.fill();

    ctx.fillStyle = "rgba(40, 24, 16, 0.12)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.62, rx * 0.92, ry * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    drawIris(cx + ox, cy + oy, irisR);
    ctx.restore();

    drawLashes(cx, cy, rx, ry, eye.outer);
    drawLids(cx, cy, rx, ry, lid);
  });
}

function tick(now) {
  const dt = clamp((now - last) / 1000, 0.001, 0.033);
  last = now;

  if (!reduceMotion) {
    for (const eye of eyes) {
      const err = Math.hypot(eye.tx - eye.x, eye.ty - eye.y);
      const saccade = err > 4;
      const omega = saccade ? 26 : 16;
      const zeta = saccade ? 0.78 : 0.88;
      [eye.x, eye.vx] = spring(eye.x, eye.vx, eye.tx, dt, omega, zeta);
      [eye.y, eye.vy] = spring(eye.y, eye.vy, eye.ty, dt, omega * 0.9, zeta);
    }

    cursorPos.x += (pointer.x - cursorPos.x) * (1 - Math.exp(-dt * 18));
    cursorPos.y += (pointer.y - cursorPos.y) * (1 - Math.exp(-dt * 18));
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
  cancelRest();
  lookAt(event.clientX, event.clientY);
}

window.addEventListener("pointermove", onPointer, { passive: true });
window.addEventListener("pointerdown", onPointer, { passive: true });
window.addEventListener("pointerleave", scheduleRest);
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
  if (!reduceMotion) {
    window.setTimeout(() => triggerBlink(false), 800);
    scheduleBlink();
  }
}

if (still.complete && still.naturalWidth) start();
else still.addEventListener("load", start, { once: true });
still.addEventListener("error", start, { once: true });
