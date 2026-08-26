import { WORLDS } from "./worlds.js";
import { ParticleField } from "./particles.js";
import { playMoment } from "./atmosphere.js";

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
let lastPointer = { x: window.innerWidth * 0.72, y: window.innerHeight * 0.55 };

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const SPREADS = [
  [WORLDS[0], WORLDS[1]],
  [WORLDS[2], WORLDS[3]],
  [WORLDS[4], WORLDS[5]],
];

function wrap(offset) {
  const count = SPREADS.length;
  return ((offset % count) + count) % count;
}

function glow(hex, alpha = 0.2) {
  const n = hex.replace("#", "");
  const v = parseInt(n, 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
}

function paintSheet(el, world) {
  el.style.backgroundImage = `url("${world.src}")`;
  el.style.backgroundPosition = "center";
}

function applySpread(left, right) {
  studio.dataset.world = left.id;
  studio.dataset.left = left.id;
  studio.dataset.right = right.id;
  studio.style.setProperty("--glow-left", glow(left.tint, 0.22));
  studio.style.setProperty("--glow-right", glow(right.tint, 0.22));

  for (const realm of document.querySelectorAll(".realm")) {
    realm.classList.toggle("is-left", realm.classList.contains(`realm-${left.id}`));
    realm.classList.toggle("is-right", realm.classList.contains(`realm-${right.id}`));
  }

  fx.setSpread(left.id, left.tint, right.id, right.tint);
}

function render(current = index, next = index + 1) {
  const [left, right] = SPREADS[wrap(current)];
  const [nextLeft, nextRight] = SPREADS[wrap(next)];
  paintSheet(leftSheet, left);
  paintSheet(flipFront, right);
  paintSheet(flipBack, nextLeft);
  paintSheet(underSheet, nextRight);
  applySpread(left, right);
}

function burst(kind, side) {
  fx.burst(kind, fx.originFromBook(bookShell, side), 1.25);
}

function momentOrigin(side) {
  const fromBook = fx.originFromBook(bookShell, side);
  if (Math.hypot(lastPointer.x - fromBook.x, lastPointer.y - fromBook.y) < 280) {
    return lastPointer;
  }
  return fromBook;
}

async function turn(direction) {
  if (busy) return;
  busy = true;
  const goingForward = direction > 0;
  const [left, right] = SPREADS[wrap(index)];
  const from = goingForward ? right : left;
  const nextIndex = index + direction;
  const [nextLeft, nextRight] = SPREADS[wrap(nextIndex)];
  const side = goingForward ? "right" : "left";

  bookRig.classList.add("is-flipping");
  burst(from.kind, side);
  if (!reduced) playMoment(from.id, momentOrigin(side));

  if (goingForward) {
    render(index, nextIndex);
    await wait(40);
    flipper.classList.add("turn");
  } else {
    render(nextIndex, index);
    applySpread(left, right);
    flipper.classList.add("snap", "backward");
    await wait(40);
    flipper.classList.remove("snap");
    await wait(40);
    flipper.classList.add("turn");
  }

  await wait(reduced ? 140 : 820);
  applySpread(nextLeft, nextRight);

  await wait(reduced ? 140 : 780);
  index = wrap(nextIndex);
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
      bookRig.style.setProperty("--tilt-x", `${14 + y}deg`);
      bookRig.style.setProperty("--tilt-y", `${-6 + x}deg`);
    },
    { passive: true },
  );
}

window.addEventListener(
  "pointerdown",
  (event) => {
    lastPointer = { x: event.clientX, y: event.clientY };
  },
  { passive: true },
);

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
