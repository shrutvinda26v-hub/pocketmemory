"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { skills } from "@/data/content";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG } from "@/lib/seasons";

const BLOSSOM_POS: [number, number, number][] = [
  [0.85, 1.0, 0.2],
  [0.3, 1.15, -0.25],
  [1.0, 0.8, -0.15],
  [0.2, 0.9, 0.3],
  [0.7, 1.25, 0.05],
  [0.4, 1.35, -0.1],
  [0.9, 1.1, 0.15],
];

function Blossom({
  id,
  name,
  position,
  index,
}: {
  id: string;
  name: string;
  position: [number, number, number];
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const petals = useRef<THREE.Group>(null);
  const setActiveSkill = useExperienceStore((s) => s.setActiveSkill);
  const activeSkill = useExperienceStore((s) => s.activeSkill);
  const growth = useExperienceStore((s) => s.growth);
  const season = useExperienceStore((s) => s.season);
  const open = activeSkill === id;
  const openAmt = useRef(0);
  const visible = growth > 0.5 + index * 0.02;

  useFrame(({ clock }) => {
    if (!group.current || !petals.current) return;
    const t = clock.elapsedTime;
    openAmt.current += ((open ? 1 : 0) - openAmt.current) * 0.06;
    group.current.scale.setScalar(
      visible ? 0.85 + openAmt.current * 0.25 : 0
    );
    group.current.position.y =
      position[1] + Math.sin(t * 0.8 + index) * 0.01;
    petals.current.rotation.y = t * 0.15 + index;
    const spread = 0.3 + openAmt.current * 0.5;
    petals.current.children.forEach((child, i) => {
      child.rotation.z = (i / 5) * Math.PI * 2;
      child.position.set(
        Math.cos((i / 5) * Math.PI * 2) * spread * 0.04,
        0,
        Math.sin((i / 5) * Math.PI * 2) * spread * 0.04
      );
    });
  });

  const springBoost = season === "spring" || SEASON_CONFIG[season].blossomEnabled;

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setActiveSkill(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (activeSkill === id) setActiveSkill(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        setActiveSkill(open ? null : id);
      }}
    >
      <group ref={petals}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} castShadow>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshStandardMaterial
              color={springBoost ? "#F2C4D0" : "#E8D5C4"}
              roughness={0.7}
              transparent
              opacity={0.92}
            />
          </mesh>
        ))}
      </group>
      <mesh>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshStandardMaterial color="#C4A050" roughness={0.6} />
      </mesh>
      {open && (
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.04}
          color="#2C2C2C"
          anchorX="center"
          outlineWidth={0.002}
          outlineColor="#F5F0E8"
        >
          {name}
        </Text>
      )}
    </group>
  );
}

export function SkillBlossoms() {
  const progress = useExperienceStore((s) => s.progress);
  const season = useExperienceStore((s) => s.season);
  const show =
    (progress >= 0.46 && progress < 0.7) ||
    (season === "spring" && progress >= 0.35);

  if (!show) return null;

  return (
    <group position={[0.55, -0.85, 0]}>
      {skills.map((s, i) => (
        <Blossom
          key={s.id}
          id={s.id}
          name={s.name}
          position={BLOSSOM_POS[i]}
          index={i}
        />
      ))}
    </group>
  );
}
