import * as THREE from "three";

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function shade(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  const t = (c: number) => Math.max(0, Math.min(255, Math.round(c + amt)));
  return `rgb(${t(r)}, ${t(g)}, ${t(b)})`;
}

export function makeDiamondTexture(hex: string) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const cx = 256;
  const top = 36;
  const bot = 476;
  const left = 118;
  const right = 394;
  const midY = 248;

  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(right, midY);
  ctx.lineTo(cx, bot);
  ctx.lineTo(left, midY);
  ctx.closePath();
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.strokeStyle = shade(hex, -48);
  ctx.lineWidth = 10;
  ctx.lineJoin = "miter";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, top + 22);
  ctx.lineTo(right - 28, midY);
  ctx.lineTo(cx, bot - 22);
  ctx.lineTo(left + 28, midY);
  ctx.closePath();
  ctx.strokeStyle = shade(hex, 70);
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 14, top + 48);
  ctx.lineTo(cx + 22, top + 108);
  ctx.lineTo(cx - 2, top + 118);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function makeScaleTexture(base = "#4db8a8") {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1.2 + Math.random() * 3.2;
    const roll = Math.random();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle =
      roll > 0.82
        ? "rgba(232,168,110,0.7)"
        : roll > 0.55
          ? "rgba(255,255,255,0.22)"
          : "rgba(20,50,48,0.22)";
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.needsUpdate = true;
  return tex;
}
