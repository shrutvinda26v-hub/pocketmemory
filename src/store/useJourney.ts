import { create } from "zustand";

type JourneyState = {
  progress: number;
  intro: number;
  ready: boolean;
  webgl: "unknown" | "ok" | "lost";
  setProgress: (progress: number) => void;
  setIntro: (intro: number) => void;
  setReady: (ready: boolean) => void;
  setWebgl: (webgl: JourneyState["webgl"]) => void;
};

export const useJourney = create<JourneyState>((set) => ({
  progress: 0,
  intro: 0,
  ready: false,
  webgl: "unknown",
  setProgress: (progress) => set({ progress }),
  setIntro: (intro) => set({ intro }),
  setReady: (ready) => set({ ready }),
  setWebgl: (webgl) => set({ webgl }),
}));
