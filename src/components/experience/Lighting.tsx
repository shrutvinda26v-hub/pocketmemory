"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useJourney } from "@/store/useJourney";
import { getJourney } from "@/lib/journey";

export function Lighting() {
  const key = useRef<THREE.SpotLight>(null);
  const sweep = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const frame = getJourney(useJourney.getState().progress);
    const t = state.clock.elapsedTime;

    if (key.current) {
      key.current.intensity = 18 + frame.polish * 10;
      key.current.position.x = 1.4 + Math.sin(t * 0.15) * 0.15;
    }

    if (sweep.current) {
      const sweepT =
        frame.sweep > 0.05
          ? (frame.sweep < 0.99 ? frame.sweep : (Math.sin(t * 0.55) + 1) * 0.5)
          : 0;
      sweep.current.position.set(-2.4 + sweepT * 4.8, 1.6, 2.4);
      sweep.current.intensity = 8 + frame.sweep * 22;
      sweep.current.target.position.set(0, 0.2, 0);
      sweep.current.target.updateMatrixWorld();
    }

    if (fill.current) {
      fill.current.intensity = 2.2 + frame.polish * 1.4;
    }
    if (rim.current) {
      rim.current.intensity = 3.5 + frame.glow * 2.5;
    }

    state.gl.toneMappingExposure = frame.exposure;
  });

  return (
    <>
      <ambientLight intensity={0.18} color="#cfc8bb" />
      <spotLight
        ref={key}
        color="#fff8ee"
        position={[1.6, 2.8, 3.2]}
        angle={0.42}
        penumbra={0.85}
        intensity={22}
        distance={12}
      />
      <spotLight
        ref={sweep}
        color="#f4fbff"
        position={[-2.2, 1.6, 2.4]}
        angle={0.28}
        penumbra={0.7}
        intensity={0}
        distance={10}
      />
      <pointLight
        ref={fill}
        color="#dbe7f5"
        position={[-2.1, 0.6, 1.8]}
        intensity={2.4}
        distance={8}
      />
      <pointLight
        ref={rim}
        color="#d8b978"
        position={[0.2, -0.4, -2.4]}
        intensity={4}
        distance={9}
      />
      <pointLight
        color="#eef6ff"
        position={[0.4, 1.8, 0.6]}
        intensity={3.2}
        distance={5}
      />
    </>
  );
}
