"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { milestones } from "@/data/content";
import { useExperienceStore } from "@/store/useExperienceStore";
import { ensureSoundOnInteraction, getAmbientEngine } from "@/lib/sound";

const PERCHES: [number, number, number][] = [
  [0.9, 1.05, 0.15],
  [0.25, 1.2, -0.2],
  [1.05, 0.75, -0.1],
  [0.35, 1.4, 0.1],
  [0.7, 1.55, -0.05],
];

const BIRD_COLORS = [
  { body: "#5A4E42", wing: "#6B5E50", belly: "#A89880", beak: "#D4A05A" },
  { body: "#4A5548", wing: "#5A6558", belly: "#9AA890", beak: "#C49050" },
  { body: "#6A4838", wing: "#7A5848", belly: "#B8A090", beak: "#E0A860" },
  { body: "#3E4548", wing: "#4E5558", belly: "#98A0A8", beak: "#C8A070" },
  { body: "#584838", wing: "#685848", belly: "#B0A090", beak: "#D8A858" },
];

function Bird({
  id,
  year,
  label,
  perch,
  index,
}: {
  id: string;
  year: string;
  label: string;
  perch: [number, number, number];
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);
  const setActiveMilestone = useExperienceStore((s) => s.setActiveMilestone);
  const activeMilestone = useExperienceStore((s) => s.activeMilestone);
  const growth = useExperienceStore((s) => s.growth);
  const isIdle = useExperienceStore((s) => s.isIdle);
  const open = activeMilestone === id;
  const colors = BIRD_COLORS[index % BIRD_COLORS.length];

  // Flight state
  const progress = useRef(0); // 0 = in air far away, 1 = perched
  const flapPhase = useRef(Math.random() * Math.PI * 2);
  const hop = useRef(0);
  const lookYaw = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const prev = useMemo(() => new THREE.Vector3(), []);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const start = useMemo(
    () =>
      new THREE.Vector3(
        perch[0] + 2.4 + index * 0.35,
        perch[1] + 1.1 + (index % 2) * 0.4,
        perch[2] + 1.2 - index * 0.15
      ),
    [perch, index]
  );
  const mid = useMemo(
    () =>
      new THREE.Vector3(
        perch[0] + 0.9 + Math.sin(index) * 0.4,
        perch[1] + 0.85,
        perch[2] + 0.55
      ),
    [perch, index]
  );
  const end = useMemo(
    () => new THREE.Vector3(perch[0], perch[1], perch[2]),
    [perch]
  );

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const shouldLand = growth > 0.58 + index * 0.05;
    const target = shouldLand ? 1 : 0;
    // Ease into landing — never a hard snap
    progress.current += (target - progress.current) * Math.min(1, dt * 0.55);

    const p = progress.current;
    const flying = p < 0.98;

    // Quadratic bezier flight path → perch
    const u = 1 - Math.pow(1 - Math.min(1, p * 1.05), 1.65);
    const omu = 1 - u;
    tmp.set(
      omu * omu * start.x + 2 * omu * u * mid.x + u * u * end.x,
      omu * omu * start.y + 2 * omu * u * mid.y + u * u * end.y,
      omu * omu * start.z + 2 * omu * u * mid.z + u * u * end.z
    );
    // Soft bob while flying
    if (flying) {
      tmp.y += Math.sin(t * 3.2 + index) * 0.04 * (1 - u);
    } else {
      // Tiny perch settle / occasional hop
      hop.current *= 0.9;
      if (isIdle && Math.sin(t * 0.7 + index * 2.1) > 0.97) hop.current = 0.03;
      tmp.y += hop.current;
    }

    // Face flight direction
    vel.copy(tmp).sub(prev);
    if (vel.lengthSq() > 1e-8 && flying) {
      const yaw = Math.atan2(vel.x, vel.z);
      lookYaw.current += (yaw - lookYaw.current) * Math.min(1, dt * 4);
      const bank = THREE.MathUtils.clamp(vel.x * 8, -0.45, 0.45);
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        -bank,
        Math.min(1, dt * 3)
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        THREE.MathUtils.clamp(-vel.y * 6, -0.35, 0.35),
        Math.min(1, dt * 3)
      );
    } else {
      // Perched: gentle look-around
      lookYaw.current +=
        (Math.sin(t * 0.35 + index) * 0.35 + index * 0.15 - lookYaw.current) *
        Math.min(1, dt * 1.2);
      group.current.rotation.z *= 0.92;
      group.current.rotation.x *= 0.92;
    }
    prev.copy(tmp);

    group.current.position.copy(tmp);
    group.current.rotation.y = lookYaw.current;
    // Fade in as they arrive
    const scale = 0.85 * THREE.MathUtils.smoothstep(p, 0.05, 0.35);
    group.current.scale.setScalar(Math.max(0.001, scale));
    group.current.visible = scale > 0.01;

    // Wing flap — fast in flight, soft rest on perch
    const flapSpeed = flying ? 14 + (1 - u) * 6 : isIdle ? 1.2 : 0.6;
    flapPhase.current += dt * flapSpeed;
    const flapAmp = flying ? 0.75 : 0.06 + (isIdle ? 0.04 : 0);
    const flap = Math.sin(flapPhase.current) * flapAmp;
    if (wingL.current) wingL.current.rotation.z = 0.25 + flap;
    if (wingR.current) wingR.current.rotation.z = -0.25 - flap;
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        ensureSoundOnInteraction();
        getAmbientEngine().playBirdLand();
        setActiveMilestone(open ? null : id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        ensureSoundOnInteraction();
        getAmbientEngine().playLeafRustle();
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Body — elongated teardrop */}
      <mesh castShadow position={[0, 0, 0]} rotation={[0.15, 0, 0]} scale={[1, 0.85, 1.55]}>
        <sphereGeometry args={[0.038, 12, 10]} />
        <meshStandardMaterial color={colors.body} roughness={0.85} />
      </mesh>
      {/* Soft belly */}
      <mesh position={[0, -0.012, 0.005]} rotation={[0.2, 0, 0]} scale={[0.85, 0.55, 1.2]}>
        <sphereGeometry args={[0.032, 10, 8]} />
        <meshStandardMaterial color={colors.belly} roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 0.022, 0.042]}>
        <sphereGeometry args={[0.022, 10, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.82} />
      </mesh>
      {/* Eye */}
      <mesh position={[0.012, 0.028, 0.055]}>
        <sphereGeometry args={[0.004, 6, 4]} />
        <meshStandardMaterial color="#1A1814" />
      </mesh>
      <mesh position={[-0.012, 0.028, 0.055]}>
        <sphereGeometry args={[0.004, 6, 4]} />
        <meshStandardMaterial color="#1A1814" />
      </mesh>
      {/* Beak */}
      <mesh position={[0, 0.018, 0.062]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.006, 0.02, 5]} />
        <meshStandardMaterial color={colors.beak} roughness={0.6} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.005, -0.055]} rotation={[0.4, 0, 0]} scale={[0.55, 0.15, 1]}>
        <sphereGeometry args={[0.028, 8, 6]} />
        <meshStandardMaterial color={colors.wing} roughness={0.88} />
      </mesh>
      {/* Wings — flat planes that flap */}
      <group ref={wingL} position={[0.02, 0.01, 0.005]}>
        <mesh castShadow rotation={[0.1, 0.15, 0.1]} position={[0.03, 0, 0]}>
          <boxGeometry args={[0.07, 0.008, 0.045]} />
          <meshStandardMaterial color={colors.wing} roughness={0.86} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={wingR} position={[-0.02, 0.01, 0.005]}>
        <mesh castShadow rotation={[0.1, -0.15, -0.1]} position={[-0.03, 0, 0]}>
          <boxGeometry args={[0.07, 0.008, 0.045]} />
          <meshStandardMaterial color={colors.wing} roughness={0.86} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Tiny feet when perched */}
      <mesh position={[0.01, -0.032, 0.01]} rotation={[0.4, 0, 0.2]}>
        <cylinderGeometry args={[0.002, 0.002, 0.016, 4]} />
        <meshStandardMaterial color="#C4893A" />
      </mesh>
      <mesh position={[-0.01, -0.032, 0.01]} rotation={[0.4, 0, -0.2]}>
        <cylinderGeometry args={[0.002, 0.002, 0.016, 4]} />
        <meshStandardMaterial color="#C4893A" />
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
  const show = progress >= 0.55 && progress < 0.92;

  if (!show) return null;

  return (
    <group position={[0.85, -0.92, 0]}>
      {milestones.map((m, i) => (
        <Bird
          key={m.id}
          id={m.id}
          year={m.year}
          label={m.label}
          perch={PERCHES[i]}
          index={i}
        />
      ))}
    </group>
  );
}
