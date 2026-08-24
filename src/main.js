import { ScrollTrigger } from "gsap/ScrollTrigger";
import { pieceCount } from "./composition.js";
import { buildExperience, mountOrnaments } from "./timeline.js";

const boot = document.querySelector("#boot");
const ornamentsRoot = document.querySelector("#ornaments");
const sheep = document.querySelector("#sheep");

const pieces = mountOrnaments(ornamentsRoot);
document.title = `SPECIMEN 001 — ${pieceCount()} layers`;

function ready() {
  buildExperience(pieces);
  requestAnimationFrame(() => {
    boot.classList.add("is-done");
  });
}

if (sheep.complete) {
  ready();
} else {
  sheep.addEventListener("load", ready, { once: true });
  sheep.addEventListener("error", ready, { once: true });
}

window.addEventListener(
  "load",
  () => {
    ScrollTrigger.refresh();
  },
  { once: true }
);
