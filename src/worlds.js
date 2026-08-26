const asset = (path) => `${import.meta.env.BASE_URL}${path}?v=4`;

export const WORLDS = [
  {
    id: "dragon",
    src: asset("worlds/dragon-kingdom.png"),
    alt: "Dragon Kingdom",
    kind: "embers",
    tint: "#e07030",
  },
  {
    id: "forest",
    src: asset("worlds/enchanted-forest.png"),
    alt: "Enchanted Forest",
    kind: "leaves",
    tint: "#1c6b66",
  },
  {
    id: "castle",
    src: asset("worlds/floating-castle.png"),
    alt: "Floating Castle",
    kind: "sparkles",
    tint: "#e0b45a",
  },
  {
    id: "underwater",
    src: asset("worlds/underwater-kingdom.png"),
    alt: "Underwater Kingdom",
    kind: "bubbles",
    tint: "#2a88a8",
  },
  {
    id: "galaxy",
    src: asset("worlds/galaxy.png"),
    alt: "Galaxy",
    kind: "stars",
    tint: "#7a48c8",
  },
  {
    id: "garden",
    src: asset("worlds/secret-garden.png"),
    alt: "Secret Garden",
    kind: "petals",
    tint: "#d4899a",
  },
];

export const COVER = {
  front: asset("worlds/front-cover.png"),
  back: asset("textures/leather.png"),
};
