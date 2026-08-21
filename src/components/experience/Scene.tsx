"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { Atmosphere } from "./Atmosphere";
import { GoldRing } from "./GoldRing";

export function Scene() {
  return (
    <Canvas
      className="scene-canvas"
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#07122a", 1);
        scene.background = new THREE.Color("#07122a");
      }}
    >
      <CameraRig />
      <Lighting />
      <Environment preset="studio" environmentIntensity={0.85} />
      <Atmosphere />
      <GoldRing />
    </Canvas>
  );
}
