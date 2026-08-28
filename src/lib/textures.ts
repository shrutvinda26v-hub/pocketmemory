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
  const top = 28;
  const bot = 484;
  const left = 96;
  const right = 416;
  const midY = 250;
  const girdleL = 118;
  const girdleR = 394;

  const k = shade(hex, -18);
  const mid = hex;
  const hi = shade(hex, 46);
  const edge = shade(hex, 90);

  const facet = (pts: [number, number][], fill: string) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  facet([[cx, top], [girdleR, midY], [cx, midY]], hi);
  facet([[cx, top], [cx, midY], [girdleL, midY]], mid);
  facet([[girdleL, midY], [left, midY], [cx, bot]], k);
  facet([[girdleR, midY], [cx, bot], [right, midY]], shade(hex, -40));
  facet([[cx, midY], [girdleR, midY], [cx, bot]], shade(hex, -8));
  facet([[cx, midY], [cx, bot], [girdleL, midY]], shade(hex, 12));

  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(right, midY);
  ctx.lineTo(cx, bot);
  ctx.lineTo(left, midY);
  ctx.closePath();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(girdleL, midY);
  ctx.lineTo(girdleR, midY);
  ctx.moveTo(cx, top);
  ctx.lineTo(cx, bot);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 18, top + 36);
  ctx.lineTo(cx + 8, top + 70);
  ctx.lineTo(cx - 6, top + 78);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
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
