import gsap from "gsap";

const IMAGE = { w: 1536, h: 1024 };

const EYES = [
  {
    id: "left",
    pupilX: 631,
    pupilY: 500,
    clipX: 624,
    clipY: 490,
    rx: 52,
    ry: 56,
    side: -1,
  },
  {
    id: "right",
    pupilX: 911,
    pupilY: 499,
    clipX: 916,
    clipY: 490,
    rx: 54,
    ry: 56,
    side: 1,
  },
];

const MAX_LOOK = 34;
const EASE = 0.13;

const portrait = document.getElementById("portrait");
const still = document.getElementById("still");
const canvas = document.getElementById("eyes");
const ctx = canvas.getContext("2d", { alpha: true });

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const look = { x: 0, y: 0, tx: 0, ty: 0 };
const lids = { amount: 0 };

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

const irisImages = {
  left: loadImage("./assets/iris-left.png"),
  right: loadImage("./assets/iris-right.png"),
};
const eyeMask = loadImage("./assets/eye-mask.png");
const lashes = loadImage("./assets/lashes.png");

let dpr = 1;
let cssW = 0;
let cssH = 0;

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

function toCss(nx, ny) {
  return [(nx / IMAGE.w) * cssW, (ny / IMAGE.h) * cssH];
}

function drawLashesOnTop(eye) {
  const [cx, cy] = toCss(eye.clipX, eye.clipY);
  const rx = (eye.rx / IMAGE.w) * cssW;
  const ry = (eye.ry / IMAGE.h) * cssH;
  const outer = eye.side;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1a0e0a";

  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.11;
    const ang = -Math.PI * 0.55 + outer * (0.15 + t * 0.95);
    const x0 = cx + Math.cos(ang) * rx * 0.92;
    const y0 = cy + Math.sin(ang) * ry * 0.78 - ry * 0.12;
    const flare = 0.55 + t * 0.35;
    const x1 = x0 + outer * rx * 0.22 * flare;
    const y1 = y0 - ry * (0.38 + t * 0.12);
    ctx.lineWidth = Math.max(1.6, rx * (0.055 - t * 0.018));
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + outer * rx * 0.06, y0 - ry * 0.18, x1, y1);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEyeInterior(eye, ox, oy) {
  const [cx, cy] = toCss(eye.clipX, eye.clipY);
  const rx = (eye.rx / IMAGE.w) * cssW;
  const ry = (eye.ry / IMAGE.h) * cssH;
  const [px, py] = toCss(eye.pupilX, eye.pupilY);

  ctx.fillStyle = "rgba(42, 24, 16, 0.16)";
  ctx.beginPath();
  ctx.ellipse(cx, cy - ry * 0.62, rx * 0.9, ry * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = irisImages[eye.id];
  const irisR = img.naturalWidth
    ? ((img.naturalWidth / 2) / IMAGE.w) * cssW
    : (43 / IMAGE.w) * cssW;

  if (img.complete && img.naturalWidth) {
    ctx.drawImage(img, px + ox - irisR, py + oy - irisR, irisR * 2, irisR * 2);
  } else {
    ctx.fillStyle = "#2f90d4";
    ctx.beginPath();
    ctx.arc(px + ox, py + oy, irisR * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(px + ox, py + oy, irisR * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(px + ox + irisR * 0.22, py + oy - irisR * 0.26, irisR * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }

  if (lids.amount > 0.02) {
    const t = lids.amount;
    ctx.fillStyle = "#e9d3b7";
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry + ry * t, rx * 1.08, ry * t * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#1c100c";
    ctx.lineWidth = Math.max(2.2, rx * 0.07);
    ctx.lineCap = "round";
    ctx.beginPath();
    const lidY = cy - ry + ry * 2 * t * 0.96;
    ctx.moveTo(cx - rx * 0.9, lidY);
    ctx.quadraticCurveTo(cx, lidY + ry * 0.08 * (1 - t), cx + rx * 0.9, lidY);
    ctx.stroke();
  }
}

function draw() {
  if (!cssW) return;

  look.x += (look.tx - look.x) * (reduceMotion ? 1 : EASE);
  look.y += (look.ty - look.y) * (reduceMotion ? 1 : EASE);

  ctx.clearRect(0, 0, cssW, cssH);

  const ox = look.x * (cssW / IMAGE.w);
  const oy = look.y * (cssH / IMAGE.h);

  if (eyeMask.complete && eyeMask.naturalWidth) {
    ctx.save();
    ctx.drawImage(eyeMask, 0, 0, cssW, cssH);
    ctx.globalCompositeOperation = "source-in";

    const sclera = ctx.createLinearGradient(0, cssH * 0.38, 0, cssH * 0.58);
    sclera.addColorStop(0, "#f6e6d0");
    sclera.addColorStop(0.35, "#fbf4e8");
    sclera.addColorStop(1, "#f3e4cc");
    ctx.fillStyle = sclera;
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.globalCompositeOperation = "source-atop";
    for (const eye of EYES) drawEyeInterior(eye, ox, oy);
    ctx.restore();
  } else {
    for (const eye of EYES) {
      ctx.save();
      const [cx, cy] = toCss(eye.clipX, eye.clipY);
      const rx = (eye.rx / IMAGE.w) * cssW;
      const ry = (eye.ry / IMAGE.h) * cssH;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#fbf4e8";
      ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
      drawEyeInterior(eye, ox, oy);
      ctx.restore();
    }
  }

  if (lashes.complete && lashes.naturalWidth) {
    ctx.drawImage(lashes, 0, 0, cssW, cssH);
  }
  for (const eye of EYES) drawLashesOnTop(eye);
}

function tick() {
  draw();
  requestAnimationFrame(tick);
}

function lookAt(clientX, clientY) {
  if (reduceMotion) return;
  const rect = portrait.getBoundingClientRect();
  const midX =
    rect.left + (((EYES[0].pupilX + EYES[1].pupilX) / 2) / IMAGE.w) * rect.width;
  const midY = rect.top + (EYES[0].pupilY / IMAGE.h) * rect.height;
  const nx = (clientX - midX) / (rect.width * 0.38);
  const ny = (clientY - midY) / (rect.height * 0.4);
  const len = Math.hypot(nx, ny) || 1;
  const cap = Math.min(1, len);
  look.tx = (nx / len) * cap * MAX_LOOK;
  look.ty = (ny / len) * cap * MAX_LOOK * 0.78;
}

function restEyes() {
  look.tx = 0;
  look.ty = 0;
}

function blinkOnce() {
  return gsap
    .timeline()
    .to(lids, { amount: 1, duration: 0.1, ease: "power2.in", overwrite: "auto" })
    .to(lids, { amount: 1, duration: 0.07 })
    .to(lids, { amount: 0, duration: 0.18, ease: "power2.out" });
}

function blink(double = false) {
  const tl = blinkOnce();
  if (double) tl.add(blinkOnce(), "+=0.12");
  return tl;
}

function scheduleBlink() {
  gsap.delayedCall(gsap.utils.random(2.8, 6.2), () => {
    blink(Math.random() < 0.24);
    scheduleBlink();
  });
}

window.addEventListener("pointermove", (event) => lookAt(event.clientX, event.clientY), {
  passive: true,
});
window.addEventListener("pointerdown", (event) => lookAt(event.clientX, event.clientY), {
  passive: true,
});
window.addEventListener("pointerleave", restEyes);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) restEyes();
});

window.addEventListener("resize", sizeCanvas);
if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(sizeCanvas).observe(portrait);
}

function start() {
  sizeCanvas();
  requestAnimationFrame(tick);
  if (!reduceMotion) {
    gsap.delayedCall(1.6, () => blink(false));
    scheduleBlink();
  }
}

if (still.complete) start();
else still.addEventListener("load", start, { once: true });
still.addEventListener("error", start, { once: true });
