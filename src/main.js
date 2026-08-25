import { ScrollTrigger } from "gsap/ScrollTrigger";
import { pieceCount } from "./composition.js";
import { buildExperience, mountOrnaments } from "./timeline.js";

const boot = document.querySelector("#boot");
const ornamentsRoot = document.querySelector("#ornaments");
const sheep = document.querySelector("#sheep");

const pieces = mountOrnaments(ornamentsRoot);
document.title = `SPECIMEN 001 — ${pieceCount()} layers`;

function waitForImage(img) {
  if (!img || img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

async function start() {
  const ornamentImages = [...ornamentsRoot.querySelectorAll("img")];
  await withTimeout(
    Promise.all([
      document.fonts.ready.catch(() => {}),
      waitForImage(sheep),
      ...ornamentImages.map(waitForImage),
    ]),
    4000
  );

  buildExperience(pieces);
  ScrollTrigger.refresh();
  requestAnimationFrame(() => {
    boot.classList.add("is-done");
    ScrollTrigger.refresh();
  });
}

start();

window.addEventListener(
  "load",
  () => {
    ScrollTrigger.refresh();
  },
  { once: true }
);
