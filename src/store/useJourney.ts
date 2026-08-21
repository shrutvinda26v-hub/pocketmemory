import { create } from "zustand";

type JourneyState = {
  progress: number;
  ready: boolean;
  setProgress: (progress: number) => void;
  setReady: (ready: boolean) => void;
};

export const useJourney = create<JourneyState>((set) => ({
  progress: 0,
  ready: false,
  setProgress: (progress) => set({ progress }),
  setReady: (ready) => set({ ready }),
}));
