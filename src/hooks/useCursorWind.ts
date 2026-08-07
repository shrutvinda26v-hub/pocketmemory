"use client";

import { useEffect, useRef } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";

/** Cursor as wind — subtle lateral influence on foliage */
export function useCursorWind() {
  const setCursor = useExperienceStore((s) => s.setCursor);
  const setWind = useExperienceStore((s) => s.setWind);
  const setIdle = useExperienceStore((s) => s.setIdle);
  const windRef = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const resetIdle = () => {
      setIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), 5000);
    };

    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setCursor(x, y);

      // Ease wind toward cursor (very subtle)
      windRef.current.x += (x * 0.35 - windRef.current.x) * 0.04;
      windRef.current.y += (y * 0.15 - windRef.current.y) * 0.04;
      setWind(windRef.current.x, windRef.current.y);
      resetIdle();
    };

    const decay = () => {
      windRef.current.x *= 0.985;
      windRef.current.y *= 0.985;
      setWind(windRef.current.x, windRef.current.y);
      requestAnimationFrame(decay);
    };
    const frame = requestAnimationFrame(decay);

    window.addEventListener("pointermove", onMove, { passive: true });
    resetIdle();

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [setCursor, setWind, setIdle]);
}
