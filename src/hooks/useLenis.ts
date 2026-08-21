"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useJourney } from "@/store/useJourney";

export function useLenis() {
  const setProgress = useJourney((s) => s.setProgress);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.28,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.12,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    const sync = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      setProgress(p);
    };

    lenis.on("scroll", sync);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      lenisRef.current = null;
    };
  }, [setProgress]);

  return lenisRef;
}
