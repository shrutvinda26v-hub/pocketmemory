import { create } from "zustand";
import type { CrystalId } from "./crystals";

export type Phase = "idle" | "noticing" | "reaching" | "transforming";

type ExperienceState = {
  hoveredId: CrystalId | null;
  activeId: CrystalId | null;
  phase: Phase;
  colorName: string;
  muted: boolean;
  instructionVisible: boolean;
  audioUnlocked: boolean;
  isCoarse: boolean;
  setHovered: (id: CrystalId | null) => void;
  setActive: (id: CrystalId | null) => void;
  setPhase: (phase: Phase) => void;
  setColorName: (name: string) => void;
  setMuted: (muted: boolean) => void;
  dismissInstruction: () => void;
  unlockAudio: () => void;
  setCoarse: (isCoarse: boolean) => void;
};

export const useExperience = create<ExperienceState>((set) => ({
  hoveredId: null,
  activeId: null,
  phase: "idle",
  colorName: "TURQUOISE",
  muted: false,
  instructionVisible: true,
  audioUnlocked: false,
  isCoarse: false,
  setHovered: (hoveredId) => set({ hoveredId }),
  setActive: (activeId) => set({ activeId }),
  setPhase: (phase) => set({ phase }),
  setColorName: (colorName) => set({ colorName }),
  setMuted: (muted) => set({ muted }),
  dismissInstruction: () => set({ instructionVisible: false }),
  unlockAudio: () => set({ audioUnlocked: true }),
  setCoarse: (isCoarse) => set({ isCoarse }),
}));
