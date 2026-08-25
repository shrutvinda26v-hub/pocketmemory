import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { getPieces } from "./composition.js";

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.config({ force3D: false, nullTargetWarn: false });

const DUSTY = "#8796a6";
const MIDNIGHT = "#152038";

function travelScale() {
  const mobile = window.innerWidth < 721;
  const base = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
  const k = Math.max(0.72, Math.min(1.18, base * 1.15));
  return (mobile ? 0.52 : 1) * k;
}

export function mountOrnaments(root) {
  const pieces = getPieces();
  const frag = document.createDocumentFragment();

  pieces.forEach((p, i) => {
    const el = document.createElement("div");
    el.className = "ornament";
    el.dataset.id = p.id;
    el.dataset.group = p.group;
    el.dataset.weight = p.weight;
    el.dataset.kind = p.kind;
    el.style.setProperty("--x", `${p.x}%`);
    el.style.setProperty("--y", `${p.y}%`);
    el.style.setProperty("--w", `${p.w}%`);
    el.style.zIndex = String(p.z);
    el.style.setProperty("--i", String(i));

    const inner = document.createElement("div");
    inner.className = "ornament-inner";
    inner.style.animationDelay = `${-((i * 37) % 480) / 100}s`;

    if (p.kind === "img") {
      const img = document.createElement("img");
      img.src = p.src;
      img.alt = "";
      img.decoding = "async";
      inner.appendChild(img);
    } else {
      inner.innerHTML = p.html;
    }

    el.appendChild(inner);
    frag.appendChild(el);
    p.el = el;
  });

  root.appendChild(frag);
  return pieces;
}

export function buildExperience(pieces) {
  const pin = document.querySelector("#pin");
  const experience = document.querySelector("#experience");
  const shockwave = document.querySelector("#shockwave");
  const hint = document.querySelector("#hint");
  const copy = document.querySelector("#copy");
  const lineA = document.querySelector("#line-a");
  const lineB = document.querySelector("#line-b");
  const progressFill = document.querySelector("#progress-fill");
  const readout = document.querySelector("#progress-readout");
  const hudLeft = document.querySelector(".hud-left");
  const hudRight = document.querySelector(".hud-right");

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 721px)",
      isMobile: "(max-width: 720px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { reduceMotion } = context.conditions;
      const k = travelScale();
      const split = SplitText.create(lineA, { type: "words", wordsClass: "word" });

      pieces.forEach((p) => {
        gsap.set(p.el, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          rotation: p.rot,
          scale: p.scale,
          scaleX: p.scaleX,
          opacity: p.opacity,
          force3D: false,
        });
      });

      gsap.set(copy, { autoAlpha: 0 });
      gsap.set(lineB, { autoAlpha: 0, y: 18 });
      gsap.set(split.words, { autoAlpha: 0, y: 12 });
      gsap.set(shockwave, { opacity: 0, scale: 0.35 });
      gsap.set(pin, { backgroundColor: DUSTY });
      document.documentElement.style.setProperty("--idle", "1");
      document.documentElement.style.setProperty("--gem-glow", "0");
      document.documentElement.style.setProperty("--bg", DUSTY);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: experience,
          start: "top top",
          end: "bottom bottom",
          pin,
          pinSpacing: false,
          scrub: reduceMotion ? true : 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            progressFill.style.height = `${p * 100}%`;
            readout.textContent = String(Math.round(p * 100)).padStart(2, "0");
            const v = Math.abs(self.getVelocity());
            const blur = v > 1400 ? Math.min(1.8, (v - 1400) / 2200) : 0;
            document.documentElement.style.setProperty("--velocity-blur", `${blur}px`);
          },
        },
      });

      // Conceptual 100-unit timeline == 0–100% scroll.
      tl.to({}, { duration: 100 }, 0);

      // 0–5 idle stays on; 5–10 freeze.
      tl.set(document.documentElement, { "--idle": 1 }, 0);
      tl.to(document.documentElement, { "--idle": 1, duration: 5, ease: "none" }, 0);
      tl.to(document.documentElement, { "--idle": 0, duration: 4.5, ease: "sine.inOut" }, 5.2);
      tl.to(hint, { autoAlpha: 0, y: 8, duration: 6, ease: "power1.out" }, 3);
      tl.to([hudLeft, hudRight], { autoAlpha: 0.35, duration: 8, ease: "none" }, 0);

      // Per-object depart / shockwave / return.
      pieces.forEach((p) => {
        const start = p.departStart * 100;
        const end = p.departEnd * 100;
        const dur = Math.max(0.8, end - start);
        const easeOut = p.weight === "heavy" ? "power2.inOut" : p.weight === "light" ? "power1.inOut" : "power2.inOut";

        if (p.crack) {
          tl.fromTo(
            p.el,
            { x: 0, y: 0, rotation: p.rot, scale: p.scale },
            {
              x: () => p.ex * k * 0.06,
              y: () => p.ey * k * 0.06,
              rotation: p.rot + p.er * 0.25,
              duration: Math.min(5, dur * 0.4),
              ease: "sine.inOut",
              immediateRender: false,
              force3D: false,
            },
            start
          );
        }

        tl.to(
          p.el,
          {
            x: () => p.ex * k,
            y: () => p.ey * k,
            rotation: p.rot + p.er,
            scale: p.scale * p.es,
            scaleX: p.scaleX,
            opacity: p.eo,
            duration: dur,
            ease: easeOut,
            immediateRender: false,
            force3D: false,
          },
          p.crack ? start + 4.5 : start
        );

        if (p.shock) {
          tl.to(
            p.el,
            {
              x: () => p.ex * k * 1.72,
              y: () => p.ey * k * 1.72,
              scale: p.scale * p.es * 1.04,
              duration: 5.5,
              ease: "power2.in",
              immediateRender: false,
              force3D: false,
            },
            42.2
          );
          tl.to(
            p.el,
            {
              x: () => p.ex * k,
              y: () => p.ey * k,
              scale: p.scale * p.es,
              rotation: p.rot + p.er,
              duration: 7,
              ease: "power3.out",
              immediateRender: false,
              force3D: false,
            },
            48
          );
        }

        const rStart = p.returnStart * 100;
        const rDur = Math.max(1.2, (p.returnEnd - p.returnStart) * 100);
        const returnEase =
          p.group === "chest" ? "power3.inOut" : p.weight === "light" ? "power2.inOut" : "power3.inOut";

        tl.to(
          p.el,
          {
            x: 0,
            y: 0,
            rotation: p.rot,
            scale: p.scale,
            scaleX: p.scaleX,
            opacity: p.opacity,
            duration: rDur,
            ease: returnEase,
            immediateRender: false,
            force3D: false,
          },
          rStart
        );

        if (p.group === "chest") {
          tl.to(
            p.el,
            {
              scale: p.scale * 0.97,
              rotation: p.rot,
              duration: 1.4,
              ease: "sine.inOut",
              immediateRender: false,
              force3D: false,
            },
            97.8
          );
          tl.to(
            p.el,
            {
              scale: p.scale,
              duration: 1.2,
              ease: "power2.out",
              immediateRender: false,
              force3D: false,
            },
            99.2
          );
        }
      });

      // 42–48 shockwave overlay + brief brightness.
      tl.fromTo(
        shockwave,
        { opacity: 0, scale: 0.35 },
        { opacity: 0.9, scale: 1.15, duration: 3.2, ease: "power2.out" },
        42.4
      );
      tl.to(shockwave, { opacity: 0, scale: 1.85, duration: 5.5, ease: "power2.inOut" }, 45.8);
      tl.fromTo(
        pin,
        { filter: "brightness(1)" },
        { filter: "brightness(1.12)", duration: 3, ease: "sine.out", immediateRender: false },
        42.5
      );
      tl.to(pin, { filter: "brightness(1)", duration: 5, ease: "sine.inOut" }, 46.5);

      // 67–72 background → midnight. Jewelry more luminous.
      tl.to(pin, { backgroundColor: MIDNIGHT, duration: 5, ease: "none" }, 67);
      tl.to(document.documentElement, { "--bg": MIDNIGHT, "--gem-glow": 1, duration: 5, ease: "none" }, 67);
      tl.to(".atmosphere", { opacity: 0.55, duration: 5, ease: "none" }, 67);

      // 72–78 typography.
      tl.to(copy, { autoAlpha: 1, duration: 2.2, ease: "power1.out" }, 72);
      split.words.forEach((word, i) => {
        tl.to(
          word,
          { autoAlpha: 1, y: 0, duration: 1.15, ease: "power2.out" },
          72.4 + i * 1.05
        );
      });
      tl.to(lineA, { scale: 0.78, y: -36, duration: 3.2, ease: "power2.inOut" }, 76.4);
      tl.to(lineB, { autoAlpha: 1, y: 0, duration: 2.6, ease: "power2.out" }, 76.6);
      tl.fromTo(
        lineB.querySelector("em"),
        { scale: 0.84 },
        { scale: 1, duration: 2.8, ease: "power2.out", immediateRender: false },
        77
      );

      // 78–83 suspended micro-motion.
      tl.to(document.documentElement, { "--idle": 0.42, duration: 4.5, ease: "sine.inOut" }, 78.2);

      // Reconstruction freeze of idle, type fades as sheep rebuilds.
      tl.to(document.documentElement, { "--idle": 0, duration: 3.5, ease: "sine.inOut" }, 83);
      tl.to(copy, { autoAlpha: 0, y: -12, duration: 5, ease: "power1.inOut" }, 92);
      tl.to(lineB, { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, 92);

      // Background returns with the last jewel.
      tl.to(pin, { backgroundColor: DUSTY, duration: 3.2, ease: "none" }, 96.2);
      tl.to(document.documentElement, { "--bg": DUSTY, "--gem-glow": 0, duration: 3.2, ease: "none" }, 96.2);
      tl.to(".atmosphere", { opacity: 1, duration: 3.2, ease: "none" }, 96.2);
      tl.to([hudLeft, hudRight], { autoAlpha: 0.55, duration: 2.5, ease: "none" }, 97.5);
      tl.to(hint, { autoAlpha: 0.4, y: 0, duration: 2, ease: "none" }, 98.4);

      return () => {
        split.revert();
      };
    }
  );

  return mm;
}
