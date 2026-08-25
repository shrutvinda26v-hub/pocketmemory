import gsap from "gsap";

const IMAGE = { w: 1536, h: 1024 };

const EYES = [
  { id: "left", pupilX: 631, pupilY: 500, clipX: 626, clipY: 496, rx: 46, ry: 48, irisR: 43 },
  { id: "right", pupilX: 911, pupilY: 499, clipX: 914, clipY: 496, rx: 48, ry: 48, irisR: 44 },
];

const MAX_LOOK = 28;
const EASE = 0.16;

const portrait = document.getElementById("portrait");
const still = document.getElementById("still");
const canvas = document.getElementById("eyes");
const daisy = document.getElementById("daisy");
const ctx = canvas.getContext("2d", { alpha: true });

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const look = { x: 0, y: 0, tx: 0, ty: 0 };
const lids = { amount: 0 };
const chew = { amount: 0 };

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

const irisImages = {
  left: loadImage("./assets/iris-left.png"),
  right: loadImage("./assets/iris-right.png"),
};

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

function drawEye(eye, ox, oy) {
  const [cx, cy] = toCss(eye.clipX, eye.clipY);
  const rx = (eye.rx / IMAGE.w) * cssW;
  const ry = (eye.ry / IMAGE.h) * cssH;
  const [px, py] = toCss(eye.pupilX, eye.pupilY);

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  const sclera = ctx.createRadialGradient(cx - rx * 0.1, cy - ry * 0.2, rx * 0.1, cx, cy, rx);
  sclera.addColorStop(0, "#fffdf8");
  sclera.addColorStop(0.68, "#f4ead8");
  sclera.addColorStop(1, "#e4d0b8");
  ctx.fillStyle = sclera;
  ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);

  ctx.fillStyle = "rgba(40, 24, 16, 0.16)";
  ctx.beginPath();
  ctx.ellipse(cx, cy - ry * 0.7, rx * 0.92, ry * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = irisImages[eye.id];
  const irisR = img.naturalWidth
    ? ((img.naturalWidth / 2) / IMAGE.w) * cssW
    : (eye.irisR / IMAGE.w) * cssW;

  if (img.complete && img.naturalWidth) {
    ctx.drawImage(img, px + ox - irisR, py + oy - irisR, irisR * 2, irisR * 2);
  } else {
    ctx.fillStyle = "#2f90d4";
    ctx.beginPath();
    ctx.arc(px + ox, py + oy, irisR * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(px + ox, py + oy, irisR * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(px + ox + irisR * 0.2, py + oy - irisR * 0.26, irisR * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }

  if (lids.amount > 0.02) {
    const t = lids.amount;
    ctx.fillStyle = "#e6d0b4";
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry + ry * t, rx * 1.06, ry * t, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1a0f0c";
    ctx.lineWidth = Math.max(2.2, rx * 0.07);
    ctx.lineCap = "round";
    ctx.beginPath();
    const lidY = cy - ry + ry * 2 * t * 0.95;
    ctx.moveTo(cx - rx * 0.88, lidY);
    ctx.quadraticCurveTo(cx, lidY + ry * 0.07, cx + rx * 0.88, lidY);
    ctx.stroke();
  }

  ctx.restore();
}

function draw() {
  if (!cssW) return;

  look.x += (look.tx - look.x) * (reduceMotion ? 1 : EASE);
  look.y += (look.ty - look.y) * (reduceMotion ? 1 : EASE);

  ctx.clearRect(0, 0, cssW, cssH);

  const ox = look.x * (cssW / IMAGE.w);
  const oy = look.y * (cssH / IMAGE.h);

  for (const eye of EYES) drawEye(eye, ox, oy);
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
  const nx = (clientX - midX) / Math.max(160, window.innerWidth * 0.42);
  const ny = (clientY - midY) / Math.max(120, window.innerHeight * 0.42);
  const len = Math.hypot(nx, ny) || 1;
  const cap = Math.min(1, len);
  look.tx = (nx / len) * cap * MAX_LOOK;
  look.ty = (ny / len) * cap * MAX_LOOK * 0.82;
}

function restEyes() {
  look.tx = 0;
  look.ty = 0;
}

function blinkOnce() {
  return gsap
    .timeline()
    .to(lids, { amount: 1, duration: 0.1, ease: "power2.in", overwrite: "auto" })
    .to(lids, { amount: 1, duration: 0.08 })
    .to(lids, { amount: 0, duration: 0.18, ease: "power2.out" });
}

function blink(double = false) {
  const tl = blinkOnce();
  if (double) tl.add(blinkOnce(), "+=0.12");
  return tl;
}

function scheduleBlink() {
  gsap.delayedCall(gsap.utils.random(3.2, 6.5), () => {
    blink(Math.random() < 0.22);
    scheduleBlink();
  });
}

function startChewing() {
  if (reduceMotion || !daisy) return;
  gsap.set(daisy, { transformOrigin: "11.35% 55.56%" });

  const chewLoop = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.delayedCall(gsap.utils.random(0.45, 1.4), chewLoop);
      },
    });

    const bites = gsap.utils.random(3, 5, 1);
    for (let i = 0; i < bites; i++) {
      const rot = gsap.utils.random(-11, 12);
      const lift = gsap.utils.random(2, 7);
      tl.to(chew, { amount: 1, duration: 0.14, ease: "sine.in" }, ">");
      tl.to(
        daisy,
        {
          rotation: rot,
          x: gsap.utils.random(-3, 4),
          y: lift,
          duration: 0.14,
          ease: "sine.in",
        },
        "<"
      );
      tl.to(chew, { amount: 0.15, duration: 0.16, ease: "sine.out" });
      tl.to(
        daisy,
        {
          rotation: rot * 0.3,
          x: 0,
          y: lift * 0.25,
          duration: 0.16,
          ease: "sine.out",
        },
        "<"
      );
    }

    tl.to(chew, { amount: 0, duration: 0.28, ease: "power2.out" });
    tl.to(daisy, { rotation: 0, x: 0, y: 0, duration: 0.32, ease: "power2.out" }, "<");
  };

  gsap.delayedCall(0.6, chewLoop);
}

window.addEventListener("pointermove", (event) => lookAt(event.clientX, event.clientY), {
  passive: true,
});
window.addEventListener("pointerdown", (event) => lookAt(event.clientX, event.clientY), {
  passive: true,
});
document.documentElement.addEventListener("mouseleave", restEyes);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) restEyes();
});

window.addEventListener("resize", sizeCanvas);
if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(sizeCanvas).observe(portrait);
}

window.__setLook = (x, y) => {
  look.x = look.tx = x;
  look.y = look.ty = y;
};
window.__setLids = (amount) => {
  lids.amount = amount;
};
window.__setChew = (amount) => {
  chew.amount = amount;
};

function start() {
  sizeCanvas();
  requestAnimationFrame(tick);
  if (!reduceMotion) {
    gsap.delayedCall(1.8, () => blink(false));
    scheduleBlink();
    startChewing();
  }
}

if (still.complete) start();
else still.addEventListener("load", start, { once: true });
still.addEventListener("error", start, { once: true });
