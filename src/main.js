import gsap from "gsap";
import { createChameleon } from "./chameleonRenderer.js";
import { startDust } from "./particles.js";

const MATERIALS = [
  {
    id: "silk",
    name: "Ocean silk",
    color: [0.14, 0.38, 0.78],
    glow: "#3a6ec8",
    file: "assets/swatch-silk.webp",
    x: 16,
    y: 20,
  },
  {
    id: "velvet",
    name: "Crimson velvet",
    color: [0.82, 0.07, 0.14],
    glow: "#c41224",
    file: "assets/swatch-velvet.webp",
    x: 11,
    y: 50,
  },
  {
    id: "moss",
    name: "Forest moss",
    color: [0.28, 0.55, 0.18],
    glow: "#4a8a28",
    file: "assets/swatch-moss.webp",
    x: 20,
    y: 78,
  },
  {
    id: "leather",
    name: "Amethyst leather",
    color: [0.52, 0.18, 0.72],
    glow: "#8a3cb8",
    file: "assets/swatch-leather.webp",
    x: 84,
    y: 18,
  },
  {
    id: "gold",
    name: "Hammered gold",
    color: [0.86, 0.64, 0.16],
    glow: "#d4a024",
    file: "assets/swatch-gold.webp",
    x: 90,
    y: 46,
  },
  {
    id: "terracotta",
    name: "Terracotta clay",
    color: [0.82, 0.36, 0.16],
    glow: "#d45a28",
    file: "assets/swatch-terracotta.webp",
    x: 80,
    y: 76,
  },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function mountSwatches(root) {
  const buttons = [];
  for (const material of MATERIALS) {
    const button = document.createElement("button");
    button.className = "swatch";
    button.type = "button";
    button.dataset.id = material.id;
    button.style.left = `${material.x}%`;
    button.style.top = `${material.y}%`;
    button.style.setProperty("--glow", material.glow);
    button.setAttribute("aria-label", `Change chameleon to ${material.name}`);
    button.innerHTML = `
      <img src="${material.file}" alt="" draggable="false" />
      <span class="swatch-label">${material.name}</span>
    `;
    root.appendChild(button);
    buttons.push(button);

    if (!reduceMotion) {
      gsap.to(button, {
        y: "+=10",
        duration: 2.6 + Math.random() * 1.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: Math.random() * 1.2,
      });
    }
  }
  return buttons;
}

async function boot() {
  const canvas = document.querySelector("#chameleon");
  const swatchRoot = document.querySelector("#swatches");
  const bootEl = document.querySelector("#boot");
  const hudMeta = document.querySelector("#hud-meta");
  const lede = document.querySelector("#lede");
  const hint = document.querySelector("#hint");
  const specimen = document.querySelector("#specimen");

  startDust(document.querySelector("#dust"));
  const chameleon = await createChameleon(canvas, "assets/chameleon.webp");
  const buttons = mountSwatches(swatchRoot);

  let activeId = null;
  let tween = null;
  let drawing = false;

  const loop = () => {
    chameleon.draw();
    if (drawing) requestAnimationFrame(loop);
  };

  const startDraw = () => {
    if (drawing) return;
    drawing = true;
    requestAnimationFrame(loop);
  };

  const stopDraw = () => {
    drawing = false;
    chameleon.draw();
  };

  const applyMaterial = (material) => {
    if (activeId === material.id && chameleon.state.progress >= 1) return;
    activeId = material.id;

    for (const button of buttons) {
      button.classList.toggle("is-active", button.dataset.id === material.id);
    }

    hudMeta.textContent = material.name.toUpperCase();
    lede.textContent = `${material.name} moves from the casque, across the scales, and down to the tail.`;
    hint.textContent = "COLOUR IN MOTION";

    if (tween) tween.kill();

    const previous = {
      color: chameleon.state.to.slice(),
      amt: chameleon.state.toAmt,
    };

    chameleon.state.from = previous.color;
    chameleon.state.fromAmt = previous.amt;
    chameleon.state.to = material.color.slice();
    chameleon.state.toAmt = 1;
    chameleon.state.progress = 0;

    const duration = reduceMotion ? 0.01 : 1.85;
    startDraw();
    tween = gsap.to(chameleon.state, {
      progress: 1,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        if (reduceMotion) chameleon.draw();
      },
      onComplete: () => {
        hint.textContent = "CLICK ANOTHER MATERIAL";
        stopDraw();
      },
    });

    if (!reduceMotion) {
      gsap.fromTo(
        specimen,
        { scale: 1 },
        { scale: 1.012, duration: 0.45, yoyo: true, repeat: 1, ease: "sine.inOut" }
      );
    }
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const material = MATERIALS.find((item) => item.id === button.dataset.id);
      applyMaterial(material);
    });
  }

  window.addEventListener("resize", () => chameleon.draw());

  gsap.to(bootEl, {
    opacity: 0,
    duration: reduceMotion ? 0.2 : 0.9,
    delay: reduceMotion ? 0 : 0.45,
    ease: "power2.out",
    onComplete: () => bootEl.remove(),
  });

  if (!reduceMotion) {
    gsap.from(".copy", { opacity: 0, y: 16, duration: 1.1, delay: 0.7, ease: "power3.out" });
    gsap.from(".hud", { opacity: 0, duration: 1, delay: 0.5 });
    gsap.from(".swatch", {
      opacity: 0,
      scale: 0.86,
      duration: 0.9,
      delay: 0.85,
      stagger: 0.06,
      ease: "power3.out",
    });
  }
}

boot().catch((error) => {
  console.error(error);
  const hint = document.querySelector("#hint");
  if (hint) hint.textContent = "UNABLE TO LOAD SCENE";
});
