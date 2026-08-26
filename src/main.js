import { WORLDS } from "./worlds.js";
import { ParticleField } from "./particles.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const studio = document.getElementById("studio");
const bookRig = document.getElementById("bookRig");
const bookShell = document.getElementById("bookShell");
const leftSheet = document.getElementById("leftSheet");
const underSheet = document.getElementById("underSheet");
const flipper = document.getElementById("flipper");
const flipFront = document.getElementById("flipFront");
const flipBack = document.getElementById("flipBack");
const leftLeaf = document.getElementById("leftLeaf");
const rightLeaf = document.getElementById("rightLeaf");
const fx = new ParticleField(document.getElementById("fx"));

let index = 0;
let busy = false;

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function worldAt(offset) {
  const count = WORLDS.length;
  return WORLDS[((offset % count) + count) % count];
}

function paintSheet(el, world, side) {
  el.style.backgroundImage = `url("${world.src}")`;
  el.style.backgroundPosition = side === "left" ? "left center" : "right center";
}

function render(current = index, next = index + 1) {
  const here = worldAt(current);
  const there = worldAt(next);
  paintSheet(leftSheet, here, "left");
  paintSheet(flipFront, here, "right");
  paintSheet(flipBack, there, "left");
  paintSheet(underSheet, there, "right");
  studio.dataset.world = here.id;
  fx.setTint(here.tint);
}

function burst(kind, side) {
  fx.burst(kind, fx.originFromBook(bookShell, side), 1.25);
}

async function turn(direction) {
  if (busy) return;
  busy = true;
  const goingForward = direction > 0;
  const from = worldAt(index);
  const nextIndex = index + direction;

  bookRig.classList.add("is-flipping");
  burst(from.kind, goingForward ? "right" : "left");

  if (goingForward) {
    render(index, nextIndex);
    await wait(40);
    flipper.classList.add("turn");
  } else {
    render(nextIndex, index);
    flipper.classList.add("snap", "backward");
    await wait(40);
    flipper.classList.remove("snap");
    await wait(40);
    flipper.classList.add("turn");
  }

  await wait(reduced ? 280 : 1600);
  index = ((nextIndex % WORLDS.length) + WORLDS.length) % WORLDS.length;
  render(index, index + 1);
  flipper.classList.add("snap");
  flipper.classList.remove("turn", "backward");
  await wait(30);
  flipper.classList.remove("snap");
  bookRig.classList.remove("is-flipping");
  busy = false;
}

function bindParallax() {
  if (reduced) return;
  window.addEventListener(
    "mousemove",
    (event) => {
      if (busy) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 6;
      const y = (event.clientY / window.innerHeight - 0.5) * -4;
      bookRig.style.setProperty("--tilt-x", `${18 + y}deg`);
      bookRig.style.setProperty("--tilt-y", `${-8 + x}deg`);
    },
    { passive: true },
  );
}

leftLeaf.addEventListener("click", (event) => {
  event.stopPropagation();
  turn(-1);
});
rightLeaf.addEventListener("click", (event) => {
  event.stopPropagation();
  turn(1);
});

bookShell.addEventListener("click", (event) => {
  if (busy) return;
  const rect = bookShell.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  if (x >= 0.5) turn(1);
  else turn(-1);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    turn(1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    turn(-1);
  }
});

for (const world of WORLDS) {
  const img = new Image();
  img.src = world.src;
}

render(0, 1);
studio.classList.add("is-ready");
bindParallax();
