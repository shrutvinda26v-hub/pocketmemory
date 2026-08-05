"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
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
import { LoadingGate, useSeasonHotkeys } from "@/components/ui/Loading";

export function Experience() {
  useLenis();
  useCursorWind();
  useAmbientSound();
  useSeasonHotkeys();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".intro-veil",
        { opacity: 1 },
        {
          opacity: 0,
          duration: 1.8,
          ease: "power2.inOut",
          delay: 0.35,
          onComplete: () => setReady(true),
        }
      );
      gsap.fromTo(
        ".nav",
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.7 }
      );
      gsap.fromTo(
        ".chrome-bottom",
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.out", delay: 1.5 }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className={`experience ${ready ? "is-ready" : ""}`}>
      <LoadingGate>
        <div className="intro-veil" aria-hidden />
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
          <p className="season-hint" aria-hidden>
            Keys 1–4 seasons · click leaves · Music
          </p>
        </div>
        <div className="scroll-track" aria-hidden>
          <section id="home" />
          <section id="growth" />
          <section id="projects" />
          <section id="skills" />
          <section id="journey" />
          <section id="testimonials" />
          <section id="finale" />
        </div>
      </LoadingGate>
    </div>
  );
}
