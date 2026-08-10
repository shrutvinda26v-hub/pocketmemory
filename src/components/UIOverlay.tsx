"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TrackingStatus } from "@/lib/handTracker";
import type { TreeTheme, TreeThemeId } from "@/lib/treeThemes";
import { TreeSwitcher } from "./TreeSwitcher";

interface UIOverlayProps {
  ready: boolean;
  interactive: boolean;
  awakened: boolean;
  trackingStatus: TrackingStatus;
  handDetected: boolean;
  isTouchPrimary: boolean;
  theme: TreeTheme;
  switching?: boolean;
  onToggleCamera: () => void;
  onSelectTree: (id: TreeThemeId) => void;
}

export function UIOverlay({
  ready,
  interactive,
  awakened,
  trackingStatus,
  handDetected,
  isTouchPrimary,
  theme,
  switching,
  onToggleCamera,
  onSelectTree,
}: UIOverlayProps) {
  const trackingActive = trackingStatus === "active";
  const trackingBusy =
    trackingStatus === "requesting" || trackingStatus === "loading";
  const [lineA, lineB] = theme.tagline.split("\n");

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-6 pt-7 sm:px-10 sm:pt-9">
        <motion.div
          key={theme.id}
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <p className="mb-4 text-[11px] font-medium tracking-[0.35em] text-white/50 uppercase">
            {theme.label}
          </p>
          <h1 className="font-display text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.92] tracking-[-0.02em] text-[#e8f4ff]">
            Awaken
            <br />
            the forest.
          </h1>
          <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed tracking-wide text-white/50 sm:text-base">
            {lineA}
            <br />
            {lineB}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 0.55, duration: 1 }}
          className="pointer-events-auto flex flex-col items-end gap-3"
        >
          <button
            type="button"
            onClick={onToggleCamera}
            disabled={trackingBusy}
            aria-label={
              trackingActive
                ? "Disable hand tracking"
                : trackingBusy
                  ? "Starting hand tracking"
                  : "Enable hand tracking"
            }
            className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/85 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10 disabled:opacity-60"
          >
            <CameraIcon active={trackingActive || trackingBusy} accent={theme.accentCss} />
            <span className="hidden text-[10px] tracking-[0.2em] uppercase sm:inline">
              {trackingBusy
                ? "Starting…"
                : trackingActive
                  ? "Tracking on"
                  : "Enable hand tracking"}
            </span>
          </button>

          <AnimatePresence>
            {trackingActive && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] tracking-[0.22em] text-white/70 uppercase backdrop-blur-md"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: theme.accentCss,
                    boxShadow: handDetected ? `0 0 8px ${theme.accentCss}` : "none",
                    opacity: handDetected ? 1 : 0.4,
                  }}
                />
                {handDetected ? "Hand tracking active" : "Show your hand"}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4 px-6">
        {ready && (
          <TreeSwitcher
            activeId={theme.id}
            disabled={!!switching || !interactive}
            onSelect={onSelectTree}
          />
        )}

        <AnimatePresence mode="wait">
          {interactive && !awakened && !isTouchPrimary && !trackingActive && !trackingBusy && (
            <motion.button
              key="enable-cta"
              type="button"
              onClick={onToggleCamera}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-auto rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-[11px] tracking-[0.28em] text-white/65 uppercase backdrop-blur-md transition hover:border-white/30 hover:bg-white/10 hover:text-white/90"
            >
              Enable hand tracking
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {interactive && !awakened && (
            <motion.p
              key={`prompt-${theme.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0.55, 1], y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 2.8, ease: "easeInOut" }}
              className="text-center text-xs tracking-[0.28em] text-white/40 uppercase sm:text-[13px]"
            >
              {isTouchPrimary
                ? "Touch and drag to awaken it."
                : trackingBusy
                  ? "Starting camera…"
                  : trackingActive
                    ? "Move your hand to awaken it."
                    : "Or move your cursor to awaken it."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {(trackingStatus === "denied" ||
        trackingStatus === "unsupported" ||
        trackingStatus === "error") && (
        <div className="absolute bottom-6 left-6 max-w-xs text-[11px] tracking-wide text-amber-100/50">
          {trackingStatus === "denied"
            ? "Camera access denied. Move your cursor or touch to awaken the tree."
            : trackingStatus === "unsupported"
              ? "No camera found. Move your cursor or touch to awaken the tree."
              : "Hand tracking unavailable. Move your cursor or touch to awaken the tree."}
        </div>
      )}
    </div>
  );
}

function CameraIcon({ active, accent }: { active: boolean; accent: string }) {
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
      {active && <circle cx="12" cy="12" r="1.1" fill={accent} />}
    </svg>
  );
}
