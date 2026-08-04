"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";

export function Pot() {
  const mossRef = useRef<THREE.Mesh>(null);
  const growth = useExperienceStore((s) => s.growth);

  useFrame(({ clock }) => {
    if (!mossRef.current) return;
    const m = mossRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.015 + Math.sin(clock.elapsedTime * 0.5) * 0.008;
    // Keep moss modest until life begins so the seed reads clearly
    const mossScale = 0.35 + Math.min(1, growth * 3) * 0.65;
    mossRef.current.scale.setScalar(mossScale);
    m.opacity = 0.55 + Math.min(1, growth * 2) * 0.45;
  });

  return (
    <group position={[0.55, -0.85, 0]}>
      {/* Outer pot — shallow ceramic bowl */}
      <mesh castShadow receiveShadow position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.2, 48]} />
        <meshStandardMaterial color="#C4B5A0" roughness={0.9} metalness={0.04} />
      </mesh>
      {/* Subtle lip */}
      <mesh castShadow position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.41, 0.405, 0.03, 48]} />
        <meshStandardMaterial color="#B8A890" roughness={0.88} />
      </mesh>
      {/* Inner soil */}
      <mesh receiveShadow position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 32]} />
        <meshStandardMaterial color="#3A2F24" roughness={1} />
      </mesh>
      {/* Moss mound — quieter at seed stage */}
      <mesh ref={mossRef} castShadow position={[0, 0.035, 0]}>
        <sphereGeometry args={[0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial
          color="#4A6B3A"
          roughness={0.95}
          emissive="#2A3F20"
          emissiveIntensity={0.015}
          transparent
          opacity={0.55}
        />
      </mesh>
      {[
        [0.12, 0.045, 0.08],
        [-0.1, 0.04, -0.06],
      ].map((p, i) => (
        <mesh key={i} castShadow position={p as [number, number, number]} scale={0.7 + Math.min(1, growth) * 0.3}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color="#5A7A45" roughness={1} />
        </mesh>
      ))}
      {/* Stone plinth */}
      <mesh receiveShadow position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.52, 48]} />
        <meshStandardMaterial color="#D4C8B4" roughness={0.94} />
      </mesh>
      <mesh castShadow position={[0.36, -0.13, 0.14]} rotation={[0.2, 0.4, 0.1]}>
        <dodecahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial color="#6A6560" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.46, -0.14, 0.02]} rotation={[0.1, -0.3, 0.2]}>
        <dodecahedronGeometry args={[0.048, 0]} />
        <meshStandardMaterial color="#5A5550" roughness={0.95} />
      </mesh>
    </group>
  );
}
