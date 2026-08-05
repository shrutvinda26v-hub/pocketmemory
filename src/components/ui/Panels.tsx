"use client";

import { motion, AnimatePresence } from "framer-motion";
import { projects, skills, milestones, testimonials } from "@/data/content";
import { useExperienceStore } from "@/store/useExperienceStore";
import { seasons } from "@/data/content";
import { ensureSoundOnInteraction, getAmbientEngine } from "@/lib/sound";

export function ProjectPanel() {
  const activeProject = useExperienceStore((s) => s.activeProject);
  const setActiveProject = useExperienceStore((s) => s.setActiveProject);
  const project = projects.find((p) => p.id === activeProject);

  return (
    <AnimatePresence>
      {project && (
        <motion.aside
          className="detail-panel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className="panel-close"
            onClick={() => setActiveProject(null)}
            aria-label="Close"
          >
            ×
          </button>
          <p className="panel-meta">
            {project.year} · {project.role}
          </p>
          <h3>{project.title}</h3>
          <p className="panel-summary">{project.summary}</p>
          <p className="panel-detail">{project.detail}</p>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function SkillNote() {
  const activeSkill = useExperienceStore((s) => s.activeSkill);
  const skill = skills.find((s) => s.id === activeSkill);

  return (
    <AnimatePresence>
      {skill && (
        <motion.div
          className="float-note"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.5 }}
        >
          <strong>{skill.name}</strong>
          <span>{skill.detail}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MilestoneNote() {
  const activeMilestone = useExperienceStore((s) => s.activeMilestone);
  const setActiveMilestone = useExperienceStore((s) => s.setActiveMilestone);
  const m = milestones.find((x) => x.id === activeMilestone);

  return (
    <AnimatePresence>
      {m && (
        <motion.div
          className="float-note milestone"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setActiveMilestone(null)}
        >
          <strong>
            {m.year} — {m.label}
          </strong>
          <span>{m.note}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TestimonialPanel() {
  const activeTestimonial = useExperienceStore((s) => s.activeTestimonial);
  const setActiveTestimonial = useExperienceStore((s) => s.setActiveTestimonial);
  const t = testimonials.find((x) => x.id === activeTestimonial);

  return (
    <AnimatePresence>
      {t && (
        <motion.blockquote
          className="testimonial-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className="panel-close"
            onClick={() => setActiveTestimonial(null)}
            aria-label="Close"
          >
            ×
          </button>
          <p>“{t.quote}”</p>
          <footer>
            <cite>{t.author}</cite>
            <span>{t.role}</span>
          </footer>
        </motion.blockquote>
      )}
    </AnimatePresence>
  );
}

export function FinaleCTA() {
  const progress = useExperienceStore((s) => s.progress);
  const visible = progress >= 0.9;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="finale-cta"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2>Let&apos;s Grow Something Beautiful Together.</h2>
          <a className="cta-button" href="mailto:hello@bonsai.studio">
            Begin a Conversation
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SeasonControls() {
  const season = useExperienceStore((s) => s.season);
  const setSeason = useExperienceStore((s) => s.setSeason);

  return (
    <div className="season-controls" role="group" aria-label="Season">
      {seasons.map((s) => (
        <button
          key={s.id}
          type="button"
          className={season === s.id ? "active" : ""}
          aria-pressed={season === s.id}
          title={
            s.id === "rain"
              ? "Natural monsoon rain"
              : s.id === "summer"
                ? "Bright summer sun"
                : s.id === "autumn"
                  ? "Falling autumn leaves"
                  : "Soft winter snow"
          }
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            ensureSoundOnInteraction();
            setSeason(s.id);
            getAmbientEngine().playSeasonChange(s.id);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            ensureSoundOnInteraction();
            setSeason(s.id);
            getAmbientEngine().playSeasonChange(s.id);
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function SoundToggle() {
  const soundEnabled = useExperienceStore((s) => s.soundEnabled);
  const toggleSound = useExperienceStore((s) => s.toggleSound);

  return (
    <button
      type="button"
      className={`sound-toggle ${soundEnabled ? "on" : ""}`}
      onClick={() => {
        toggleSound();
        if (!soundEnabled) {
          ensureSoundOnInteraction();
          getAmbientEngine().playInteractionChime();
        }
      }}
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? "Mute chimes" : "Enable soothing chimes"}
    >
      <span className="sound-waves" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {soundEnabled ? "Chimes on" : "Play chimes"}
    </button>
  );
}
