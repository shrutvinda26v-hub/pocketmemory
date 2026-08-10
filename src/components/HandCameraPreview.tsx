"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HandTracker } from "@/lib/handTracker";

interface HandCameraPreviewProps {
  visible: boolean;
  tracker: HandTracker | null;
  accent: string;
  handDetected: boolean;
}

export function HandCameraPreview({
  visible,
  tracker,
  accent,
  handDetected,
}: HandCameraPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!tracker || !canvas || !visible) {
      tracker?.setPreviewCanvas(null);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cssW = 220;
    const cssH = 156;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    tracker.setPreviewCanvas(canvas);
    return () => tracker.setPreviewCanvas(null);
  }, [tracker, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute bottom-28 right-6 z-20 sm:bottom-32 sm:right-10"
        >
          <div
            className="overflow-hidden rounded-xl border border-white/15 bg-black/50 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
            style={{ boxShadow: `0 0 0 1px ${accent}22, 0 12px 40px rgba(0,0,0,0.45)` }}
          >
            <canvas ref={canvasRef} className="block bg-black/80" />
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: accent,
                    boxShadow: handDetected ? `0 0 8px ${accent}` : "none",
                    opacity: handDetected ? 1 : 0.4,
                  }}
                />
                <span className="text-[9px] tracking-[0.2em] text-white/65 uppercase">
                  {handDetected ? "Hand locked" : "Looking for hand"}
                </span>
              </div>
              <span className="text-[9px] tracking-[0.16em] text-white/35 uppercase">
                Live
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
