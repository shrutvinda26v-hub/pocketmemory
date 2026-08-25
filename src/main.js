import gsap from "gsap";

const IMAGE = { w: 1280, h: 720 };

const EYES = [
  {
    el: document.getElementById("eyeL"),
    ball: document.getElementById("ballL"),
    lid: document.getElementById("lidL"),
    cx: 580,
    cy: 228,
    w: 54,
    h: 40,
  },
  {
    el: document.getElementById("eyeR"),
    ball: document.getElementById("ballR"),
    lid: document.getElementById("lidR"),
    cx: 680,
    cy: 228,
    w: 54,
    h: 40,
  },
];

const portrait = document.getElementById("portrait");
const still = document.getElementById("still");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(hover: none)").matches;

const MAX_LOOK = { x: 7.6, y: 5.1 };
const LOOK_RANGE = { x: 0.52, y: 0.48 };

let scaleX = 1;
let scaleY = 1;
let layoutReady = false;
let pointerInside = false;

const cursor = document.createElement("div");
cursor.className = "cursor";
if (!coarse && !reduceMotion) document.body.appendChild(cursor);

const cursorX = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
const cursorY = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });

const trackers = EYES.map((eye) => ({
  ...eye,
  xTo: gsap.quickTo(eye.ball, "x", {
    duration: 0.72,
    ease: "power3.out",
    force3D: false,
  }),
  yTo: gsap.quickTo(eye.ball, "y", {
    duration: 0.72,
    ease: "power3.out",
    force3D: false,
  }),
}));

function layout() {
  const rect = portrait.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return;

  scaleX = rect.width / IMAGE.w;
  scaleY = rect.height / IMAGE.h;

  for (const eye of trackers) {
    const left = (eye.cx - eye.w / 2) * scaleX;
    const top = (eye.cy - eye.h / 2) * scaleY;
    const width = eye.w * scaleX;
    const height = eye.h * scaleY;

    gsap.set(eye.el, { width, height, x: left, y: top, force3D: false });
    gsap.set(eye.ball, {
      width: rect.width,
      height: rect.height,
      x: 0,
      y: 0,
      left: -left,
      top: -top,
      force3D: false,
    });
  }

  layoutReady = true;
  for (const eye of trackers) eye.el.classList.add("is-ready");
}

function lookAt(clientX, clientY) {
  if (!layoutReady || reduceMotion) return;

  const rect = portrait.getBoundingClientRect();
  const midX = rect.left + ((EYES[0].cx + EYES[1].cx) / 2) * scaleX;
  const midY = rect.top + EYES[0].cy * scaleY;

  const nx = gsap.utils.clamp(-1, 1, (clientX - midX) / (rect.width * LOOK_RANGE.x));
  const ny = gsap.utils.clamp(-1, 1, (clientY - midY) / (rect.height * LOOK_RANGE.y));

  const tx = nx * MAX_LOOK.x * scaleX;
  const ty = ny * MAX_LOOK.y * scaleY;

  for (const eye of trackers) {
    eye.xTo(tx);
    eye.yTo(ty);
  }
}

function restEyes() {
  for (const eye of trackers) {
    eye.xTo(0);
    eye.yTo(0);
  }
}

function blink(double = false) {
  const lids = trackers.map((eye) => eye.lid);
  const tl = gsap.timeline();
  tl.to(lids, {
    scaleY: 1,
    duration: 0.072,
    ease: "power2.in",
    stagger: 0.012,
    overwrite: true,
  })
    .to(lids, {
      scaleY: 0,
      duration: 0.11,
      ease: "power2.out",
      stagger: 0.01,
    });

  if (double) {
    tl.to(lids, {
      scaleY: 1,
      duration: 0.06,
      ease: "power2.in",
      delay: 0.09,
    }).to(lids, {
      scaleY: 0,
      duration: 0.12,
      ease: "power2.out",
    });
  }
  return tl;
}

function scheduleBlink() {
  const wait = gsap.utils.random(2.8, 6.4);
  gsap.delayedCall(wait, () => {
    blink(Math.random() < 0.22);
    scheduleBlink();
  });
}

function onPointer(event) {
  pointerInside = true;
  if (!coarse) {
    cursorX(event.clientX);
    cursorY(event.clientY);
  }
  lookAt(event.clientX, event.clientY);
}

window.addEventListener("pointermove", onPointer, { passive: true });
window.addEventListener("pointerdown", onPointer, { passive: true });
window.addEventListener("pointerleave", () => {
  pointerInside = false;
  restEyes();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) restEyes();
});

window.addEventListener("resize", layout);
if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(layout).observe(portrait);
}

function start() {
  gsap.set(
    trackers.map((eye) => eye.lid),
    { scaleY: 0, transformOrigin: "50% 8%" }
  );
  layout();
  if (!reduceMotion) {
    gsap.delayedCall(0.9, () => blink(false));
    scheduleBlink();
  }
}

if (still.complete) start();
else still.addEventListener("load", start, { once: true });
still.addEventListener("error", start, { once: true });

if (reduceMotion) {
  for (const eye of trackers) eye.el.style.opacity = "0";
}

void pointerInside;
