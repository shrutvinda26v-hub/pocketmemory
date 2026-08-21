"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { Atmosphere } from "./Atmosphere";
import { GoldRing } from "./GoldRing";
import { useJourney } from "@/store/useJourney";

export function Scene() {
  const setWebgl = useJourney((s) => s.setWebgl);

  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#07122a", 1);
        scene.background = new THREE.Color("#07122a");
        setWebgl("ok");
        const canvas = gl.domElement;
        canvas.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            setWebgl("lost");
          },
          false
        );
      }}
    >
      <AdaptiveDpr pixelated={false} />
      <CameraRig />
      <Lighting />
      <Environment preset="studio" environmentIntensity={0.55} />
      <Atmosphere />
      <GoldRing />
      <WebglWatchdog />
    </Canvas>
  );
}

function WebglWatchdog() {
  const frames = useRef(0);
  const setWebgl = useJourney((s) => s.setWebgl);

  useFrame(() => {
    frames.current += 1;
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (frames.current < 12) setWebgl("lost");
    }, 2500);
    return () => window.clearTimeout(id);
  }, [setWebgl]);

  return null;
}
