export const projects = [
  {
    id: "atelier",
    title: "Atelier",
    year: "2024",
    role: "Product Design",
    summary:
      "A quiet workspace for makers — typography, rhythm, and room to breathe.",
    detail:
      "Designed an editorial product system where every surface feels handcrafted. Motion is reserved for meaning: opening a draft, finishing a piece, sharing quietly.",
  },
  {
    id: "kintsugi",
    title: "Kintsugi",
    year: "2023",
    role: "Brand & Web",
    summary: "A ceramics brand told through imperfect gold seams.",
    detail:
      "Identity, packaging, and a scroll narrative that mirrors repair as beauty — warm paper textures, restrained type, and soft light.",
  },
  {
    id: "stillwater",
    title: "Stillwater",
    year: "2023",
    role: "Motion System",
    summary: "Ambient interfaces that move like water, not UI.",
    detail:
      "Built a motion language for calm products: slow ease, organic acceleration, no bounce — inspired by ponds and paper.",
  },
  {
    id: "nest",
    title: "Nest",
    year: "2022",
    role: "Full Product",
    summary: "A home for creative rituals and small daily growth.",
    detail:
      "From first sketch to shipped experience — a place where habits feel like tending a garden, not checking boxes.",
  },
] as const;

export const skills = [
  {
    id: "ui",
    name: "UI Design",
    detail: "Systems, type, and surfaces with quiet precision.",
  },
  {
    id: "ux",
    name: "UX",
    detail: "Journeys shaped by empathy and restraint.",
  },
  {
    id: "motion",
    name: "Motion",
    detail: "Physics-led movement that feels alive, never flashy.",
  },
  {
    id: "figma",
    name: "Figma",
    detail: "Crafted components and living design libraries.",
  },
  {
    id: "cursor",
    name: "Cursor",
    detail: "AI-assisted craft with human taste at the center.",
  },
  {
    id: "ai",
    name: "AI",
    detail: "Thoughtful tooling that amplifies creativity.",
  },
  {
    id: "frontend",
    name: "Frontend",
    detail: "Next.js, Three.js, and performance-minded builds.",
  },
] as const;

export const milestones = [
  { id: "m2021", year: "2021", label: "Started Design", note: "First roots in craft." },
  { id: "m2022", year: "2022", label: "First Clients", note: "Learning by making for others." },
  { id: "m2023", year: "2023", label: "Full Time Creator", note: "Committed to the path." },
  { id: "m2024", year: "2024", label: "Teaching", note: "Sharing the garden." },
  { id: "m2025", year: "2025", label: "Building Products", note: "Growing something lasting." },
] as const;

export const testimonials = [
  {
    id: "t1",
    quote:
      "Working with them felt like watching something carefully tended — patient, precise, and quietly extraordinary.",
    author: "Maya Chen",
    role: "Founder, Still Studio",
  },
  {
    id: "t2",
    quote:
      "Every detail had intention. The work didn't shout. It stayed with you.",
    author: "Jonah Reed",
    role: "Creative Director",
  },
  {
    id: "t3",
    quote:
      "They turn constraints into elegance. Our product finally feels like a place people want to linger.",
    author: "Aiko Tanaka",
    role: "Head of Product",
  },
  {
    id: "t4",
    quote:
      "Rare to find craft and calm in the same designer. This was both.",
    author: "Elena Voss",
    role: "Brand Lead",
  },
] as const;

export const navItems = [
  { id: "home", label: "About", href: "#home" },
  { id: "projects", label: "Work", href: "#projects" },
  { id: "journey", label: "Experience", href: "#journey" },
  { id: "testimonials", label: "Testimonials", href: "#testimonials" },
  { id: "finale", label: "Contact", href: "#finale" },
] as const;

export const seasons = [
  { id: "spring" as const, label: "Spring" },
  { id: "summer" as const, label: "Summer" },
  { id: "autumn" as const, label: "Autumn" },
  { id: "winter" as const, label: "Winter" },
];
