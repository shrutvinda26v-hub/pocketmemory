export type Shade = {
  id: string
  name: string
  personality: string
  finish: string
  vibe: string
  description: string
  price: number
  hex: string
  hexSoft: string
  character: string
  number: string
};

export const SHADES: Shade[] = [
  {
    id: "ruby-rush",
    name: "RUBY RUSH",
    personality: "The Main Character",
    finish: "Highly pigmented • Satin finish",
    vibe: "Bold. Dramatic. Impossible to ignore.",
    description: "Vermillion heat for women who don’t enter rooms quietly.",
    price: 2200,
    hex: "#C41E3A",
    hexSoft: "#7A1024",
    character: "/images/red-baddie.png",
    number: "01",
  },
  {
    id: "pink-punch",
    name: "PINK PUNCH",
    personality: "The Flirt",
    finish: "Gloss bomb • Juicy finish",
    vibe: "Sweet? Never. Pink with an attitude.",
    description: "Bubblegum with bite. Chrome-heart energy in a tube.",
    price: 2200,
    hex: "#FF2D8B",
    hexSoft: "#9B1258",
    character: "/images/pink-baddie.png",
    number: "02",
  },
  {
    id: "mirchi",
    name: "MIRCHI",
    personality: "The Firecracker",
    finish: "Saffron satin • Warm pigment",
    vibe: "Nari, but make it loud.",
    description: "Tangerine heat. Dupatta-in-the-wind kind of energy.",
    price: 2200,
    hex: "#FF6B00",
    hexSoft: "#9A3A00",
    character: "/images/nari-baddie.png",
    number: "03",
  },
  {
    id: "brown-sugar",
    name: "BROWN SUGAR",
    personality: "The Unbothered",
    finish: "Soft matte • Second-skin",
    vibe: "Too expensive to explain herself.",
    description: "Caramel hush. For the girl who already left the group chat.",
    price: 2200,
    hex: "#6B3A2A",
    hexSoft: "#3A1E16",
    character: "/images/brown-baddie.png",
    number: "04",
  },
  {
    id: "plum-chaos",
    name: "PLUM CHAOS",
    personality: "The Chaos",
    finish: "Velvet cream • Midnight berry",
    vibe: "Pretty problem. Delicious disaster.",
    description: "Plum gone feral. Wear it when the plot needs thickening.",
    price: 2200,
    hex: "#6B1B4D",
    hexSoft: "#3A0E2A",
    character: "/images/plum-baddie.png",
    number: "05",
  },
  {
    id: "nude-ceo",
    name: "NUDE CEO",
    personality: "The Boss",
    finish: "Power nude • Soft satin",
    vibe: "Boardroom. Afterparty. Same mouth.",
    description: "Champagne authority. The nude that closes deals and rumours.",
    price: 2400,
    hex: "#C9A07A",
    hexSoft: "#6E4E34",
    character: "/images/brown-baddie.png",
    number: "06",
  },
  {
    id: "coral-crush",
    name: "CORAL CRUSH",
    personality: "The Sunshine",
    finish: "Juicy coral • Sheer-buildable",
    vibe: "Summer that refuses to sit down.",
    description: "Marigold light. The shade that laughs with its whole face.",
    price: 2200,
    hex: "#FF6F61",
    hexSoft: "#A33A32",
    character: "/images/coral-baddie.png",
    number: "07",
  },
  {
    id: "berry-drama",
    name: "BERRY DRAMA",
    personality: "The Drama Queen",
    finish: "Opera cream • High pigment",
    vibe: "Interval scene. Standing ovation.",
    description: "Wine-dark theatre. For encore energy only.",
    price: 2300,
    hex: "#7A1237",
    hexSoft: "#3D081C",
    character: "/images/berry-baddie.png",
    number: "08",
  },
  {
    id: "gold-dig",
    name: "GOLD DIG",
    personality: "The Icon",
    finish: "Metallic glaze • Limited",
    vibe: "Temple jewellery for the mouth.",
    description: "Liquid gold over rose. Festival, but make it couture.",
    price: 2600,
    hex: "#D4A017",
    hexSoft: "#7A5A08",
    character: "/images/finale-baddie.png",
    number: "09",
  },
  {
    id: "cobalt-nakhra",
    name: "COBALT NAKHRA",
    personality: "The Rebel",
    finish: "Electric cream • Statement",
    vibe: "Not a trend. A plot twist.",
    description: "Cobalt kiss with magenta undertow. For nights that start rumours.",
    price: 2400,
    hex: "#2A4BFF",
    hexSoft: "#141C7A",
    character: "/images/hero-wink.png",
    number: "10",
  },
];

export const QUIZ: Record<
  string,
  { label: string; shadeId: string; line: string }
> = {
  confident: {
    label: "CONFIDENT",
    shadeId: "ruby-rush",
    line: "You don’t enter rooms. Rooms rearrange around you.",
  },
  flirty: {
    label: "FLIRTY",
    shadeId: "pink-punch",
    line: "You collect glances like jewellery. And you never give them back.",
  },
  chaotic: {
    label: "CHAOTIC",
    shadeId: "plum-chaos",
    line: "The plot is thicker because you showed up in it.",
  },
  unbothered: {
    label: "UNBOTHERED",
    shadeId: "brown-sugar",
    line: "You heard the noise. You chose silence. And better lipstick.",
  },
  main: {
    label: "MAIN CHARACTER",
    shadeId: "ruby-rush",
    line: "One woman. Many moods. Obviously you.",
  },
};

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
