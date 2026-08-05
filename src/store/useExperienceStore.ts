import { create } from "zustand";

export type Season = "spring" | "summer" | "autumn" | "winter";
export type SectionId =
  | "home"
  | "growth"
  | "projects"
  | "skills"
  | "journey"
  | "testimonials"
  | "finale";

interface ExperienceState {
  progress: number;
  growth: number;
  section: SectionId;
  season: Season;
  soundEnabled: boolean;
  isIdle: boolean;
  cursor: { x: number; y: number };
  wind: { x: number; y: number };
  activeProject: string | null;
  activeSkill: string | null;
  activeTestimonial: string | null;
  activeMilestone: string | null;
  cameraPush: number;
  hoveredLeaf: number | null;
  hoverPoint: { x: number; y: number; z: number } | null;
  leafRipple: {
    id: number;
    at: number;
    x: number;
    y: number;
    z: number;
  } | null;
  setProgress: (progress: number) => void;
  setSection: (section: SectionId) => void;
  setSeason: (season: Season) => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setIdle: (idle: boolean) => void;
  setCursor: (x: number, y: number) => void;
  setWind: (x: number, y: number) => void;
  setActiveProject: (id: string | null) => void;
  setActiveSkill: (id: string | null) => void;
  setActiveTestimonial: (id: string | null) => void;
  setActiveMilestone: (id: string | null) => void;
  setHoveredLeaf: (id: number | null) => void;
  setHoverPoint: (p: { x: number; y: number; z: number } | null) => void;
  triggerLeafRipple: (
    id: number,
    pos?: { x: number; y: number; z: number }
  ) => void;
}

const SECTION_THRESHOLDS: { id: SectionId; at: number }[] = [
  { id: "home", at: 0 },
  { id: "growth", at: 0.08 },
  { id: "projects", at: 0.28 },
  { id: "skills", at: 0.48 },
  { id: "journey", at: 0.64 },
  { id: "testimonials", at: 0.78 },
  { id: "finale", at: 0.9 },
];

function sectionFromProgress(progress: number): SectionId {
  let current: SectionId = "home";
  for (const threshold of SECTION_THRESHOLDS) {
    if (progress >= threshold.at) current = threshold.id;
  }
  return current;
}

/** Map scroll progress to growth: seed → crack → sprout → mature */
function growthFromProgress(progress: number): number {
  // Hold seed briefly, then rapid sprout hook, then steady growth
  if (progress < 0.02) return 0;
  if (progress < 0.08) return ((progress - 0.02) / 0.06) * 0.12; // crack + sprout
  if (progress < 0.28) return 0.12 + ((progress - 0.08) / 0.2) * 0.28;
  if (progress < 0.9) return 0.4 + ((progress - 0.28) / 0.62) * 0.55;
  return Math.min(1, 0.95 + ((progress - 0.9) / 0.1) * 0.05);
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  progress: 0,
  growth: 0,
  section: "home",
  season: "summer",
  soundEnabled: false,
  isIdle: false,
  cursor: { x: 0, y: 0 },
  wind: { x: 0, y: 0 },
  activeProject: null,
  activeSkill: null,
  activeTestimonial: null,
  activeMilestone: null,
  cameraPush: 0,
  hoveredLeaf: null,
  hoverPoint: null,
  leafRipple: null,
  setProgress: (progress) =>
    set({
      progress,
      growth: growthFromProgress(progress),
      section: sectionFromProgress(progress),
      cameraPush: Math.min(1, progress * 1.1),
    }),
  setSection: (section) => set({ section }),
  setSeason: (season) => set({ season }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setIdle: (isIdle) => set({ isIdle }),
  setCursor: (x, y) => set({ cursor: { x, y } }),
  setWind: (x, y) => set({ wind: { x, y } }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setActiveSkill: (activeSkill) => set({ activeSkill }),
  setActiveTestimonial: (activeTestimonial) => set({ activeTestimonial }),
  setActiveMilestone: (activeMilestone) => set({ activeMilestone }),
  setHoveredLeaf: (hoveredLeaf) => set({ hoveredLeaf }),
  setHoverPoint: (hoverPoint) => set({ hoverPoint }),
  triggerLeafRipple: (id, pos) =>
    set({
      leafRipple: {
        id,
        at: performance.now(),
        x: pos?.x ?? 0,
        y: pos?.y ?? 0.5,
        z: pos?.z ?? 0,
      },
    }),
}));
