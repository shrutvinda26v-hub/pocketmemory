"use client";

import { AnimatePresence, motion } from "framer-motion";

interface BootVeilProps {
  visible: boolean;
}

export function BootVeil({ visible }: BootVeilProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#000814]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.55em" }}
            animate={{ opacity: 0.55, letterSpacing: "0.42em" }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.15 }}
            className="px-6 text-center text-[11px] font-medium tracking-[0.42em] text-cyan-100/70 uppercase"
          >
            The Living Tree
          </motion.div>
          <motion.div
            className="absolute bottom-[18%] left-1/2 h-px w-16 -translate-x-1/2 origin-center bg-cyan-200/30"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
