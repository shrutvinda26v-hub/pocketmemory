"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TrackingStatus } from "@/lib/handTracker";

interface UIOverlayProps {
  ready: boolean;
  awakened: boolean;
  trackingStatus: TrackingStatus;
  handDetected: boolean;
  isTouchPrimary: boolean;
  onToggleCamera: () => void;
}

export function UIOverlay({
  ready,
  awakened,
  trackingStatus,
  handDetected,
  isTouchPrimary,
  onToggleCamera,
}: UIOverlayProps) {
  const trackingActive = trackingStatus === "active";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-6 pt-7 sm:px-10 sm:pt-9">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="max-w-xl"
        >
          <p className="mb-4 text-[11px] font-medium tracking-[0.35em] text-cyan-100/55 uppercase">
            The Living Tree
          </p>
          <h1 className="font-display text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.92] tracking-[-0.02em] text-[#e8f4ff]">
            Awaken
            <br />
            the forest.
          </h1>
          <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed tracking-wide text-cyan-50/55 sm:text-base">
            Move your hand.
            <br />
            Watch it come alive.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 1 }}
          className="pointer-events-auto flex flex-col items-end gap-3"
        >
          <button
            type="button"
            onClick={onToggleCamera}
            aria-label={trackingActive ? "Disable hand tracking" : "Enable hand tracking"}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-50/80 backdrop-blur-md transition hover:border-cyan-200/30 hover:bg-white/10"
          >
            <CameraIcon active={trackingActive} />
          </button>

          <AnimatePresence>
            {trackingActive && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] tracking-[0.22em] text-cyan-100/70 uppercase backdrop-blur-md"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    handDetected ? "bg-cyan-300 shadow-[0_0_8px_#67e8f9]" : "bg-cyan-300/40"
                  }`}
                />
                Hand tracking active
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-10 flex justify-center px-6">
        <AnimatePresence mode="wait">
          {ready && !awakened && (
            <motion.p
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ delay: 1.8, duration: 1.1 }}
              className="text-center text-xs tracking-[0.28em] text-cyan-50/45 uppercase sm:text-[13px]"
            >
              {isTouchPrimary
                ? "Touch and drag to awaken it."
                : trackingActive
                  ? "Move your hand to awaken it."
                  : "Move your hand — or enable the camera."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {(trackingStatus === "denied" ||
        trackingStatus === "unsupported" ||
        trackingStatus === "error") && (
        <div className="absolute bottom-6 left-6 max-w-xs text-[11px] tracking-wide text-amber-100/50">
          {trackingStatus === "denied"
            ? "Camera access denied. Touch or move your cursor to awaken the tree."
            : "No camera available. Touch or move your cursor to awaken the tree."}
        </div>
      )}
    </div>
  );
}

function CameraIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 8.5A2.5 2.5 0 0 1 7 6h3l1.2-1.6A1 1 0 0 1 12 4h0a1 1 0 0 1 .8.4L14 6h3a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 18H7a2.5 2.5 0 0 1-2.5-2.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        className={active ? "opacity-100" : "opacity-70"}
      />
      <circle
        cx="12"
        cy="12"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        className={active ? "opacity-100" : "opacity-50"}
      />
      {active && <circle cx="12" cy="12" r="1.1" fill="#67e8f9" />}
    </svg>
  );
}
