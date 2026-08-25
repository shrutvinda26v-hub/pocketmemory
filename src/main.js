import gsap from "gsap";

const IMAGE = { w: 1280, h: 720 };

const EYES = [
  { cx: 580, cy: 226, rx: 28, ry: 20, lid: "left" },
  { cx: 712, cy: 224, rx: 28, ry: 20, lid: "right" },
];

const MAX_LOOK = { x: 11.5, y: 7.4 };
const LOOK_RANGE = { x: 0.46, y: 0.42 };
const EASE = 0.12;

const portrait = document.getElementById("portrait");
const still = document.getElementById("still");
const canvas = document.getElementById("eyes");
const ctx = canvas.getContext("2d");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(hover: none)").matches;

const look = { x: 0, y: 0, tx: 0, ty: 0 };
const lids = { amount: 0 };

const lidImages = { left: new Image(), right: new Image() };
lidImages.left.src = "./assets/lid-left.png";
lidImages.right.src = "./assets/lid-right.png";

let source = still;
let dpr = 1;
let cssW = 0;
let cssH = 0;
const maskCache = new Map();

function eyeMask(rx, ry) {
  const key = `${rx.toFixed(2)}x${ry.toFixed(2)}`;
  if (maskCache.has(key)) return maskCache.get(key);

  const blur = 1.35;
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
  g.ellipse(mw / 2, mh / 2, Math.max(1, rx - 1.1), Math.max(1, ry - 1.1), 0, 0, Math.PI * 2);
  g.fill();
  maskCache.set(key, c);
  return c;
}

const cursor = document.createElement("div");
cursor.className = "cursor";
if (!coarse && !reduceMotion) document.body.appendChild(cursor);
const cursorX = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
const cursorY = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });

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

function nativeToCss(nx, ny) {
  return [(nx / IMAGE.w) * cssW, (ny / IMAGE.h) * cssH];
}

const layer = document.createElement("canvas");
const lctx = layer.getContext("2d");

function draw() {
  if (!cssW || !source.naturalWidth) return;

  look.x += (look.tx - look.x) * (reduceMotion ? 1 : EASE);
  look.y += (look.ty - look.y) * (reduceMotion ? 1 : EASE);

  ctx.clearRect(0, 0, cssW, cssH);

  const ox = look.x * (cssW / IMAGE.w);
  const oy = look.y * (cssH / IMAGE.h);

  for (const eye of EYES) {
    const [cx, cy] = nativeToCss(eye.cx, eye.cy);
    const rx = eye.rx * (cssW / IMAGE.w);
    const ry = eye.ry * (cssH / IMAGE.h);
    const mask = eyeMask(rx, ry);
    const lw = mask.width;
    const lh = mask.height;
    const lx = cx - lw / 2;
    const ly = cy - lh / 2;

    if (layer.width !== lw || layer.height !== lh) {
      layer.width = lw;
      layer.height = lh;
    }
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.globalCompositeOperation = "source-over";
    lctx.clearRect(0, 0, lw, lh);
    lctx.drawImage(source, ox - lx, oy - ly, cssW, cssH);

    if (lids.amount > 0.01) {
      const lid = lidImages[eye.lid];
      const h = Math.max(1, ry * 2 * lids.amount);
      if (lid.complete && lid.naturalWidth) {
        lctx.drawImage(lid, lw / 2 - rx, lh / 2 - ry + (ry * 2 - h) * 0.05, rx * 2, h);
      } else {
        lctx.fillStyle = "rgba(52, 40, 32, 0.72)";
        lctx.beginPath();
        lctx.ellipse(lw / 2, lh / 2, rx, h / 2, 0, 0, Math.PI * 2);
        lctx.fill();
      }
    }

    lctx.globalCompositeOperation = "destination-in";
    lctx.drawImage(mask, 0, 0);
    ctx.drawImage(layer, lx, ly);
  }
}

function tick() {
  draw();
  requestAnimationFrame(tick);
}

function lookAt(clientX, clientY) {
  if (reduceMotion) return;
  const rect = portrait.getBoundingClientRect();
  const midX = rect.left + ((EYES[0].cx + EYES[1].cx) / 2 / IMAGE.w) * rect.width;
  const midY = rect.top + (EYES[0].cy / IMAGE.h) * rect.height;
  look.tx = gsap.utils.clamp(-1, 1, (clientX - midX) / (rect.width * LOOK_RANGE.x)) * MAX_LOOK.x;
  look.ty = gsap.utils.clamp(-1, 1, (clientY - midY) / (rect.height * LOOK_RANGE.y)) * MAX_LOOK.y;
}

function restEyes() {
  look.tx = 0;
  look.ty = 0;
}

function blinkOnce() {
  return gsap
    .timeline()
    .to(lids, { amount: 1, duration: 0.078, ease: "power2.in", overwrite: "auto" })
    .to(lids, { amount: 1, duration: 0.05 })
    .to(lids, { amount: 0, duration: 0.15, ease: "power2.out" });
}

function blink(double = false) {
  const tl = blinkOnce();
  if (double) tl.add(blinkOnce(), "+=0.08");
  return tl;
}

function scheduleBlink() {
  gsap.delayedCall(gsap.utils.random(2.2, 5.5), () => {
    blink(Math.random() < 0.28);
    scheduleBlink();
  });
}

function onPointer(event) {
  if (!coarse) {
    cursorX(event.clientX);
    cursorY(event.clientY);
  }
  lookAt(event.clientX, event.clientY);
}

window.addEventListener("pointermove", onPointer, { passive: true });
window.addEventListener("pointerdown", onPointer, { passive: true });
window.addEventListener("pointerleave", restEyes);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) restEyes();
});

window.addEventListener("resize", sizeCanvas);
if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(sizeCanvas).observe(portrait);
}

function start() {
  source = still;
  sizeCanvas();
  requestAnimationFrame(tick);
  if (!reduceMotion) {
    gsap.delayedCall(1.05, () => blink(false));
    scheduleBlink();
  }
}

if (still.complete) start();
else still.addEventListener("load", start, { once: true });
still.addEventListener("error", start, { once: true });
