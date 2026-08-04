"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { milestones } from "@/data/content";
import { useExperienceStore } from "@/store/useExperienceStore";

const PERCHES: [number, number, number][] = [
  [0.9, 1.05, 0.15],
  [0.25, 1.2, -0.2],
  [1.05, 0.75, -0.1],
  [0.35, 1.4, 0.1],
  [0.7, 1.55, -0.05],
];

function Bird({
  id,
  year,
  label,
  position,
  index,
}: {
  id: string;
  year: string;
  label: string;
  position: [number, number, number];
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const setActiveMilestone = useExperienceStore((s) => s.setActiveMilestone);
  const activeMilestone = useExperienceStore((s) => s.activeMilestone);
  const growth = useExperienceStore((s) => s.growth);
  const isIdle = useExperienceStore((s) => s.isIdle);
  const landed = useRef(0);
  const open = activeMilestone === id;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const shouldLand = growth > 0.58 + index * 0.05;
    landed.current += ((shouldLand ? 1 : 0) - landed.current) * 0.03;

    // Fly-in arc
    const fly = 1 - landed.current;
    group.current.position.set(
      position[0] + fly * (1.5 - index * 0.2),
      position[1] + fly * 0.8 + Math.sin(t * 2 + index) * fly * 0.2,
      position[2] + fly * 0.5
    );
    group.current.scale.setScalar(landed.current * 0.9);
    group.current.rotation.y = -0.4 + index * 0.2 + Math.sin(t * 0.3 + index) * 0.1;

    const flap = fly > 0.1 || (isIdle && Math.sin(t + index) > 0.9)
      ? Math.sin(t * 12) * 0.5
      : Math.sin(t * 0.5 + index) * 0.05;
    if (wingL.current) wingL.current.rotation.z = 0.4 + flap;
    if (wingR.current) wingR.current.rotation.z = -0.4 - flap;
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        setActiveMilestone(open ? null : id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshStandardMaterial color="#4A453F" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0.035, 0.02, 0]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color="#3A3530" roughness={0.8} />
      </mesh>
      {/* Beak */}
      <mesh position={[0.055, 0.015, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.008, 0.025, 5]} />
        <meshStandardMaterial color="#C4893A" />
      </mesh>
      <mesh ref={wingL} position={[0, 0.01, 0.03]}>
        <sphereGeometry args={[0.025, 6, 4]} />
        <meshStandardMaterial color="#5A5550" />
      </mesh>
      <mesh ref={wingR} position={[0, 0.01, -0.03]}>
        <sphereGeometry args={[0.025, 6, 4]} />
        <meshStandardMaterial color="#5A5550" />
      </mesh>
      {open && (
        <Text
          position={[0, 0.12, 0]}
          fontSize={0.035}
          color="#2C2C2C"
          anchorX="center"
          outlineWidth={0.002}
          outlineColor="#F5F0E8"
        >
          {`${year} — ${label}`}
        </Text>
      )}
    </group>
  );
}

export function MilestoneBirds() {
  const progress = useExperienceStore((s) => s.progress);
  const show = progress >= 0.62 && progress < 0.88;

  if (!show) return null;

  return (
    <group position={[0.85, -0.92, 0]}>
      {milestones.map((m, i) => (
        <Bird
          key={m.id}
          id={m.id}
          year={m.year}
          label={m.label}
          position={PERCHES[i]}
          index={i}
        />
      ))}
    </group>
  );
}
