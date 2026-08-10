"use client";

import { motion } from "framer-motion";
import { TREE_THEMES, type TreeThemeId } from "@/lib/treeThemes";

interface TreeSwitcherProps {
  activeId: TreeThemeId;
  disabled?: boolean;
  onSelect: (id: TreeThemeId) => void;
}

export function TreeSwitcher({ activeId, disabled, onSelect }: TreeSwitcherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="pointer-events-auto flex flex-wrap items-center justify-center gap-2"
      role="tablist"
      aria-label="Choose a living tree"
    >
      {TREE_THEMES.map((theme) => {
        const active = theme.id === activeId;
        return (
          <button
            key={theme.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled || active}
            onClick={() => onSelect(theme.id)}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] tracking-[0.22em] uppercase backdrop-blur-md transition ${
              active
                ? "border-white/25 bg-white/10 text-white"
                : "border-white/10 bg-black/25 text-white/55 hover:border-white/20 hover:bg-white/8 hover:text-white/85"
            } disabled:cursor-default`}
          >
            <span
              className="h-2 w-2 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ background: theme.accentCss, color: theme.accentCss }}
            />
            {theme.name}
          </button>
        );
      })}
    </motion.div>
  );
}
