const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

export const WORLDS = [
  {
    id: "dragon",
    src: asset("worlds/dragon-kingdom.png"),
    alt: "Dragon Kingdom",
    kind: "embers",
    tint: "#c45a12",
  },
  {
    id: "forest",
    src: asset("worlds/enchanted-forest.png"),
    alt: "Enchanted Forest",
    kind: "leaves",
    tint: "#1d6b5c",
  },
  {
    id: "castle",
    src: asset("worlds/floating-castle.png"),
    alt: "Floating Castle",
    kind: "sparkles",
    tint: "#d4a054",
  },
  {
    id: "underwater",
    src: asset("worlds/underwater-kingdom.png"),
    alt: "Underwater Kingdom",
    kind: "bubbles",
    tint: "#1a6a8a",
  },
  {
    id: "galaxy",
    src: asset("worlds/galaxy.png"),
    alt: "Galaxy",
    kind: "stars",
    tint: "#6a3cb8",
  },
  {
    id: "garden",
    src: asset("worlds/secret-garden.png"),
    alt: "Secret Garden",
    kind: "petals",
    tint: "#c47a8a",
  },
];

export const COVER = {
  front: asset("worlds/front-cover.png"),
  back: asset("textures/leather.png"),
};
