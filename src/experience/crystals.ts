export type CrystalId =
  | "blue"
  | "purple"
  | "red"
  | "orange"
  | "yellow"
  | "pink"
  | "emerald";

export type CrystalDef = {
  id: CrystalId;
  name: string;
  gem: string;
  tint: string;
  desktop: [number, number, number];
  mobile: [number, number, number];
};

export const CRYSTALS: CrystalDef[] = [
  {
    id: "blue",
    name: "AZURE",
    gem: "#4eb6ff",
    tint: "#2f9bb8",
    desktop: [-0.3, 0.1, 0.48],
    mobile: [-0.34, 0.38, 0.55],
  },
  {
    id: "purple",
    name: "VIOLET",
    gem: "#b57bff",
    tint: "#8a62c9",
    desktop: [0.3, 0.16, 0.44],
    mobile: [0.34, 0.38, 0.52],
  },
  {
    id: "red",
    name: "CORAL",
    gem: "#ff6b5c",
    tint: "#d45b52",
    desktop: [-0.26, -0.2, 0.5],
    mobile: [-0.32, -0.4, 0.55],
  },
  {
    id: "orange",
    name: "AMBER",
    gem: "#ff9a4a",
    tint: "#e09048",
    desktop: [0.28, -0.14, 0.46],
    mobile: [0.32, -0.4, 0.52],
  },
  {
    id: "yellow",
    name: "GOLD",
    gem: "#ffd45c",
    tint: "#d4b03a",
    desktop: [0.06, 0.26, 0.4],
    mobile: [0, 0.42, 0.48],
  },
  {
    id: "pink",
    name: "ROSE",
    gem: "#ff8ec8",
    tint: "#d978a8",
    desktop: [0.2, -0.26, 0.52],
    mobile: [0.16, -0.44, 0.5],
  },
  {
    id: "emerald",
    name: "EMERALD",
    gem: "#3edc8a",
    tint: "#2fa86a",
    desktop: [-0.14, 0.22, 0.42],
    mobile: [-0.16, 0.42, 0.5],
  },
];

export const NATURAL_NAME = "TURQUOISE";
