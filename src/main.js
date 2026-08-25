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

async function start() {
  const ornamentImages = [...ornamentsRoot.querySelectorAll("img")];
  await Promise.all([
    document.fonts.ready.catch(() => {}),
    waitForImage(sheep),
    ...ornamentImages.map(waitForImage),
  ]);

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
