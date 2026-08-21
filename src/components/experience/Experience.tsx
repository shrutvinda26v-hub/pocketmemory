"use client";

import dynamic from "next/dynamic";
import { useLenis } from "@/hooks/useLenis";
import { Overlay } from "@/components/ui/Overlay";
import { ProgressRail } from "@/components/ui/Progress";
import { LoadingGate } from "@/components/ui/Loading";

const Scene = dynamic(
  () => import("@/components/experience/Scene").then((m) => m.Scene),
  { ssr: false }
);

export function Experience() {
  useLenis();

  return (
    <div className="experience">
      <LoadingGate>
        <div className="stage">
          <div className="desktop-frame">
            <Scene />
            <div className="vignette" aria-hidden />
            <div className="grain" aria-hidden />
            <Overlay />
            <ProgressRail />
          </div>
        </div>
        <div className="scroll-track" aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <section key={i} />
          ))}
        </div>
      </LoadingGate>
    </div>
  );
}
