import { PageFlip } from "page-flip";
import { COVER, WORLDS } from "./worlds.js";
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
let autoplay = !reduced;
let autoTimer = 0;

function bookSize() {
  const maxW = Math.min(1120, window.innerWidth * 0.86);
  const maxH = window.innerHeight * 0.78;
  let pageWidth = maxW / 2;
  let pageHeight = pageWidth / PAGE_RATIO;
  if (pageHeight > maxH) {
    pageHeight = maxH;
    pageWidth = pageHeight * PAGE_RATIO;
  }
  return {
    pageWidth: Math.max(180, Math.round(pageWidth)),
    pageHeight: Math.max(240, Math.round(pageHeight)),
  };
}

function makeCover(src, side) {
  const page = document.createElement("div");
  page.className = `page page-cover page-cover-${side}`;
  page.dataset.density = "hard";
  page.style.backgroundImage = `url("${src}")`;
  return page;
}

function makeSpreadPage(world, side) {
  const page = document.createElement("div");
  page.className = `page page-world page-${side}`;
  page.dataset.density = "soft";
  page.dataset.world = world.id;
  page.dataset.kind = world.kind;
  const art = document.createElement("div");
  art.className = "page-art";
  art.style.backgroundImage = `url("${world.src}")`;
  art.style.backgroundPosition = side === "left" ? "left center" : "right center";
  page.appendChild(art);
  return page;
}

function currentWorldFromPage(index) {
  if (index <= 0) return WORLDS[0];
  const interior = Math.min(index, WORLDS.length * 2);
  const worldIndex = Math.floor((interior - 1) / 2);
  return WORLDS[Math.max(0, Math.min(WORLDS.length - 1, worldIndex))];
}

function applyWorld(index) {
  const world = currentWorldFromPage(index);
  studio.dataset.world = world.id;
  fx.setTint(world.tint);
}

function burstFor(index, side) {
  const now = performance.now();
  if (now - lastBurst < 160) return;
  lastBurst = now;
  const world = currentWorldFromPage(index);
  fx.burst(world.kind, fx.originFromBook(document.getElementById("bookShell"), side), 1.15);
}

function stopAutoplay() {
  autoplay = false;
  window.clearTimeout(autoTimer);
}

function firstInteriorPage() {
  return 1;
}

function lastInteriorPage() {
  return WORLDS.length * 2 - 1;
}

function scheduleAutoplay() {
  if (!autoplay) return;
  autoTimer = window.setTimeout(() => {
    if (!autoplay || !pageFlip || flipping) {
      scheduleAutoplay();
      return;
    }
    const index = pageFlip.getCurrentPageIndex();
    if (index >= lastInteriorPage()) {
      pageFlip.flip(firstInteriorPage(), "bottom");
    } else {
      pageFlip.flipNext("bottom");
    }
    scheduleAutoplay();
  }, 2600);
}

function bindParallax() {
  if (reduced) return;
  window.addEventListener(
    "mousemove",
    (event) => {
      if (flipping) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 5;
      const y = (event.clientY / window.innerHeight - 0.5) * -3.5;
      bookRig.style.setProperty("--tilt-x", `${10 + y}deg`);
      bookRig.style.setProperty("--tilt-y", `${x}deg`);
    },
    { passive: true },
  );
}

function buildPages() {
  const pages = [makeCover(COVER.front, "front")];
  for (const world of WORLDS) {
    pages.push(makeSpreadPage(world, "left"));
    pages.push(makeSpreadPage(world, "right"));
  }
  pages.push(makeCover(COVER.back, "back"));
  for (const page of pages) flipRoot.appendChild(page);
  return pages;
}

function createBook(pages) {
  const { pageWidth, pageHeight } = bookSize();
  flipRoot.style.width = `${pageWidth * 2}px`;
  flipRoot.style.height = `${pageHeight}px`;

  const flip = new PageFlip(flipRoot, {
    width: pageWidth,
    height: pageHeight,
    size: "fixed",
    drawShadow: true,
    maxShadowOpacity: 0.8,
    showCover: true,
    usePortrait: false,
    flippingTime: reduced ? 240 : 1600,
    startZIndex: 4,
    autoSize: false,
    mobileScrollSupport: false,
    swipeDistance: 24,
    showPageCorners: !reduced,
    disableFlipByClick: false,
    useMouseEvents: true,
    clickEventForward: false,
    startPage: firstInteriorPage(),
  });

  flip.loadFromHTML(pages);
  return flip;
}

function init() {
  flipRoot.replaceChildren();
  const pages = buildPages();
  pageFlip = createBook(pages);
  applyWorld(firstInteriorPage());
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
      const side = index <= 0 ? "right" : "right";
      burstFor(index, side);
    }
  });

  const halt = () => stopAutoplay();
  flipRoot.addEventListener("mousedown", halt);
  flipRoot.addEventListener("touchstart", halt, { passive: true });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      stopAutoplay();
      pageFlip.flipNext("bottom");
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stopAutoplay();
      pageFlip.flipPrev("bottom");
    }
  });

  window.addEventListener("resize", () => {
    if (pageFlip) pageFlip.update();
  });

  bindParallax();
  window.setTimeout(() => scheduleAutoplay(), 1800);

  for (const world of WORLDS) {
    const img = new Image();
    img.src = world.src;
  }
}

init();
