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
    // Fonts + images can shift pin math; refresh after first paint.
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
    });
  },
  { once: true }
);
