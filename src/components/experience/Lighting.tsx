"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG, goldenHourBoost } from "@/lib/seasons";
import { ContactShadows } from "@react-three/drei";

export function SceneLighting() {
  const season = useExperienceStore((s) => s.season);
  const progress = useExperienceStore((s) => s.progress);
  const config = SEASON_CONFIG[season];
  const golden = goldenHourBoost(progress);
  const sun = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (!sun.current) return;
    const targetIntensity = config.lightIntensity * golden.intensity;
    sun.current.intensity += (targetIntensity - sun.current.intensity) * 0.04;
    const c = new THREE.Color(config.lightColor);
    if (golden.colorShift > 0) {
      c.lerp(new THREE.Color("#FFB060"), golden.colorShift * 0.45);
    }
    sun.current.color.lerp(c, 0.05);
  });

  return (
    <>
      <color attach="background" args={[config.fogColor]} />
      <fog attach="fog" args={[config.fogColor, 6, 16]} />
      <ambientLight intensity={config.ambientIntensity} color="#F5F0E8" />
      <directionalLight
        ref={sun}
        position={config.sunPosition}
        intensity={config.lightIntensity}
        color={config.lightColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0002}
      />
      <hemisphereLight
        intensity={0.25}
        color="#FFF8EE"
        groundColor="#C4B5A0"
      />
      <ContactShadows
        position={[0.55, -1.06, 0]}
        opacity={0.35}
        scale={4}
        blur={2.5}
        far={2}
        color="#3A2F24"
      />
    </>
  );
}

export function CameraRig() {
  const { camera } = useThree();
  const cameraPush = useExperienceStore((s) => s.cameraPush);
  const wind = useExperienceStore((s) => s.wind);
  const target = useRef(new THREE.Vector3(0.35, 0.15, 0));
  const pos = useRef(new THREE.Vector3(0.2, 0.5, 3.2));

  useFrame(() => {
    // Slow push-in — keep canopy in frame through finale
    const z = 3.6 - cameraPush * 0.65;
    const y = 0.4 + cameraPush * 0.15;
    const x = -0.2 + cameraPush * 0.15;
    pos.current.lerp(new THREE.Vector3(x + wind.x * 0.04, y, z), 0.04);
    camera.position.copy(pos.current);
    target.current.lerp(
      new THREE.Vector3(0.6 + wind.x * 0.02, 0.15 + cameraPush * 0.45, 0),
      0.04
    );
    camera.lookAt(target.current);
  });

  return null;
}

export function PaperWall() {
  return (
    <mesh position={[0.4, 0.4, -2]} receiveShadow>
      <planeGeometry args={[12, 8]} />
      <meshStandardMaterial color="#F5F0E8" roughness={0.95} metalness={0} />
    </mesh>
  );
}
