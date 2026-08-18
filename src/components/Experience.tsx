"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { BagDrawer, Grain, Nav } from "@/components/Nav";
import { Intro, SmoothScroll } from "@/components/SmoothScroll";
import {
  HeroSection,
  NariSection,
  PinkSection,
  RedSection,
} from "@/components/sections/Cinematic";
import { UniverseSection } from "@/components/sections/Universe";
import { QuizSection } from "@/components/sections/Quiz";
import { FinaleSection, SquadSection } from "@/components/sections/Squad";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SmoothScroll>
        <Nav />
        {children}
        <BagDrawer />
        <Grain />
      </SmoothScroll>
    </CartProvider>
  );
}

export function Experience() {
  return (
    <main>
      <Intro />
      <HeroSection />
      <RedSection />
      <PinkSection />
      <NariSection />
      <UniverseSection />
      <QuizSection />
      <SquadSection />
      <FinaleSection />
    </main>
  );
}
