"use client";

import { useLenis } from "@/hooks/useLenis";
import { useCursorWind } from "@/hooks/useCursorWind";
import { useAmbientSound } from "@/lib/sound";
import { Scene } from "@/components/experience/Scene";
import { Navigation, HeroCopy, SectionCopy } from "@/components/ui/Navigation";
import {
  ProjectPanel,
  SkillNote,
  MilestoneNote,
  TestimonialPanel,
  FinaleCTA,
  SeasonControls,
  SoundToggle,
} from "@/components/ui/Panels";

export function Experience() {
  useLenis();
  useCursorWind();
  useAmbientSound();

  return (
    <div className="experience">
      <div className="paper-grain" aria-hidden />
      <Scene />
      <div className="ui-layer">
        <Navigation />
        <HeroCopy />
        <SectionCopy />
        <ProjectPanel />
        <SkillNote />
        <MilestoneNote />
        <TestimonialPanel />
        <FinaleCTA />
        <div className="chrome-bottom">
          <SeasonControls />
          <SoundToggle />
        </div>
      </div>
      {/* Tall scroll track — cinematic pacing */}
      <div className="scroll-track" aria-hidden>
        <section id="home" />
        <section id="growth" />
        <section id="projects" />
        <section id="skills" />
        <section id="journey" />
        <section id="testimonials" />
        <section id="finale" />
      </div>
    </div>
  );
}
