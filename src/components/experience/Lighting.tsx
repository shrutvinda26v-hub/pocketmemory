"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useJourney } from "@/store/useJourney";
import { getJourney } from "@/lib/journey";

export function Lighting() {
  const key = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const { progress, intro } = useJourney.getState();
    const frame = getJourney(progress, intro);
    const t = state.clock.elapsedTime;

    if (key.current) {
      key.current.intensity = 7 + frame.glow * 3;
      key.current.position.x = 1.6 + Math.sin(t * 0.12) * 0.2;
    }
    if (fill.current) fill.current.intensity = 2.4;
    if (rim.current) rim.current.intensity = 3.2 + frame.glow * 1.8;
  });

  return (
    <>
      <ambientLight intensity={0.22} color="#9db0d0" />
      <spotLight
        ref={key}
        color="#ffe9c4"
        position={[1.8, 3.0, 3.4]}
        angle={0.45}
        penumbra={0.85}
        intensity={9}
        distance={14}
      />
      <pointLight
        ref={fill}
        color="#7ea0d4"
        position={[-2.2, 0.4, 1.8]}
        intensity={2.4}
        distance={9}
      />
      <pointLight
        ref={rim}
        color="#d4b06a"
        position={[0.2, -0.2, -2.6]}
        intensity={4}
        distance={10}
      />
      <pointLight color="#eef4ff" position={[0.3, 2.0, 0.8]} intensity={2.6} distance={6} />
    </>
  );
}
