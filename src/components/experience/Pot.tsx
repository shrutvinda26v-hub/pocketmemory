"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Pot() {
  const mossRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!mossRef.current) return;
    const m = mossRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.02 + Math.sin(clock.elapsedTime * 0.5) * 0.01;
  });

  return (
    <group position={[0.55, -0.85, 0]}>
      {/* Outer pot */}
      <mesh castShadow receiveShadow position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.42, 0.32, 0.22, 48]} />
        <meshStandardMaterial
          color="#C4B5A0"
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>
      {/* Rim */}
      <mesh castShadow position={[0, 0.04, 0]}>
        <torusGeometry args={[0.4, 0.025, 12, 48]} />
        <meshStandardMaterial color="#B8A890" roughness={0.85} />
      </mesh>
      {/* Inner soil */}
      <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.36, 32]} />
        <meshStandardMaterial color="#3A2F24" roughness={1} />
      </mesh>
      {/* Moss */}
      <mesh ref={mossRef} castShadow position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial
          color="#4A6B3A"
          roughness={0.95}
          emissive="#2A3F20"
          emissiveIntensity={0.02}
        />
      </mesh>
      {/* Accent moss clumps */}
      {[
        [0.15, 0.05, 0.1],
        [-0.12, 0.04, -0.08],
        [0.05, 0.06, -0.14],
      ].map((p, i) => (
        <mesh key={i} castShadow position={p as [number, number, number]}>
          <sphereGeometry args={[0.06 + i * 0.01, 10, 8]} />
          <meshStandardMaterial color="#5A7A45" roughness={1} />
        </mesh>
      ))}
      {/* Stone base */}
      <mesh receiveShadow position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 48]} />
        <meshStandardMaterial color="#D4C8B4" roughness={0.92} />
      </mesh>
      {/* Rocks */}
      <mesh castShadow position={[0.38, -0.14, 0.15]} rotation={[0.2, 0.4, 0.1]}>
        <dodecahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color="#6A6560" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.48, -0.15, 0.02]} rotation={[0.1, -0.3, 0.2]}>
        <dodecahedronGeometry args={[0.055, 0]} />
        <meshStandardMaterial color="#5A5550" roughness={0.95} />
      </mesh>
    </group>
  );
}
