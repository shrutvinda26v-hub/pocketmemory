"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG, goldenHourBoost } from "@/lib/seasons";

export function AmbientParticles() {
  const count = 60;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const progress = useExperienceStore((s) => s.progress);
  const wind = useExperienceStore((s) => s.wind);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const config = SEASON_CONFIG[season];
  const golden = goldenHourBoost(progress);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.sin(i * 12.9) * 0.5 + 0.5) * 4 - 2,
        y: (Math.sin(i * 78.2) * 0.5 + 0.5) * 2.5,
        z: (Math.sin(i * 45.1) * 0.5 + 0.5) * 2 - 1,
        speed: 0.1 + (i % 7) * 0.03,
        phase: i * 0.4,
        kind: i % 3,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      let x = s.x + Math.sin(t * s.speed + s.phase) * 0.3 + wind.x * 0.4;
      let y = s.y;
      let z = s.z + Math.cos(t * s.speed * 0.7 + s.phase) * 0.2;
      let scale = 0;

      if (config.snowEnabled) {
        y = ((s.y - t * 0.15 * s.speed) % 2.5 + 2.5) % 2.5;
        scale = progress > 0.15 ? 0.4 : 0;
      } else if (golden.fireflies && s.kind === 0) {
        y = s.y + Math.sin(t * 2 + s.phase) * 0.15;
        scale = 0.35 + Math.sin(t * 4 + s.phase) * 0.15;
      } else if (progress > 0.75 && s.kind === 1) {
        // Falling leaves in testimonials / autumn
        y = ((s.y - t * 0.08 * s.speed) % 2.2 + 2.2) % 2.2;
        x += Math.sin(t + s.phase) * 0.2;
        scale = season === "autumn" || progress > 0.78 ? 0.55 : 0.25;
      } else if (config.blossomEnabled && s.kind === 2) {
        y = ((s.y + t * 0.05) % 2.2);
        scale = 0.4;
      } else if (progress > 0.1) {
        // Soft dust motes
        scale = 0.15;
        y = s.y + Math.sin(t * 0.4 + s.phase) * 0.1;
      }

      dummy.position.set(x, y - 0.5, z);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(t * 0.2 + i, t * 0.1, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.03, 6, 4]} />
      <meshStandardMaterial
        color={golden.fireflies ? "#E8C96A" : config.particleColor}
        emissive={golden.fireflies ? "#E8C96A" : "#000000"}
        emissiveIntensity={golden.fireflies ? 0.8 : 0}
        transparent
        opacity={0.85}
        roughness={0.5}
      />
    </instancedMesh>
  );
}

export function Lanterns() {
  const progress = useExperienceStore((s) => s.progress);
  const golden = goldenHourBoost(progress);
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        (golden.lanterns ? 0.6 : 0) + Math.sin(t * 1.5 + i) * 0.1;
      m.position.y = -0.2 + i * 0.15 + Math.sin(t * 0.6 + i) * 0.02;
    });
  });

  if (!golden.lanterns) return null;

  return (
    <group position={[0.55, -0.4, 0.4]}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0.35 + i * 0.2, 0, 0.2 - i * 0.15]}>
          <mesh
            ref={(el) => {
              refs.current[i] = el;
            }}
            castShadow
          >
            <sphereGeometry args={[0.05, 12, 10]} />
            <meshStandardMaterial
              color="#C4893A"
              emissive="#E8A040"
              emissiveIntensity={0.5}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.1, 6]} />
            <meshStandardMaterial color="#3A2F24" />
          </mesh>
          <pointLight
            color="#FFB060"
            intensity={golden.lanterns ? 0.35 : 0}
            distance={1.5}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}

export function Butterfly() {
  const isIdle = useExperienceStore((s) => s.isIdle);
  const growth = useExperienceStore((s) => s.growth);
  const group = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const show = useRef(0);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    show.current += ((isIdle && growth > 0.15 ? 1 : 0) - show.current) * 0.02;
    group.current.scale.setScalar(show.current);

    const path = t * 0.35;
    group.current.position.set(
      0.55 + Math.sin(path) * 0.6,
      0.2 + Math.sin(path * 1.3) * 0.35,
      Math.cos(path * 0.8) * 0.4
    );
    group.current.rotation.y = path + Math.PI / 2;

    const flap = Math.sin(t * 14) * 0.7;
    if (wingL.current) wingL.current.rotation.y = 0.4 + flap;
    if (wingR.current) wingR.current.rotation.y = -0.4 - flap;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.015, 6, 4]} />
        <meshStandardMaterial color="#3A3530" />
      </mesh>
      <mesh ref={wingL} position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshStandardMaterial
          color="#C4896A"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={wingR} position={[0, 0, -0.02]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshStandardMaterial
          color="#B87A5C"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function LeafShadowDecals() {
  const ref = useRef<THREE.Mesh>(null);
  const wind = useExperienceStore((s) => s.wind);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.x = 1.2 + Math.sin(t * 0.15) * 0.15 + wind.x * 0.1;
    ref.current.position.y = 1.0 + Math.cos(t * 0.12) * 0.08;
    ref.current.rotation.z = Math.sin(t * 0.1) * 0.1;
  });

  return (
    <mesh ref={ref} position={[1.4, 1.15, -1.15]} scale={[1.2, 0.9, 1]}>
      <planeGeometry args={[1.2, 0.9]} />
      <meshBasicMaterial
        color="#2C2C2C"
        transparent
        opacity={0.035}
        depthWrite={false}
      />
    </mesh>
  );
}
