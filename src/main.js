import gsap from "gsap";
import { startDust } from "./particles.js";
import { createChameleonScene } from "./chameleon3d.js";

const MATERIALS = [
  {
    id: "silk",
    name: "Ocean silk",
    glow: "#3a6ec8",
    file: "assets/swatch-silk.webp",
    x: 16,
    y: 20,
  },
  {
    id: "velvet",
    name: "Crimson velvet",
    glow: "#c41224",
    file: "assets/swatch-velvet.webp",
    x: 11,
    y: 50,
  },
  {
    id: "moss",
    name: "Forest moss",
    glow: "#4a8a28",
    file: "assets/swatch-moss.webp",
    x: 20,
    y: 78,
  },
  {
    id: "leather",
    name: "Amethyst leather",
    glow: "#8a3cb8",
    file: "assets/swatch-leather.webp",
    x: 84,
    y: 18,
  },
  {
    id: "gold",
    name: "Hammered gold",
    glow: "#d4a024",
    file: "assets/swatch-gold.webp",
    x: 90,
    y: 46,
  },
  {
    id: "terracotta",
    name: "Terracotta clay",
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
  const swatchRoot = document.querySelector("#swatches");
  const bootEl = document.querySelector("#boot");
  const hudMeta = document.querySelector("#hud-meta");
  const lede = document.querySelector("#lede");
  const hint = document.querySelector("#hint");
  const canvas = document.querySelector("#chameleon-3d");

  startDust(document.querySelector("#dust"));
  const scene = await createChameleonScene(canvas);
  if (reduceMotion) scene.controls.autoRotate = false;

  const buttons = mountSwatches(swatchRoot);
  const uniforms = scene.uniforms;

  let activeId = null;
  let incoming = null;
  let tween = null;
  const wave = { p: 1 };

  const applyMaterial = (material) => {
    if (activeId === material.id && wave.p >= 1) return;
    activeId = material.id;

    for (const button of buttons) {
      button.classList.toggle("is-active", button.dataset.id === material.id);
    }

    hudMeta.textContent = material.name.toUpperCase();
    lede.textContent = `${material.name} moves from the casque, across the scales, and down the tail.`;
    hint.textContent = "COLOUR IN MOTION";

    if (tween) tween.kill();
    if (incoming) {
      uniforms.uFrom.value.set(incoming);
      uniforms.uFromAmt.value = 1;
    }

    incoming = material.glow;
    uniforms.uTo.value.set(material.glow);
    uniforms.uToAmt.value = 1;
    wave.p = 0;
    uniforms.uProgress.value = 0;

    tween = gsap.to(wave, {
      p: 1,
      duration: reduceMotion ? 0.9 : 2.6,
      ease: "none",
      onUpdate: () => {
        uniforms.uProgress.value = wave.p;
      },
      onComplete: () => {
        uniforms.uProgress.value = 1;
        uniforms.uFrom.value.copy(uniforms.uTo.value);
        uniforms.uFromAmt.value = 1;
        incoming = null;
        hint.textContent = "DRAG TO TURN · CLICK ANOTHER";
      },
    });
  };

  for (const button of buttons) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const material = MATERIALS.find((item) => item.id === button.dataset.id);
      applyMaterial(material);
    });
  }

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
  if (hint) hint.textContent = "UNABLE TO LOAD 3D SCENE";
});
