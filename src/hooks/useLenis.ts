"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useExperienceStore } from "@/store/useExperienceStore";

export function useLenis() {
  const setProgress = useExperienceStore((s) => s.setProgress);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    const onScroll = ({ progress }: { progress: number }) => {
      setProgress(Math.min(1, Math.max(0, progress)));
    };

    lenis.on("scroll", onScroll);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Also track document scroll height for progress when content drives height
    const updateFromWindow = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0) {
        setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
      }
    };
    window.addEventListener("scroll", updateFromWindow, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.removeEventListener("scroll", updateFromWindow);
      lenisRef.current = null;
    };
  }, [setProgress]);

  return lenisRef;
}
