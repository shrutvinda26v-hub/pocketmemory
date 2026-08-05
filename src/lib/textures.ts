"use client";

import * as THREE from "three";

function canvasTexture(
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  size = 512
) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Warm washi / plaster grain for the wall */
export function createPaperTexture() {
  return canvasTexture((ctx, size) => {
    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 14000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const a = 0.015 + Math.random() * 0.04;
      ctx.fillStyle = `rgba(80,60,40,${a})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    // Soft fiber streaks
    for (let i = 0; i < 80; i++) {
      ctx.strokeStyle = `rgba(120,100,70,${0.02 + Math.random() * 0.03})`;
      ctx.beginPath();
      const y = Math.random() * size;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        size * 0.3,
        y + (Math.random() - 0.5) * 20,
        size * 0.7,
        y + (Math.random() - 0.5) * 20,
        size,
        y
      );
      ctx.stroke();
    }
  }, 1024);
}

/** Aged ceramic glaze */
export function createCeramicTexture() {
  return canvasTexture((ctx, size) => {
    const g = ctx.createRadialGradient(
      size * 0.4,
      size * 0.35,
      size * 0.1,
      size * 0.5,
      size * 0.5,
      size * 0.7
    );
    g.addColorStop(0, "#D4C8B4");
    g.addColorStop(0.55, "#C4B5A0");
    g.addColorStop(1, "#A89880");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 6000; i++) {
      ctx.fillStyle = `rgba(60,50,40,${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
    }
  });
}

/** Twisted bark with vertical furrows + moss flecks */
export function createBarkTexture() {
  return canvasTexture((ctx, size) => {
    const base = ctx.createLinearGradient(0, 0, size, 0);
    base.addColorStop(0, "#2E2118");
    base.addColorStop(0.35, "#463226");
    base.addColorStop(0.7, "#3A2A1E");
    base.addColorStop(1, "#2A1C14");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 2.5) {
      const wobble = Math.sin(x * 0.07) * 10 + Math.sin(x * 0.19) * 4;
      ctx.strokeStyle = `rgba(14,8,4,${0.3 + Math.random() * 0.4})`;
      ctx.lineWidth = 1 + Math.random() * 2.4;
      ctx.beginPath();
      ctx.moveTo(x + wobble, 0);
      for (let y = 0; y < size; y += 6) {
        ctx.lineTo(x + wobble + Math.sin(y * 0.045 + x * 0.02) * 3.5, y);
      }
      ctx.stroke();
    }
    // Lighter ridges
    for (let x = 4; x < size; x += 11) {
      ctx.strokeStyle = `rgba(110,85,60,${0.08 + Math.random() * 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y < size; y += 10) {
        ctx.lineTo(x + Math.sin(y * 0.03) * 2, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 520; i++) {
      ctx.fillStyle = `rgba(95,72,50,${0.06 + Math.random() * 0.14})`;
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * size,
        Math.random() * size,
        2 + Math.random() * 7,
        1 + Math.random() * 2.5,
        Math.random(),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Moss / lichen flecks
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(55,95,40,${0.12 + Math.random() * 0.22})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * size,
        Math.random() * size,
        1.5 + Math.random() * 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }, 1024);
}

/** Soft alpha needle card */
export function createNeedleTexture() {
  return canvasTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2 + Math.random() * 0.2;
      const len = size * (0.28 + Math.random() * 0.18);
      ctx.strokeStyle = `rgba(45,80,40,${0.45 + Math.random() * 0.4})`;
      ctx.lineWidth = 2 + Math.random() * 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
      ctx.stroke();
    }
    const core = ctx.createRadialGradient(cx, cy, 2, cx, cy, size * 0.18);
    core.addColorStop(0, "rgba(55,95,45,0.85)");
    core.addColorStop(1, "rgba(55,95,45,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }, 256);
}

/** Organic leaf albedo — neutral so instance colors tint seasons cleanly */
export function createLeafAlbedo() {
  return canvasTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const leaf = new Path2D();
    leaf.moveTo(cx, size * 0.92);
    leaf.bezierCurveTo(
      size * 0.62,
      size * 0.78,
      size * 0.88,
      size * 0.42,
      size * 0.72,
      size * 0.22
    );
    leaf.bezierCurveTo(size * 0.58, size * 0.08, size * 0.52, size * 0.04, cx, size * 0.04);
    leaf.bezierCurveTo(
      size * 0.48,
      size * 0.04,
      size * 0.42,
      size * 0.08,
      size * 0.28,
      size * 0.22
    );
    leaf.bezierCurveTo(
      size * 0.12,
      size * 0.42,
      size * 0.38,
      size * 0.78,
      cx,
      size * 0.92
    );
    leaf.closePath();

    const fill = ctx.createLinearGradient(cx, size * 0.05, cx, size * 0.9);
    fill.addColorStop(0, "#f2f5ef");
    fill.addColorStop(0.4, "#e4ebde");
    fill.addColorStop(0.75, "#d0dac8");
    fill.addColorStop(1, "#b8c4b0");
    ctx.fillStyle = fill;
    ctx.fill(leaf);

    ctx.strokeStyle = "rgba(40,55,30,0.28)";
    ctx.lineWidth = size * 0.016;
    ctx.beginPath();
    ctx.moveTo(cx, size * 0.88);
    ctx.quadraticCurveTo(cx + size * 0.01, size * 0.5, cx, size * 0.1);
    ctx.stroke();

    for (let i = 0; i < 7; i++) {
      const t = 0.2 + i * 0.09;
      const y = size * (0.85 - t * 0.7);
      const spread = size * (0.08 + t * 0.18);
      ctx.strokeStyle = `rgba(50,70,40,${0.1 + (1 - t) * 0.1})`;
      ctx.lineWidth = size * 0.007;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.quadraticCurveTo(cx + spread * 0.4, y - size * 0.04, cx + spread, y - size * 0.08);
      ctx.moveTo(cx, y);
      ctx.quadraticCurveTo(cx - spread * 0.4, y - size * 0.04, cx - spread, y - size * 0.08);
      ctx.stroke();
    }

    for (let i = 0; i < 280; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.2, 1.2);
    }
  }, 256);
}

export function createLeafAlpha() {
  return canvasTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const leaf = new Path2D();
    leaf.moveTo(cx, size * 0.92);
    leaf.bezierCurveTo(
      size * 0.62,
      size * 0.78,
      size * 0.88,
      size * 0.42,
      size * 0.72,
      size * 0.22
    );
    leaf.bezierCurveTo(size * 0.58, size * 0.08, size * 0.52, size * 0.04, cx, size * 0.04);
    leaf.bezierCurveTo(
      size * 0.48,
      size * 0.04,
      size * 0.42,
      size * 0.08,
      size * 0.28,
      size * 0.22
    );
    leaf.bezierCurveTo(
      size * 0.12,
      size * 0.42,
      size * 0.38,
      size * 0.78,
      cx,
      size * 0.92
    );
    leaf.closePath();

    // Soft feathered edge via blur-like radial falloff drawn solid then edge fade
    ctx.fillStyle = "#fff";
    ctx.fill(leaf);
    ctx.globalCompositeOperation = "destination-in";
    const soft = ctx.createRadialGradient(cx, size * 0.5, size * 0.12, cx, size * 0.5, size * 0.48);
    soft.addColorStop(0, "rgba(255,255,255,1)");
    soft.addColorStop(0.72, "rgba(255,255,255,1)");
    soft.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = soft;
    ctx.fillRect(0, 0, size, size);
  }, 256);
}

let cache: {
  paper?: THREE.Texture;
  ceramic?: THREE.Texture;
  bark?: THREE.Texture;
  needle?: THREE.Texture;
  leafAlbedo?: THREE.Texture;
  leafAlpha?: THREE.Texture;
} = {};

export function getTextures() {
  if (typeof document === "undefined") return cache;
  if (!cache.paper) cache.paper = createPaperTexture();
  if (!cache.ceramic) cache.ceramic = createCeramicTexture();
  if (!cache.bark) cache.bark = createBarkTexture();
  if (!cache.needle) cache.needle = createNeedleTexture();
  if (!cache.leafAlbedo) {
    cache.leafAlbedo = createLeafAlbedo();
    cache.leafAlbedo.wrapS = cache.leafAlbedo.wrapT = THREE.ClampToEdgeWrapping;
  }
  if (!cache.leafAlpha) {
    cache.leafAlpha = createLeafAlpha();
    cache.leafAlpha.wrapS = cache.leafAlpha.wrapT = THREE.ClampToEdgeWrapping;
  }
  return cache;
}
