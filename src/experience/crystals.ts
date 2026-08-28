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
    desktop: [-0.42, 0.16, 0.42],
    mobile: [-0.38, -0.32, 0.5],
  },
  {
    id: "purple",
    name: "VIOLET",
    gem: "#b57bff",
    tint: "#8a62c9",
    desktop: [0.4, 0.28, 0.36],
    mobile: [0.38, -0.3, 0.48],
  },
  {
    id: "red",
    name: "CORAL",
    gem: "#ff6b5c",
    tint: "#d45b52",
    desktop: [-0.36, -0.28, 0.46],
    mobile: [-0.22, -0.42, 0.52],
  },
  {
    id: "orange",
    name: "AMBER",
    gem: "#ff9a4a",
    tint: "#e09048",
    desktop: [0.44, -0.18, 0.4],
    mobile: [0.22, -0.42, 0.5],
  },
  {
    id: "yellow",
    name: "GOLD",
    gem: "#ffd45c",
    tint: "#d4b03a",
    desktop: [0.08, 0.38, 0.32],
    mobile: [0, 0.36, 0.42],
  },
  {
    id: "pink",
    name: "ROSE",
    gem: "#ff8ec8",
    tint: "#d978a8",
    desktop: [0.28, -0.36, 0.5],
    mobile: [0.4, 0.18, 0.44],
  },
  {
    id: "emerald",
    name: "EMERALD",
    gem: "#3edc8a",
    tint: "#2fa86a",
    desktop: [-0.18, 0.32, 0.34],
    mobile: [-0.4, 0.16, 0.44],
  },
];

export const NATURAL_NAME = "TURQUOISE";
