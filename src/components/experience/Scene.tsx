"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { Atmosphere } from "./Atmosphere";
import { Jewelry } from "./Jewelry";
import { useJourney } from "@/store/useJourney";

export function Scene() {
  const setWebgl = useJourney((s) => s.setWebgl);

  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, 1.35]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.02,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#11100E", 1);
        scene.background = new THREE.Color("#11100E");
        setWebgl("ok");
        const canvas = gl.domElement;
        const onLost = (event: Event) => {
          event.preventDefault();
          setWebgl("lost");
        };
        canvas.addEventListener("webglcontextlost", onLost, false);
      }}
    >
      <AdaptiveDpr pixelated={false} />
      <CameraRig />
      <Lighting />
      <Environment preset="studio" environmentIntensity={0.68} />
      <Atmosphere />
      <Jewelry />
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
