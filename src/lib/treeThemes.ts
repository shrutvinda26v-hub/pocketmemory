export type TreeThemeId = "azure" | "ember" | "jade" | "amethyst";

export interface TreeTheme {
  id: TreeThemeId;
  name: string;
  label: string;
  tagline: string;
  baseSrc: string;
  glowSrc: string;
  /** Primary glow RGB 0–255 */
  glow: [number, number, number];
  /** Brighter core / particle highlight */
  core: [number, number, number];
  /** Soft outer bloom */
  bloom: [number, number, number];
  /** Horizon accent wash */
  horizon: [number, number, number];
  skyTop: string;
  skyMid: string;
  skyLow: string;
  accentCss: string;
}

export const TREE_THEMES: TreeTheme[] = [
  {
    id: "azure",
    name: "Azure",
    label: "The Living Tree",
    tagline: "Move your hand.\nWatch it come alive.",
    baseSrc: "/assets/tree-base-dark.webp",
    glowSrc: "/assets/tree-glow-awake.webp",
    glow: [0, 229, 255],
    core: [220, 255, 255],
    bloom: [0, 140, 220],
    horizon: [255, 140, 0],
    skyTop: "#000814",
    skyMid: "#001d3d",
    skyLow: "#0a1628",
    accentCss: "rgba(0, 229, 255, 0.55)",
  },
  {
    id: "ember",
    name: "Ember",
    label: "The Ember Tree",
    tagline: "Touch the coals.\nWake the fireflies.",
    baseSrc: "/assets/tree-ember-base.webp",
    glowSrc: "/assets/tree-ember-glow.webp",
    glow: [255, 90, 20],
    core: [255, 220, 140],
    bloom: [220, 50, 10],
    horizon: [255, 70, 20],
    skyTop: "#0a0608",
    skyMid: "#1a0a0c",
    skyLow: "#14080a",
    accentCss: "rgba(255, 120, 40, 0.55)",
  },
  {
    id: "jade",
    name: "Jade",
    label: "The Spirit Tree",
    tagline: "Breathe with the mist.\nCall the spirits.",
    baseSrc: "/assets/tree-jade-base.webp",
    glowSrc: "/assets/tree-jade-glow.webp",
    glow: [40, 255, 140],
    core: [200, 255, 220],
    bloom: [20, 180, 120],
    horizon: [80, 200, 160],
    skyTop: "#040a10",
    skyMid: "#0a1a18",
    skyLow: "#081412",
    accentCss: "rgba(40, 255, 160, 0.55)",
  },
  {
    id: "amethyst",
    name: "Amethyst",
    label: "The Moon Tree",
    tagline: "Follow the moonlight.\nAwaken the crystals.",
    baseSrc: "/assets/tree-amethyst-base.webp",
    glowSrc: "/assets/tree-amethyst-glow.webp",
    glow: [180, 90, 255],
    core: [240, 210, 255],
    bloom: [120, 40, 220],
    horizon: [160, 120, 255],
    skyTop: "#07040f",
    skyMid: "#12081f",
    skyLow: "#0c0816",
    accentCss: "rgba(180, 100, 255, 0.55)",
  },
];

export function getTheme(id: TreeThemeId): TreeTheme {
  return TREE_THEMES.find((t) => t.id === id) ?? TREE_THEMES[0];
}

export function rgba(rgb: [number, number, number], a: number) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}
