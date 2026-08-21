"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useLenis } from "@/hooks/useLenis";
import { Overlay } from "@/components/ui/Overlay";
import { ProgressRail } from "@/components/ui/Progress";
import { LoadingGate } from "@/components/ui/Loading";
import { FallbackJewelry } from "@/components/experience/FallbackJewelry";
import { useJourney } from "@/store/useJourney";

const Scene = dynamic(
  () => import("@/components/experience/Scene").then((m) => m.Scene),
  { ssr: false }
);

export function Experience() {
  useLenis();
  const webgl = useJourney((s) => s.webgl);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (useJourney.getState().webgl !== "ok") {
        useJourney.getState().setWebgl("lost");
      }
    }, 3200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="experience">
      <LoadingGate>
        <div className="stage">
          <div className="reel">
            <FallbackJewelry />
            {webgl !== "lost" ? <Scene /> : null}
            <div className="vignette" aria-hidden />
            <div className="grain" aria-hidden />
            <Overlay />
            <ProgressRail />
          </div>
        </div>
        <div className="scroll-track" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <section key={i} />
          ))}
        </div>
      </LoadingGate>
    </div>
  );
}
