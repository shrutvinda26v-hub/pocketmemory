"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/data/content";
import { useExperienceStore } from "@/store/useExperienceStore";
import { ensureSoundOnInteraction, getAmbientEngine } from "@/lib/sound";

/** Branch attachment points (local to bonsai group) */
const TAG_ANCHORS: [number, number, number][] = [
  [0.72, 0.95, 0.18],
  [-0.55, 1.05, -0.2],
  [0.45, 1.35, -0.22],
  [-0.4, 1.4, 0.25],
];

const TWINE_LEN = 0.16;
const TAG_H = 0.15;
const TAG_W = 0.26;

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
  // Swing group pivots at the knot — tag hangs below
  const swing = useRef<THREE.Group>(null);
  const setActiveProject = useExperienceStore((s) => s.setActiveProject);
  const activeProject = useExperienceStore((s) => s.activeProject);
  const growth = useExperienceStore((s) => s.growth);
  const wind = useExperienceStore((s) => s.wind);
  const hovered = useRef(false);
  const appear = useRef(0);
  const angle = useRef(0);
  const angVel = useRef(0);

  const visible = growth > 0.38 + index * 0.04;

  useFrame((_, dt) => {
    if (!swing.current) return;
    const clamped = Math.min(dt, 0.05);
    appear.current += ((visible ? 1 : 0) - appear.current) * Math.min(1, clamped * 2.5);

    // Pendulum: gravity restore + wind + hover nudge
    const rest = wind.x * 0.22;
    const targetPush = hovered.current ? rest + 0.18 : rest;
    const spring = (targetPush - angle.current) * 6.5 - angVel.current * 1.8;
    // Soft natural sway
    const breeze = Math.sin(performance.now() * 0.0012 + index * 1.7) * 0.012;
    angVel.current += (spring + breeze * 8) * clamped;
    angle.current += angVel.current * clamped;
    angle.current = THREE.MathUtils.clamp(angle.current, -0.55, 0.55);

    swing.current.rotation.z = angle.current;
    swing.current.rotation.x =
      Math.sin(performance.now() * 0.0008 + index) * 0.04 + wind.y * 0.04;
    swing.current.scale.setScalar(Math.max(0.001, appear.current));
  });

  return (
    <group position={position}>
      {/* Knot / tie point on the branch */}
      <mesh castShadow position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshStandardMaterial color="#6B5340" roughness={0.95} />
      </mesh>

      {/* Entire hang assembly pivots from the knot */}
      <group ref={swing}>
        {/* Twine — from knot down to tag top */}
        <mesh position={[0, -TWINE_LEN * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.0035, 0.0035, TWINE_LEN, 6]} />
          <meshStandardMaterial color="#8B7355" roughness={1} />
        </mesh>
        {/* Loop where twine meets tag */}
        <mesh position={[0, -TWINE_LEN, 0.005]}>
          <torusGeometry args={[0.012, 0.003, 6, 10]} />
          <meshStandardMaterial color="#7A6548" roughness={0.9} />
        </mesh>

        {/* Tag board — hung from its top edge */}
        <group
          position={[0, -TWINE_LEN - TAG_H * 0.5, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            hovered.current = true;
            document.body.style.cursor = "pointer";
            ensureSoundOnInteraction();
            getAmbientEngine().playLeafRustle();
          }}
          onPointerOut={() => {
            hovered.current = false;
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            ensureSoundOnInteraction();
            getAmbientEngine().playWoodTap();
            setActiveProject(activeProject === id ? null : id);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[TAG_W, TAG_H, 0.018]} />
            <meshStandardMaterial color="#C4A574" roughness={0.88} />
          </mesh>
          {/* Soft edge bevel feel */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[TAG_W * 0.92, TAG_H * 0.82]} />
            <meshStandardMaterial color="#D4B888" roughness={0.92} />
          </mesh>
          <Text
            position={[0, 0, 0.014]}
            fontSize={0.032}
            color="#3A2F24"
            anchorX="center"
            anchorY="middle"
            maxWidth={TAG_W * 0.85}
          >
            {title}
          </Text>
        </group>
      </group>
    </group>
  );
}

export function ProjectTags() {
  const progress = useExperienceStore((s) => s.progress);
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
