"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { getTextures } from "@/lib/textures";

export function Pot() {
  const mossRef = useRef<THREE.Mesh>(null);
  const growth = useExperienceStore((s) => s.growth);
  const textures = useMemo(() => getTextures(), []);

  useFrame(({ clock }) => {
    if (!mossRef.current) return;
    const m = mossRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.012 + Math.sin(clock.elapsedTime * 0.5) * 0.006;
    const mossScale = 0.32 + Math.min(1, growth * 2.8) * 0.68;
    mossRef.current.scale.setScalar(mossScale);
    m.opacity = 0.5 + Math.min(1, growth * 2) * 0.5;
  });

  return (
    <group position={[0.85, -0.92, 0]}>
      <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.38, 0.28, 0.18, 64]} />
        <meshStandardMaterial
          map={textures.ceramic}
          roughness={0.82}
          metalness={0.06}
        />
      </mesh>
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.39, 0.385, 0.028, 64]} />
        <meshStandardMaterial
          map={textures.ceramic}
          color="#E8DFD0"
          roughness={0.8}
        />
      </mesh>
      <mesh ref={mossRef} castShadow position={[0, 0.032, 0]}>
        <sphereGeometry args={[0.2, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial
          color="#3F6236"
          roughness={0.98}
          emissive="#24351C"
          emissiveIntensity={0.01}
          transparent
          opacity={0.5}
        />
      </mesh>
      {[
        [0.11, 0.04, 0.07],
        [-0.09, 0.038, -0.05],
        [0.02, 0.036, 0.12],
        [-0.14, 0.035, 0.04],
      ].map((p, i) => (
        <mesh
          key={i}
          castShadow
          position={p as [number, number, number]}
          scale={[0.7 + Math.min(1, growth) * 0.3, 0.4, 0.7]}
        >
          <sphereGeometry args={[0.045, 14, 10]} />
          <meshStandardMaterial color={i % 2 ? "#4A6E3E" : "#3A5C32"} roughness={1} />
        </mesh>
      ))}
      <mesh receiveShadow position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 40]} />
        <meshStandardMaterial color="#2E261E" roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 64]} />
        <meshStandardMaterial color="#D4C8B4" roughness={0.94} />
      </mesh>
      <mesh castShadow position={[0.34, -0.12, 0.13]} rotation={[0.2, 0.4, 0.1]}>
        <dodecahedronGeometry args={[0.065, 0]} />
        <meshStandardMaterial color="#6A6560" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.44, -0.13, 0.01]} rotation={[0.1, -0.3, 0.2]}>
        <dodecahedronGeometry args={[0.045, 0]} />
        <meshStandardMaterial color="#5A5550" roughness={0.95} />
      </mesh>
    </group>
  );
}
