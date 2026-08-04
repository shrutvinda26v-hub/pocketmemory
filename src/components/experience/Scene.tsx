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
  LeafShadowDecals,
} from "./Atmosphere";
import { SceneLighting, CameraRig, PaperWall } from "./Lighting";

function SceneContent() {
  return (
    <>
      <SceneLighting />
      <CameraRig />
      <PaperWall />
      <LeafShadowDecals />
      <Pot />
      <Bonsai />
      <ProjectTags />
      <SkillBlossoms />
      <MilestoneBirds />
      <TestimonialLeaves />
      <AmbientParticles />
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
        camera={{ position: [0.2, 0.5, 3.2], fov: 42, near: 0.1, far: 40 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
