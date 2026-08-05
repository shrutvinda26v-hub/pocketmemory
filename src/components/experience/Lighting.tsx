"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ContactShadows, Environment } from "@react-three/drei";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG, goldenHourBoost } from "@/lib/seasons";
import { getTextures } from "@/lib/textures";

export function SceneLighting() {
  const season = useExperienceStore((s) => s.season);
  const progress = useExperienceStore((s) => s.progress);
  const config = SEASON_CONFIG[season];
  const golden = goldenHourBoost(progress);
  const sun = useRef<THREE.DirectionalLight>(null);
  const bg = useRef(new THREE.Color(config.fogColor));
  const fogCol = useRef(new THREE.Color(config.fogColor));
  const targetBg = useRef(new THREE.Color(config.fogColor));
  const sunColor = useRef(new THREE.Color(config.lightColor));
  const sunPos = useRef(new THREE.Vector3(...config.sunPosition));
  const { scene } = useThree();

  useFrame(() => {
    targetBg.current.set(config.fogColor);
    if (golden.colorShift > 0) {
      targetBg.current.lerp(new THREE.Color("#F5D4A8"), golden.colorShift * 0.35);
    }
    bg.current.lerp(targetBg.current, 0.04);
    fogCol.current.lerp(targetBg.current, 0.04);
    scene.background = bg.current;
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(fogCol.current);
    }

    if (!sun.current) return;
    const sunBoost = config.sunVisible ? 1.25 : 1;
    const targetIntensity =
      config.lightIntensity * golden.intensity * 0.95 * sunBoost;
    sun.current.intensity += (targetIntensity - sun.current.intensity) * 0.04;
    sunColor.current.set(config.lightColor);
    if (golden.colorShift > 0) {
      sunColor.current.lerp(new THREE.Color("#FFB060"), golden.colorShift * 0.45);
    }
    if (config.sunVisible) {
      sunColor.current.lerp(new THREE.Color("#FFE8A8"), 0.25);
    }
    sun.current.color.lerp(sunColor.current, 0.05);
    sunPos.current.set(...config.sunPosition);
    sun.current.position.lerp(sunPos.current, 0.04);
  });

  return (
    <>
      <fog
        attach="fog"
        args={[
          config.fogColor,
          season === "winter" ? 9 : 7,
          season === "winter" ? 22 : 18,
        ]}
      />
      <ambientLight intensity={config.ambientIntensity * 0.85} color="#F5F0E8" />
      <directionalLight
        ref={sun}
        position={config.sunPosition}
        intensity={config.lightIntensity}
        color={config.lightColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />
      <hemisphereLight intensity={0.32} color="#FFF8EE" groundColor="#C4B5A0" />
      <Environment preset="apartment" environmentIntensity={0.2} />
      <ContactShadows
        position={[0.85, -1.1, 0]}
        opacity={0.35}
        scale={4.5}
        blur={2.6}
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
  const textures = useMemo(() => getTextures(), []);
  const season = useExperienceStore((s) => s.season);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const color = useRef(new THREE.Color(SEASON_CONFIG[season].paper));

  useFrame(() => {
    if (!mat.current) return;
    color.current.lerp(new THREE.Color(SEASON_CONFIG[season].paper), 0.04);
    mat.current.color.copy(color.current);
  });

  return (
    <mesh position={[0.6, 0.5, -2.2]} receiveShadow>
      <planeGeometry args={[14, 9]} />
      <meshStandardMaterial
        ref={mat}
        map={textures.paper}
        color={SEASON_CONFIG[season].paper}
        roughness={0.98}
        metalness={0}
      />
    </mesh>
  );
}

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
        opacity={0.045}
        depthWrite={false}
      />
    </mesh>
  );

  return (
    <>
      <group ref={g1} position={[1.6, 1.2, -2.15]}>
        {[0, 1, 2, 3, 4, 5].map((i) =>
          leaf(`a${i}`, (i - 2.5) * 0.14, Math.sin(i) * 0.22, i * 0.35, 0.85 + i * 0.04)
        )}
      </group>
      <group ref={g2} position={[2.2, 0.7, -2.15]}>
        {[0, 1, 2, 3, 4].map((i) =>
          leaf(`b${i}`, (i - 2) * 0.11, Math.cos(i) * 0.16, -i * 0.3, 0.7)
        )}
      </group>
    </>
  );
}
