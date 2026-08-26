import { PageFlip } from "page-flip";
import { WORLDS } from "./worlds.js";
import { ParticleField } from "./particles.js";

const PAGE_RATIO = 3 / 4;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const studio = document.getElementById("studio");
const bookRig = document.getElementById("bookRig");
const flipRoot = document.getElementById("flipbook");
const fx = new ParticleField(document.getElementById("fx"));

let pageFlip;
let flipping = false;
let lastBurst = 0;

function bookSize() {
  const maxW = Math.min(1080, window.innerWidth * 0.82);
  const maxH = window.innerHeight * 0.74;
  let pageWidth = maxW / 2;
  let pageHeight = pageWidth / PAGE_RATIO;
  if (pageHeight > maxH) {
    pageHeight = maxH;
    pageWidth = pageHeight * PAGE_RATIO;
  }
  return {
    pageWidth: Math.round(pageWidth),
    pageHeight: Math.round(pageHeight),
  };
}

function preload(src) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode ? img.decode() : new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
}

function currentWorld(index) {
  return WORLDS[Math.max(0, Math.min(WORLDS.length - 1, index))];
}

function applyWorld(index) {
  const world = currentWorld(index);
  studio.dataset.world = world.id;
  fx.setTint(world.tint);
}

function burstFor(index, side) {
  const now = performance.now();
  if (now - lastBurst < 180) return;
  lastBurst = now;
  const world = currentWorld(index);
  fx.burst(world.kind, fx.originFromBook(document.getElementById("bookShell"), side));
}

function bindParallax() {
  if (reduced) return;
  window.addEventListener(
    "mousemove",
    (event) => {
      if (flipping) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 6;
      const y = (event.clientY / window.innerHeight - 0.5) * -4;
      bookRig.style.setProperty("--tilt-x", `${12 + y}deg`);
      bookRig.style.setProperty("--tilt-y", `${x}deg`);
    },
    { passive: true },
  );
}

async function init() {
  await Promise.all(WORLDS.map((world) => preload(world.src)));

  const { pageWidth, pageHeight } = bookSize();

  const pages = WORLDS.map((world) => {
    const page = document.createElement("div");
    page.className = "page";
    page.dataset.density = "soft";
    const img = document.createElement("img");
    img.src = world.src;
    img.alt = world.alt;
    img.draggable = false;
    page.appendChild(img);
    flipRoot.appendChild(page);
    return page;
  });

  pageFlip = new PageFlip(flipRoot, {
    width: pageWidth,
    height: pageHeight,
    size: "stretch",
    minWidth: Math.round(pageWidth * 0.55),
    maxWidth: pageWidth,
    minHeight: Math.round(pageHeight * 0.55),
    maxHeight: pageHeight,
    drawShadow: true,
    maxShadowOpacity: 0.72,
    showCover: false,
    usePortrait: false,
    flippingTime: reduced ? 200 : 1400,
    startZIndex: 4,
    autoSize: true,
    mobileScrollSupport: false,
    swipeDistance: 28,
    showPageCorners: !reduced,
    disableFlipByClick: false,
    useMouseEvents: true,
    clickEventForward: false,
  });

  pageFlip.loadFromHTML(pages);
  applyWorld(0);
  studio.classList.add("is-ready");

  pageFlip.on("flip", (event) => {
    applyWorld(event.data);
    flipping = false;
    bookRig.classList.remove("is-flipping");
  });

  pageFlip.on("changeState", (event) => {
    const state = event.data;
    const folding = state === "flipping" || state === "user_fold" || state === "fold_corner";
    flipping = folding;
    bookRig.classList.toggle("is-flipping", folding);
    if (folding) {
      const index = pageFlip.getCurrentPageIndex();
      burstFor(index, "right");
    }
    if (state === "read") {
      bookRig.classList.remove("is-flipping");
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      pageFlip.flipNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      pageFlip.flipPrev();
    }
  });

  bindParallax();
}

init().catch((error) => {
  console.error("Storybook failed to open", error);
});
