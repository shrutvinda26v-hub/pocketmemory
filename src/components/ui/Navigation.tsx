"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useExperienceStore } from "@/store/useExperienceStore";
import { navItems } from "@/data/content";

const SECTION_INDEX: Record<string, number> = {
  home: 0,
  growth: 1,
  projects: 2,
  skills: 3,
  journey: 4,
  testimonials: 5,
  finale: 6,
};

export function Navigation() {
  const section = useExperienceStore((s) => s.section);
  const progress = useExperienceStore((s) => s.progress);

  const scrollTo = (ratio: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.max(0, max * ratio), behavior: "smooth" });
  };

  return (
    <header className="nav">
      <div className="nav-brand">
        <span className="nav-logo">BONSAI</span>
        <span className="nav-seal" aria-hidden />
      </div>
      <nav className="nav-links" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              section === item.id ||
              (item.id === "home" && (section === "home" || section === "growth"))
                ? "active"
                : ""
            }
            onClick={() => {
              const map: Record<string, number> = {
                home: 0,
                projects: 0.32,
                journey: 0.66,
                testimonials: 0.8,
                finale: 0.94,
              };
              scrollTo(map[item.id] ?? 0);
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        className="nav-menu"
        aria-label="Menu"
        onClick={() => scrollTo(0.94)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="section-rail" aria-hidden>
        <span className="section-rail-label">
          {String(SECTION_INDEX[section] + 1).padStart(2, "0")}{" "}
          {section.toUpperCase()}
        </span>
        <div className="section-rail-track">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`section-rail-dot ${progress > i / 6 ? "filled" : ""}`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

export function HeroCopy() {
  const progress = useExperienceStore((s) => s.progress);
  const opacity = Math.max(0, 1 - progress / 0.1);

  return (
    <div
      className="hero-copy"
      style={{ opacity, pointerEvents: opacity < 0.15 ? "none" : "auto" }}
    >
      <h1>
        Every great story starts as a{" "}
        <em className="accent">seed</em>.
      </h1>
      <div className="hero-rule" />
      <p>Scroll through a journey that grows with every step.</p>
      <div className="scroll-cue">
        <button
          type="button"
          className="scroll-circle"
          aria-label="Scroll to grow"
          onClick={() => {
            const max =
              document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: max * 0.08, behavior: "smooth" });
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M8 13l-3.5-3.5M8 13l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span>SCROLL TO GROW</span>
      </div>
    </div>
  );
}

const SECTION_COPY: Record<string, { title: string; body: string } | null> = {
  home: null,
  growth: {
    title: "Growth",
    body: "Branches reach. Leaves awaken. Roots find their hold.",
  },
  projects: {
    title: "Work",
    body: "Each piece hangs from the tree — touch a tag to unfold it.",
  },
  skills: {
    title: "Craft",
    body: "Blossoms mark the skills that shape the work.",
  },
  journey: {
    title: "Journey",
    body: "Birds land with milestones. Click to hear their story.",
  },
  testimonials: {
    title: "Voices",
    body: "Leaves drift on the wind. Catch one to read a note.",
  },
  finale: null, // FinaleCTA owns this moment
};

export function SectionCopy() {
  const section = useExperienceStore((s) => s.section);
  const copy = SECTION_COPY[section];

  return (
    <div className="section-copy">
      <AnimatePresence mode="wait">
        {copy && (
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="section-eyebrow">{copy.title}</p>
            <h2>{copy.body}</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
