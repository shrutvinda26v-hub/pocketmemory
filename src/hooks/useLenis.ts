"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useExperienceStore } from "@/store/useExperienceStore";

export function useLenis() {
  const setProgress = useExperienceStore((s) => s.setProgress);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.15,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    const syncProgress = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      setProgress(p);
    };

    lenis.on("scroll", syncProgress);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    window.addEventListener("scroll", syncProgress, { passive: true });
    window.addEventListener("resize", syncProgress);
    syncProgress();

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.removeEventListener("scroll", syncProgress);
      window.removeEventListener("resize", syncProgress);
      lenisRef.current = null;
    };
  }, [setProgress]);

  return lenisRef;
}
