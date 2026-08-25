import {
  svgChainLink,
  svgDiamond,
  svgFlower,
  svgGem,
  svgGold,
  svgLeaf,
  svgPearl,
  svgPetal,
} from "./svg.js";

/**
 * Art-directed 2D layer catalog.
 * Positions are % of the specimen box (sheep cutout).
 * Explode offsets are pixels at a 1440×900 reference, scaled at runtime.
 * No Math.random() — every destination is intentional.
 */

const GROUPS = {
  "diamond-tiny": { depart: [0.105, 0.195], ret: [0.83, 0.885], dist: 360, rot: 11, weight: "light" },
  "pearl-tiny": { depart: [0.12, 0.205], ret: [0.835, 0.89], dist: 320, rot: 8, weight: "light" },
  "petal": { depart: [0.14, 0.22], ret: [0.84, 0.9], dist: 300, rot: 13, weight: "light" },
  leaf: { depart: [0.155, 0.235], ret: [0.845, 0.905], dist: 270, rot: 10, weight: "light" },
  "gold-small": { depart: [0.16, 0.245], ret: [0.85, 0.91], dist: 250, rot: 8, weight: "light" },
  "gem-small": { depart: [0.185, 0.275], ret: [0.855, 0.915], dist: 230, rot: 5, weight: "medium" },
  "flower-med": { depart: [0.205, 0.325], ret: [0.86, 0.925], dist: 210, rot: 8, weight: "medium" },
  "gem-med": { depart: [0.22, 0.345], ret: [0.865, 0.93], dist: 200, rot: 4, weight: "medium" },
  chain: { depart: [0.235, 0.365], ret: [0.87, 0.94], dist: 200, rot: 5, weight: "medium" },
  hanging: { depart: [0.25, 0.38], ret: [0.875, 0.948], dist: 230, rot: 6, weight: "medium" },
  "flower-large": { depart: [0.285, 0.48], ret: [0.882, 0.952], dist: 200, rot: 7, weight: "heavy" },
  crown: { depart: [0.275, 0.58], ret: [0.9, 0.962], dist: 270, rot: 3, weight: "heavy" },
  "gem-major": { depart: [0.3, 0.56], ret: [0.91, 0.972], dist: 250, rot: 3, weight: "heavy" },
  chest: { depart: [0.545, 0.62], ret: [0.962, 0.995], dist: 300, rot: 2, weight: "heavy" },
};

const RUBY = "#9a1c32";
const EMERALD = "#1f7a4d";
const SAPPHIRE = "#1c4ea3";
const PINK = "#e8a0b5";
const BLUSH = "#f3c4c8";

let seq = 0;
const pieces = [];

function fromOrigin(x, y, dist, i) {
  const dx = x - 50;
  const dy = y - 48;
  const len = Math.hypot(dx, dy) || 1;
  const nx = dx / len;
  const ny = dy / len;
  const tangent = ((i * 13) % 11) - 5;
  return {
    ex: nx * dist + -ny * tangent * 5,
    ey: ny * dist + nx * tangent * 5,
  };
}

function add(p) {
  seq += 1;
  const g = GROUPS[p.group];
  const dist = p.dist ?? g.dist;
  const ev = p.ex != null ? { ex: p.ex, ey: p.ey } : fromOrigin(p.x, p.y, dist, seq);
  const er =
    p.er ??
    ((((seq * 17) % 15) - 7) * (g.rot / 7));
  pieces.push({
    id: p.id || `${p.group}-${seq}`,
    kind: p.kind,
    html: p.html,
    src: p.src,
    x: p.x,
    y: p.y,
    w: p.w,
    rot: p.rot ?? 0,
    scale: p.scale ?? 1,
    scaleX: p.flip ? -1 : 1,
    opacity: p.opacity ?? 1,
    z: p.z ?? 40,
    group: p.group,
    weight: p.weight ?? g.weight,
    ...ev,
    er,
    es: p.es ?? (g.weight === "light" ? 1.08 : g.weight === "heavy" ? 1.03 : 1.05),
    eo: p.eo ?? 1,
    departStart: p.departStart ?? g.depart[0],
    departEnd: p.departEnd ?? g.depart[1],
    returnStart: p.returnStart ?? g.ret[0],
    returnEnd: p.returnEnd ?? g.ret[1],
    shock: p.shock !== false && (p.departStart ?? g.depart[0]) < 0.42,
    crack: !!p.crack,
  });
}

function img(src, extra) {
  add({ kind: "img", src: `${import.meta.env.BASE_URL}assets/${src}`, ...extra });
}

function svg(kind, html, extra) {
  add({ kind, html, ...extra });
}

/* -------------------------------------------------------------------------- */
/*  HERO RASTERS — the jewels and flowers that make the assembled photograph   */
/* -------------------------------------------------------------------------- */

img("jewel-crown.webp", {
  id: "crown",
  group: "crown",
  x: 50,
  y: 17.6,
  w: 34,
  rot: -1,
  z: 58,
  ex: 6,
  ey: -290,
  er: -4,
  es: 1.04,
});

img("jewel-ruby.webp", {
  id: "ruby-forehead",
  group: "gem-major",
  x: 50.2,
  y: 21.4,
  w: 11.5,
  rot: 4,
  z: 62,
  ex: 18,
  ey: -320,
  er: 6,
  departStart: 0.285,
  departEnd: 0.55,
});

img("jewel-sapphire.webp", {
  id: "chest-sapphire",
  group: "chest",
  x: 50,
  y: 43.5,
  w: 17.5,
  rot: -3,
  z: 72,
  ex: 4,
  ey: 340,
  er: 3,
  es: 1.02,
  shock: false,
});

img("jewel-emerald.webp", {
  id: "emerald-left",
  group: "gem-major",
  x: 24.5,
  y: 48,
  w: 13,
  rot: -18,
  z: 52,
  ex: -310,
  ey: -36,
  er: -8,
});

img("jewel-emerald.webp", {
  id: "emerald-right",
  group: "gem-major",
  x: 75.8,
  y: 47.2,
  w: 12.4,
  rot: 16,
  z: 52,
  flip: true,
  ex: 318,
  ey: -28,
  er: 9,
});

img("jewel-yellow.webp", {
  id: "yellow-right",
  group: "gem-major",
  x: 67.5,
  y: 40.5,
  w: 10.5,
  rot: 12,
  z: 56,
  ex: 280,
  ey: -90,
  er: 5,
});

img("jewel-ruby.webp", {
  id: "ruby-left-body",
  group: "gem-med",
  x: 32.5,
  y: 58.5,
  w: 8.4,
  rot: -22,
  z: 48,
  ex: -240,
  ey: 160,
  er: -7,
});

img("jewel-earring.webp", {
  id: "earring-left",
  group: "hanging",
  x: 21.8,
  y: 32.5,
  w: 6.6,
  rot: -8,
  z: 64,
  ex: -270,
  ey: 70,
  er: -11,
});

img("jewel-earring.webp", {
  id: "earring-right",
  group: "hanging",
  x: 78.4,
  y: 32.2,
  w: 6.6,
  rot: 8,
  z: 64,
  flip: true,
  ex: 276,
  ey: 64,
  er: 10,
});

img("jewel-chain.webp", {
  id: "chain-photo-a",
  group: "chain",
  x: 50,
  y: 39.2,
  w: 46,
  rot: 2,
  z: 18,
  ex: 20,
  ey: 210,
  er: 4,
});

img("jewel-chain.webp", {
  id: "chain-photo-b",
  group: "chain",
  x: 49.5,
  y: 42.8,
  w: 38,
  rot: -6,
  z: 16,
  ex: -30,
  ey: 250,
  er: -5,
});

img("jewel-pearls.webp", {
  id: "pearls-neck",
  group: "pearl-tiny",
  x: 50,
  y: 36.8,
  w: 22,
  rot: 8,
  z: 34,
  ex: -40,
  ey: -80,
  er: -6,
  departStart: 0.13,
  departEnd: 0.3,
});

img("jewel-diamonds.webp", {
  id: "diamonds-chest-cluster",
  group: "diamond-tiny",
  x: 58,
  y: 51.5,
  w: 14,
  rot: 14,
  z: 36,
  ex: 200,
  ey: 40,
  crack: true,
  departStart: 0.102,
  departEnd: 0.2,
});

img("jewel-goldframe.webp", {
  id: "frame-left",
  group: "gold-small",
  x: 27.5,
  y: 56,
  w: 10,
  rot: -16,
  z: 14,
  ex: -300,
  ey: 90,
  er: -9,
});

img("jewel-goldframe.webp", {
  id: "frame-right",
  group: "gold-small",
  x: 73.5,
  y: 54.5,
  w: 9.4,
  rot: 18,
  z: 14,
  flip: true,
  ex: 308,
  ey: 70,
  er: 8,
});

img("flower-peony.webp", {
  id: "peony-tl",
  group: "flower-large",
  x: 27,
  y: 22.5,
  w: 16.5,
  rot: -18,
  z: 46,
  ex: -210,
  ey: -250,
  er: -12,
});

img("flower-peony.webp", {
  id: "peony-br",
  group: "flower-large",
  x: 74,
  y: 63,
  w: 15,
  rot: 22,
  z: 28,
  ex: 230,
  ey: 210,
  er: 10,
});

img("flower-rose.webp", {
  id: "rose-tr",
  group: "flower-large",
  x: 73.5,
  y: 21,
  w: 14,
  rot: 14,
  z: 45,
  ex: 220,
  ey: -260,
  er: 9,
});

img("flower-rose.webp", {
  id: "rose-bl",
  group: "flower-med",
  x: 26.5,
  y: 66,
  w: 12.5,
  rot: -24,
  z: 26,
  ex: -220,
  ey: 230,
  er: -11,
});

img("flower-hydrangea.webp", {
  id: "hydrangea-left",
  group: "flower-med",
  x: 23.5,
  y: 42,
  w: 12,
  rot: -8,
  z: 32,
  ex: -280,
  ey: -40,
  er: -7,
});

img("flower-hydrangea.webp", {
  id: "hydrangea-right",
  group: "flower-med",
  x: 76.5,
  y: 41,
  w: 11.4,
  rot: 12,
  z: 32,
  flip: true,
  ex: 286,
  ey: -30,
  er: 8,
});

img("flower-ranunculus.webp", {
  id: "ranunculus-crown-l",
  group: "flower-med",
  x: 36.5,
  y: 16.8,
  w: 9.5,
  rot: -22,
  z: 50,
  ex: -120,
  ey: -280,
  er: -8,
});

img("flower-ranunculus.webp", {
  id: "ranunculus-hip",
  group: "flower-med",
  x: 62.5,
  y: 68.5,
  w: 9,
  rot: 18,
  z: 24,
  ex: 160,
  ey: 250,
  er: 7,
});

img("leaf-green.webp", {
  id: "leaf-photo-a",
  group: "leaf",
  x: 22,
  y: 28.5,
  w: 10,
  rot: -40,
  z: 22,
  ex: -250,
  ey: -160,
});

img("leaf-green.webp", {
  id: "leaf-photo-b",
  group: "leaf",
  x: 79,
  y: 60,
  w: 9.2,
  rot: 50,
  z: 12,
  flip: true,
  ex: 260,
  ey: 150,
});

img("leaf-green.webp", {
  id: "leaf-photo-c",
  group: "leaf",
  x: 33,
  y: 72,
  w: 8.4,
  rot: -12,
  z: 11,
  ex: -140,
  ey: 260,
});

/* -------------------------------------------------------------------------- */
/*  SVG MICRO-PAVÉ — diamonds that begin the first crack                       */
/* -------------------------------------------------------------------------- */

const paveLoci = [
  [38, 49],
  [62, 49.5],
  [44.5, 41],
  [55.5, 40.8],
  [50, 61],
  [34, 56],
  [66.5, 55.5],
  [41, 67],
  [59, 67.2],
  [46.5, 29.5],
  [53.8, 29.2],
  [29, 45],
  [71, 44.5],
  [48, 74],
  [54, 73.5],
];

paveLoci.forEach((c, ci) => {
  for (let i = 0; i < 3; i += 1) {
    const ang = i * 2.15 + ci * 0.63;
    const rad = 1.7 + (i % 3) * 1.05;
    const x = c[0] + Math.cos(ang) * rad;
    const y = c[1] + Math.sin(ang) * rad * 0.85;
    const n = seq + 1;
    svg("svg-gem", svgDiamond(`d${n}`), {
      group: "diamond-tiny",
      x,
      y,
      w: 1.55 + (i % 3) * 0.45,
      z: 38 + (i % 2) * 6,
      rot: ((ci * 11 + i * 29) % 40) - 20,
      crack: ci === 0 && i === 0,
      departStart: ci === 0 && i === 0 ? 0.1 : undefined,
      departEnd: ci === 0 && i === 0 ? 0.155 : undefined,
    });
  }
});

/* Tiny diamonds that live on the wool and travel to the poster edges. */
const edgeDiamonds = [
  { x: 43, y: 47, w: 2.1, ex: -390, ey: -300, z: 76 },
  { x: 57, y: 46.5, w: 1.8, ex: 400, ey: -310, z: 76 },
  { x: 36, y: 54, w: 1.7, ex: -420, ey: 80, z: 6 },
  { x: 64, y: 53, w: 2.0, ex: 430, ey: 40, z: 76 },
  { x: 41, y: 66, w: 1.6, ex: -340, ey: 330, z: 6 },
  { x: 60, y: 66.5, w: 1.9, ex: 350, ey: 340, z: 76 },
  { x: 32, y: 48, w: 1.5, ex: -440, ey: -40, z: 6 },
  { x: 68, y: 47.5, w: 1.6, ex: 450, ey: -50, z: 76 },
  { x: 47, y: 32, w: 1.4, ex: -80, ey: -380, z: 8 },
  { x: 54, y: 31.5, w: 1.5, ex: 90, ey: -390, z: 8 },
  { x: 50, y: 70, w: 1.7, ex: 10, ey: 380, z: 7 },
  { x: 39, y: 33, w: 1.3, ex: -220, ey: -360, z: 8 },
];
edgeDiamonds.forEach((d, i) => {
  svg("svg-gem", svgDiamond(`de${i}`), {
    group: "diamond-tiny",
    x: d.x,
    y: d.y,
    w: d.w,
    z: d.z,
    ex: d.ex,
    ey: d.ey,
    rot: (i * 23) % 50 - 25,
    opacity: 0.95,
  });
});

/* -------------------------------------------------------------------------- */
/*  PEARLS                                                                     */
/* -------------------------------------------------------------------------- */

const pearlArc = [
  [42, 37.8],
  [45.5, 39.2],
  [48.5, 40],
  [51.5, 40],
  [54.5, 39.2],
  [58, 37.8],
  [40, 41.5],
  [60.2, 41.2],
  [37.5, 45],
  [62.8, 44.6],
  [35, 51],
  [65.5, 50.5],
  [47, 36.4],
  [53, 36.2],
  [32, 40],
  [68, 39.5],
  [28, 51],
  [72, 50],
  [44, 70],
  [56, 70.5],
];
pearlArc.forEach(([x, y], i) => {
  svg("svg-pearl", svgPearl(`pr${i}`, { tone: i % 3 === 0 ? "#f6ead8" : "#efe6dc" }), {
    group: "pearl-tiny",
    x,
    y,
    w: 1.7 + (i % 4) * 0.45,
    z: 33 + (i % 3),
    rot: (i * 15) % 30,
    crack: i === 2,
    departStart: i === 2 ? 0.108 : undefined,
    departEnd: i === 2 ? 0.16 : undefined,
  });
});

/* -------------------------------------------------------------------------- */
/*  PETALS + LEAVES                                                            */
/* -------------------------------------------------------------------------- */

const petals = [
  [29, 20, PINK, -30, 3.2],
  [71, 19, BLUSH, 24, 3],
  [22, 36, "#e7b7c4", -12, 2.8],
  [78, 35, PINK, 18, 2.7],
  [34, 64, "#f0c3cf", -40, 2.6],
  [68, 66, BLUSH, 32, 2.8],
  [48, 14.5, "#f7d0d6", -8, 2.4],
  [52.5, 14.2, PINK, 10, 2.3],
  [16, 54, "#e8a8b6", -22, 2.5],
  [84, 53, "#f2c0cc", 20, 2.5],
  [40, 78, PINK, 8, 2.2],
  [61, 79, BLUSH, -16, 2.2],
];
petals.forEach(([x, y, color, rot, w], i) => {
  svg("svg-petal", svgPetal(`pt${i}`, { color }), {
    group: "petal",
    x,
    y,
    w,
    rot,
    z: 42 + (i % 5),
    crack: i === 0,
    departStart: i === 0 ? 0.11 : undefined,
    departEnd: i === 0 ? 0.162 : undefined,
  });
});

const leaves = [
  [24, 24, -50, 4.2],
  [76, 23, 48, 4],
  [20, 60, -20, 3.8],
  [80, 61, 26, 3.7],
  [38, 76, 10, 3.4],
  [63, 76.5, -14, 3.4],
  [31, 18, -70, 3.2],
  [69, 17.5, 62, 3.2],
  [14, 46, -8, 3.6],
  [86, 46, 12, 3.6],
];
leaves.forEach(([x, y, rot, w], i) => {
  svg("svg-leaf", svgLeaf(`lf${i}`), {
    group: "leaf",
    x,
    y,
    w,
    rot,
    z: 9 + (i % 4),
  });
});

/* -------------------------------------------------------------------------- */
/*  SMALL GOLD + SMALL GEMS                                                    */
/* -------------------------------------------------------------------------- */

const goldBits = [
  [28, 34, "scroll", 5.5, -20],
  [72, 33, "scroll", 5.2, 18],
  [36, 52, "bar", 6.5, 8],
  [64, 52.5, "bar", 6.2, -6],
  [22, 48, "frame", 5.8, -12],
  [78, 48.5, "frame", 5.6, 14],
  [46, 26, "scroll", 4.4, 6],
  [54, 26.2, "scroll", 4.4, -8],
  [40, 62, "bar", 5.5, 16],
  [60, 62, "bar", 5.4, -14],
  [18, 32, "scroll", 4.8, -28],
  [82, 31.5, "scroll", 4.8, 26],
  [33, 42, "frame", 4.6, 4],
  [67, 42, "frame", 4.6, -4],
  [50, 78, "bar", 6, 2],
];
goldBits.forEach(([x, y, variant, w, rot], i) => {
  svg("svg-gold", svgGold(`gd${i}`, { variant }), {
    group: "gold-small",
    x,
    y,
    w,
    rot,
    z: 30 + (i % 6),
    crack: i === 4,
    departStart: i === 4 ? 0.112 : undefined,
    departEnd: i === 4 ? 0.168 : undefined,
  });
});

const smallGems = [
  [40.5, 24, RUBY, "oval", 3.4],
  [59.5, 23.6, SAPPHIRE, "oval", 3.2],
  [31, 40, EMERALD, "emerald", 3.8],
  [69, 39.5, EMERALD, "emerald", 3.6],
  [45, 56, SAPPHIRE, "pear", 3.1],
  [55.5, 56.5, RUBY, "pear", 3.1],
  [26, 52, "#2a6adf", "oval", 2.9],
  [74, 51.5, RUBY, "oval", 2.8],
  [48.5, 20.2, "#c9a227", "pear", 2.6],
  [51.8, 20, EMERALD, "pear", 2.5],
  [38, 72, SAPPHIRE, "emerald", 3],
  [62, 72.4, RUBY, "emerald", 2.9],
  [20.5, 44, "#c9a227", "oval", 2.7],
  [79.5, 43.5, SAPPHIRE, "oval", 2.7],
];
smallGems.forEach(([x, y, color, cut, w], i) => {
  svg("svg-gem", svgGem(`sg${i}`, { color, cut }), {
    group: "gem-small",
    x,
    y,
    w,
    rot: ((i * 19) % 24) - 12,
    z: 48 + (i % 5),
    crack: i === 5,
    departStart: i === 5 ? 0.114 : undefined,
    departEnd: i === 5 ? 0.17 : undefined,
  });
});

/* -------------------------------------------------------------------------- */
/*  MEDIUM SVG FLOWERS                                                         */
/* -------------------------------------------------------------------------- */

const medFlowers = [
  [33, 28, "#e7a0b4", 7.2, -16],
  [67, 27.5, "#f0c2c8", 6.8, 14],
  [24, 58, "#d98ba4", 6.4, -10],
  [76, 57, "#eab0be", 6.2, 12],
  [42, 69, "#f3ccd2", 5.8, 6],
  [58, 69.2, "#e6a8b6", 5.8, -8],
  [16.5, 36, "#efb8c4", 5.4, -20],
  [83.5, 35.5, "#e8a8b8", 5.4, 18],
];
medFlowers.forEach(([x, y, color, w, rot], i) => {
  svg("svg-flower", svgFlower(`fl${i}`, { color }), {
    group: "flower-med",
    x,
    y,
    w,
    rot,
    z: 27 + i,
  });
});

/* -------------------------------------------------------------------------- */
/*  GOLD CHAIN — segmented necklace with ripple timing                         */
/* -------------------------------------------------------------------------- */

const chainCount = 12;
for (let i = 0; i < chainCount; i += 1) {
  const t = i / (chainCount - 1);
  const p0 = { x: 33, y: 37.5 };
  const p1 = { x: 50, y: 47 };
  const p2 = { x: 67, y: 37.5 };
  const u = 1 - t;
  const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
  const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
  const dx =
    2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy =
    2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const rot = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  svg("svg-chain", svgChainLink(`ck${i}`), {
    group: "chain",
    x,
    y,
    w: 2.35,
    rot,
    z: 17,
    ex: (t - 0.5) * 180,
    ey: 160 + Math.abs(t - 0.5) * 80,
    er: rot + (t - 0.5) * 18,
    departStart: 0.235 + i * 0.007,
    departEnd: 0.33 + i * 0.006,
    returnStart: 0.87 + i * 0.004,
    returnEnd: 0.938 + i * 0.003,
  });
}

/* second chain lower on the chest */
for (let i = 0; i < 8; i += 1) {
  const t = i / 7;
  const x = 38 + t * 24;
  const y = 45.5 + Math.sin(t * Math.PI) * 4.2;
  svg("svg-chain", svgChainLink(`ckb${i}`), {
    group: "chain",
    x,
    y,
    w: 2.1,
    rot: (t - 0.5) * 40,
    z: 15,
    ex: (t - 0.5) * 140,
    ey: 200,
    departStart: 0.25 + i * 0.008,
    departEnd: 0.35 + i * 0.007,
    returnStart: 0.874 + i * 0.004,
    returnEnd: 0.942,
  });
}

/* hanging chain fragments from ears */
for (let i = 0; i < 5; i += 1) {
  svg("svg-chain", svgChainLink(`hcl${i}`), {
    group: "hanging",
    x: 21.8,
    y: 37 + i * 2.6,
    w: 1.9,
    rot: 6,
    z: 63,
    ex: -250 - i * 12,
    ey: 90 + i * 28,
    departStart: 0.255 + i * 0.01,
    departEnd: 0.37 + i * 0.008,
  });
  svg("svg-chain", svgChainLink(`hcr${i}`), {
    group: "hanging",
    x: 78.2,
    y: 37 + i * 2.6,
    w: 1.9,
    rot: -6,
    z: 63,
    ex: 250 + i * 12,
    ey: 90 + i * 28,
    departStart: 0.258 + i * 0.01,
    departEnd: 0.372 + i * 0.008,
  });
}

export function getPieces() {
  return pieces;
}

export function pieceCount() {
  return pieces.length;
}
