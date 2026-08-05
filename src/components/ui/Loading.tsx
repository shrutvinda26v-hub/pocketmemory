"use client";

import { useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import type { Season } from "@/store/useExperienceStore";
import { useExperienceStore } from "@/store/useExperienceStore";
import { ensureSoundOnInteraction, getAmbientEngine } from "@/lib/sound";

const SEASON_KEYS: Record<string, Season> = {
  "1": "spring",
  "2": "summer",
  "3": "autumn",
  "4": "winter",
};

export function useSeasonHotkeys() {
  const setSeason = useExperienceStore((s) => s.setSeason);
  const toggleSound = useExperienceStore((s) => s.toggleSound);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      const season = SEASON_KEYS[e.key];
      if (season) {
        setSeason(season);
        ensureSoundOnInteraction();
        getAmbientEngine().playSeasonChange(season);
      }
      if (e.key.toLowerCase() === "m") toggleSound();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSeason, toggleSound]);
}

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const { progress, active } = useProgress();
  const show = active && progress < 100;

  return (
    <>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            className="loading-gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="loading-brand">BONSAI</p>
            <div className="loading-bar">
              <span style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            <p className="loading-hint">A story begins as a seed</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
