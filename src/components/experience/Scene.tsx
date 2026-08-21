"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { Atmosphere } from "./Atmosphere";
import { Jewelry } from "./Jewelry";

export function Scene() {
  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#11100E", 1);
        scene.background = new THREE.Color("#11100E");
      }}
    >
      <AdaptiveDpr pixelated={false} />
      <CameraRig />
      <Lighting />
      <Environment preset="studio" environmentIntensity={0.72} />
      <Atmosphere />
      <Jewelry />
    </Canvas>
  );
}
