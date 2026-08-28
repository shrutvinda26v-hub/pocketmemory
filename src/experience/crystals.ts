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
    gem: "#3aa4e6",
    tint: "#2f9bb8",
    desktop: [-0.28, 0.06, 0.22],
    mobile: [-0.4, 0.4, 0.28],
  },
  {
    id: "purple",
    name: "VIOLET",
    gem: "#a56de8",
    tint: "#8a62c9",
    desktop: [0.28, 0.12, 0.22],
    mobile: [0.4, 0.4, 0.28],
  },
  {
    id: "red",
    name: "CORAL",
    gem: "#e45b55",
    tint: "#d45b52",
    desktop: [-0.24, -0.24, 0.22],
    mobile: [-0.36, -0.42, 0.28],
  },
  {
    id: "orange",
    name: "AMBER",
    gem: "#e8943a",
    tint: "#e09048",
    desktop: [0.26, -0.18, 0.22],
    mobile: [0.36, -0.42, 0.28],
  },
  {
    id: "yellow",
    name: "GOLD",
    gem: "#e0b83a",
    tint: "#d4b03a",
    desktop: [0.04, 0.3, 0.22],
    mobile: [0, 0.46, 0.28],
  },
  {
    id: "pink",
    name: "ROSE",
    gem: "#e07aa8",
    tint: "#d978a8",
    desktop: [0.2, -0.3, 0.22],
    mobile: [0.16, -0.46, 0.28],
  },
  {
    id: "emerald",
    name: "EMERALD",
    gem: "#2fb56e",
    tint: "#2fa86a",
    desktop: [-0.16, 0.26, 0.22],
    mobile: [-0.16, 0.46, 0.28],
  },
];

export const NATURAL_NAME = "TURQUOISE";
