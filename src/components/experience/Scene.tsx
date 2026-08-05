"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { Bonsai } from "./Bonsai";
import { Pot } from "./Pot";
import { ProjectTags } from "./ProjectTags";
import { SkillBlossoms } from "./SkillBlossoms";
import { MilestoneBirds } from "./MilestoneBirds";
import { TestimonialLeaves } from "./TestimonialLeaves";
import {
  AmbientParticles,
  Lanterns,
  Butterfly,
  Snowfall,
  Rainfall,
  SummerSun,
} from "./Atmosphere";
import { LeafSparkles } from "./LeafFX";
import {
  SceneLighting,
  CameraRig,
  PaperWall,
  BambooShadows,
} from "./Lighting";

function SceneContent() {
  return (
    <>
      <SceneLighting />
      <CameraRig />
      <PaperWall />
      <BambooShadows />
      <Pot />
      <Bonsai />
      <LeafSparkles />
      <ProjectTags />
      <SkillBlossoms />
      <MilestoneBirds />
      <TestimonialLeaves />
      <AmbientParticles />
      <Snowfall />
      <Rainfall />
      <SummerSun />
      <Lanterns />
      <Butterfly />
    </>
  );
}

export function Scene() {
  return (
    <div className="scene-canvas">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
        }}
        camera={{ position: [-0.35, 0.35, 3.4], fov: 40, near: 0.1, far: 40 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
