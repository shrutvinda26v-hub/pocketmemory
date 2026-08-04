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
      <fog attach="fog" args={[config.fogColor, 7, 18]} />
      <ambientLight intensity={config.ambientIntensity} color="#F5F0E8" />
      <directionalLight
        ref={sun}
        position={config.sunPosition}
        intensity={config.lightIntensity}
        color={config.lightColor}
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.0002}
      />
      <hemisphereLight intensity={0.28} color="#FFF8EE" groundColor="#C4B5A0" />
      <ContactShadows
        position={[0.85, -1.1, 0]}
        opacity={0.32}
        scale={4.5}
        blur={2.8}
        far={2.2}
        color="#3A2F24"
      />
    </>
  );
}

export function CameraRig() {
  const { camera } = useThree();
  const cameraPush = useExperienceStore((s) => s.cameraPush);
  const wind = useExperienceStore((s) => s.wind);
  const target = useRef(new THREE.Vector3(0.7, 0.05, 0));
  const pos = useRef(new THREE.Vector3(-0.35, 0.35, 3.4));

  useFrame(() => {
    // Start wide with tree on the right; ease closer as it grows
    const z = 3.5 - cameraPush * 0.7;
    const y = 0.32 + cameraPush * 0.2;
    const x = -0.45 + cameraPush * 0.35;
    pos.current.lerp(new THREE.Vector3(x + wind.x * 0.035, y, z), 0.045);
    camera.position.copy(pos.current);
    target.current.lerp(
      new THREE.Vector3(0.85 + wind.x * 0.015, 0.05 + cameraPush * 0.5, 0),
      0.045
    );
    camera.lookAt(target.current);
  });

  return null;
}

export function PaperWall() {
  return (
    <mesh position={[0.6, 0.5, -2.2]} receiveShadow>
      <planeGeometry args={[14, 9]} />
      <meshStandardMaterial color="#F5F0E8" roughness={0.96} metalness={0} />
    </mesh>
  );
}

/** Soft bamboo / leaf silhouettes drifting on the wall — life before scroll */
export function BambooShadows() {
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);
  const wind = useExperienceStore((s) => s.wind);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g1.current) {
      g1.current.position.x = 1.6 + Math.sin(t * 0.12) * 0.12 + wind.x * 0.08;
      g1.current.rotation.z = Math.sin(t * 0.1) * 0.06 + wind.x * 0.04;
    }
    if (g2.current) {
      g2.current.position.x = 2.2 + Math.cos(t * 0.09) * 0.1 + wind.x * 0.06;
      g2.current.rotation.z = -0.2 + Math.cos(t * 0.11) * 0.05;
    }
  });

  const leaf = (key: string, x: number, y: number, r: number, s: number) => (
    <mesh key={key} position={[x, y, 0]} rotation={[0, 0, r]} scale={s}>
      <planeGeometry args={[0.35, 0.12]} />
      <meshBasicMaterial
        color="#2C2C2C"
        transparent
        opacity={0.04}
        depthWrite={false}
      />
    </mesh>
  );

  return (
    <>
      <group ref={g1} position={[1.6, 1.2, -2.15]}>
        {[0, 1, 2, 3, 4].map((i) =>
          leaf(`a${i}`, (i - 2) * 0.15, Math.sin(i) * 0.2, i * 0.4, 0.9 + i * 0.05)
        )}
      </group>
      <group ref={g2} position={[2.2, 0.7, -2.15]}>
        {[0, 1, 2, 3].map((i) =>
          leaf(`b${i}`, (i - 1.5) * 0.12, Math.cos(i) * 0.15, -i * 0.35, 0.7)
        )}
      </group>
    </>
  );
}
