import { AnimatePresence, motion } from "framer-motion";
import { soundscape } from "../audio/soundscape";
import { useExperience } from "../experience/store";

export function HUD({ ready }: { ready: boolean }) {
  const colorName = useExperience((s) => s.colorName);
  const instructionVisible = useExperience((s) => s.instructionVisible);
  const muted = useExperience((s) => s.muted);
  const isCoarse = useExperience((s) => s.isCoarse);
  const phase = useExperience((s) => s.phase);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#e6d3b4",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && instructionVisible && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -8, x: "-50%" }}
            transition={{ duration: 0.9, delay: 0.55 }}
            style={{
              position: "absolute",
              left: "50%",
              bottom: isCoarse ? 88 : 56,
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255, 248, 236, 0.72)",
              boxShadow: "0 8px 32px rgba(74, 59, 42, 0.12)",
              backdropFilter: "blur(10px)",
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: isCoarse ? 20 : 24,
              letterSpacing: "0.18em",
              fontStyle: "italic",
              color: "#3d3124",
              whiteSpace: "nowrap",
            }}
          >
            {isCoarse ? "Touch a crystal." : "Choose a color."}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        style={{
          position: "absolute",
          top: 22,
          left: 24,
          fontSize: 11,
          letterSpacing: "0.28em",
          fontWeight: 400,
          color: "#5a4a38",
        }}
      >
        CURRENT COLOR
        <div
          style={{
            marginTop: 4,
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 18,
            letterSpacing: "0.22em",
            fontStyle: "italic",
            color: "#3d3124",
          }}
        >
          {colorName}
        </div>
      </motion.div>

      <button
        type="button"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => {
          const next = !useExperience.getState().muted;
          useExperience.getState().setMuted(next);
          soundscape.setMuted(next);
        }}
        style={{
          pointerEvents: "auto",
          position: "absolute",
          top: 18,
          right: 18,
          width: 40,
          height: 40,
          borderRadius: 999,
          border: "1px solid rgba(74,59,42,0.18)",
          background: "rgba(255,248,236,0.32)",
          backdropFilter: "blur(10px)",
          color: "#4a3b2a",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
        }}
      >
        {muted ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 10v4h3l5 4V6L7 10H4z" />
            <path d="M16 9l5 6M21 9l-5 6" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 10v4h3l5 4V6L7 10H4z" />
            <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />
          </svg>
        )}
      </button>

      {phase === "transforming" && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 22,
            textAlign: "center",
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "rgba(74,59,42,0.45)",
          }}
        >
          A CHANGE TRAVELS THROUGH THE SKIN
        </div>
      )}
    </div>
  );
}
