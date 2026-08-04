"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/data/content";
import { useExperienceStore } from "@/store/useExperienceStore";

const TAG_ANCHORS: [number, number, number][] = [
  [0.72, 0.95, 0.18],
  [-0.55, 1.05, -0.2],
  [0.45, 1.35, -0.22],
  [-0.4, 1.4, 0.25],
];

function WoodenTag({
  id,
  title,
  position,
  index,
}: {
  id: string;
  title: string;
  position: [number, number, number];
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const setActiveProject = useExperienceStore((s) => s.setActiveProject);
  const activeProject = useExperienceStore((s) => s.activeProject);
  const growth = useExperienceStore((s) => s.growth);
  const wind = useExperienceStore((s) => s.wind);
  const hovered = useRef(false);

  const visible = growth > 0.38 + index * 0.04;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const swing =
      Math.sin(t * 1.2 + index) * 0.08 +
      wind.x * 0.15 +
      (hovered.current ? Math.sin(t * 2.5) * 0.12 : 0);
    group.current.rotation.z = swing;
    group.current.rotation.x = Math.sin(t * 0.7 + index) * 0.03;
    const target = visible ? 1 : 0;
    group.current.scale.lerp(new THREE.Vector3(target, target, target), 0.04);
  });

  return (
    <group position={position}>
      {/* Twine */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.18, 6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <group
        ref={group}
        position={[0, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hovered.current = false;
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveProject(activeProject === id ? null : id);
        }}
      >
        <mesh castShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[0.28, 0.16, 0.02]} />
          <meshStandardMaterial color="#C4A574" roughness={0.85} />
        </mesh>
        <Text
          position={[0, -0.05, 0.012]}
          fontSize={0.035}
          color="#3A2F24"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.24}
        >
          {title}
        </Text>
      </group>
    </group>
  );
}

export function ProjectTags() {
  const progress = useExperienceStore((s) => s.progress);
  // Visible during projects window; soft hold into skills
  const show = progress >= 0.26 && progress < 0.55;

  const items = useMemo(
    () =>
      projects.map((p, i) => ({
        ...p,
        position: TAG_ANCHORS[i] as [number, number, number],
      })),
    []
  );

  if (!show) return null;

  return (
    <group position={[0.85, -0.92, 0]}>
      {items.map((p, i) => (
        <WoodenTag
          key={p.id}
          id={p.id}
          title={p.title}
          position={p.position}
          index={i}
        />
      ))}
    </group>
  );
}
