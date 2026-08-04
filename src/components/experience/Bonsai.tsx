"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG } from "@/lib/seasons";

type BranchDef = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radiusStart: number;
  radiusEnd: number;
  appearAt: number;
  sway: number;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function buildBranches(): BranchDef[] {
  const branches: BranchDef[] = [];

  const trunk: [number, number, number][] = [
    [0, 0.02, 0],
    [0.04, 0.22, 0.02],
    [-0.06, 0.48, -0.03],
    [0.05, 0.78, 0.04],
    [-0.03, 1.08, -0.02],
    [0.02, 1.38, 0.01],
    [0.0, 1.62, 0],
  ];

  for (let i = 0; i < trunk.length - 1; i++) {
    const a = trunk[i];
    const b = trunk[i + 1];
    branches.push({
      start: new THREE.Vector3(...a),
      end: new THREE.Vector3(...b),
      radiusStart: 0.085 - i * 0.008,
      radiusEnd: 0.075 - i * 0.008,
      appearAt: 0.1 + i * 0.035,
      sway: 0.0015,
    });
  }

  const limbs: {
    start: [number, number, number];
    end: [number, number, number];
    appearAt: number;
    r0: number;
    r1: number;
    sway: number;
  }[] = [
    { start: [0.02, 0.72, 0.02], end: [0.55, 1.05, 0.22], appearAt: 0.28, r0: 0.032, r1: 0.012, sway: 0.012 },
    { start: [-0.02, 0.78, -0.01], end: [-0.5, 1.15, -0.2], appearAt: 0.32, r0: 0.03, r1: 0.011, sway: 0.012 },
    { start: [0.03, 0.95, 0.01], end: [0.42, 1.4, -0.28], appearAt: 0.38, r0: 0.026, r1: 0.01, sway: 0.014 },
    { start: [-0.02, 1.0, 0], end: [-0.38, 1.45, 0.28], appearAt: 0.42, r0: 0.024, r1: 0.009, sway: 0.014 },
    { start: [0.01, 1.2, 0], end: [0.32, 1.7, 0.12], appearAt: 0.5, r0: 0.02, r1: 0.007, sway: 0.016 },
    { start: [-0.01, 1.25, 0], end: [-0.28, 1.72, -0.1], appearAt: 0.54, r0: 0.018, r1: 0.007, sway: 0.016 },
    { start: [0.04, 0.55, 0.02], end: [0.4, 0.72, -0.18], appearAt: 0.34, r0: 0.028, r1: 0.011, sway: 0.01 },
    { start: [-0.04, 0.58, -0.01], end: [-0.42, 0.78, 0.16], appearAt: 0.36, r0: 0.026, r1: 0.01, sway: 0.01 },
    // Twigs
    { start: [0.35, 1.15, 0.1], end: [0.62, 1.35, 0.08], appearAt: 0.58, r0: 0.01, r1: 0.004, sway: 0.02 },
    { start: [-0.32, 1.2, -0.1], end: [-0.58, 1.38, -0.05], appearAt: 0.6, r0: 0.01, r1: 0.004, sway: 0.02 },
    { start: [0.25, 1.5, 0.05], end: [0.4, 1.78, 0.02], appearAt: 0.64, r0: 0.009, r1: 0.003, sway: 0.022 },
    { start: [-0.2, 1.52, -0.05], end: [-0.35, 1.8, -0.02], appearAt: 0.66, r0: 0.009, r1: 0.003, sway: 0.022 },
    { start: [0.3, 0.95, -0.15], end: [0.55, 1.15, -0.32], appearAt: 0.56, r0: 0.012, r1: 0.004, sway: 0.018 },
    { start: [-0.28, 1.0, 0.15], end: [-0.5, 1.2, 0.32], appearAt: 0.57, r0: 0.012, r1: 0.004, sway: 0.018 },
  ];

  for (const limb of limbs) {
    branches.push({
      start: new THREE.Vector3(...limb.start),
      end: new THREE.Vector3(...limb.end),
      radiusStart: limb.r0,
      radiusEnd: limb.r1,
      appearAt: limb.appearAt,
      sway: limb.sway,
    });
  }

  return branches;
}

function leafPositions(branches: BranchDef[], count: number) {
  const positions: THREE.Vector3[] = [];
  const outer = branches.filter((b) => b.appearAt >= 0.28);
  for (let i = 0; i < count; i++) {
    const b = outer[i % outer.length];
    const t = 0.4 + ((i * 0.618) % 1) * 0.55;
    const p = new THREE.Vector3().lerpVectors(b.start, b.end, t);
    const n = new THREE.Vector3().subVectors(b.end, b.start).normalize();
    const side = new THREE.Vector3(n.z, 0, -n.x).normalize();
    const up = new THREE.Vector3().crossVectors(n, side);
    const r = 0.04 + (i % 5) * 0.025;
    p.addScaledVector(side, Math.sin(i * 2.1) * r);
    p.addScaledVector(up, Math.cos(i * 1.7) * r * 0.6);
    positions.push(p);
  }
  return positions;
}

function BranchMesh({
  def,
  growth,
  wind,
}: {
  def: BranchDef;
  growth: number;
  wind: { x: number; y: number };
}) {
  const pivot = useRef<THREE.Group>(null);
  const visible = growth >= def.appearAt - 0.06;
  const scaleY = smoothstep(def.appearAt - 0.06, def.appearAt + 0.1, growth);

  const { mid, quat, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(def.end, def.start);
    const length = Math.max(0.01, dir.length());
    const mid = new THREE.Vector3().addVectors(def.start, def.end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { mid, quat, length };
  }, [def]);

  useFrame(({ clock }) => {
    if (!pivot.current) return;
    const t = clock.elapsedTime;
    const sway =
      Math.sin(t * 0.7 + def.appearAt * 10) * def.sway * scaleY +
      wind.x * def.sway * 0.9;
    pivot.current.rotation.z = sway;
    pivot.current.rotation.x = wind.y * def.sway * 0.35;
    const s = Math.max(0.001, scaleY);
    pivot.current.scale.set(s, s, s);
  });

  if (!visible) return null;

  return (
    <group ref={pivot} position={mid}>
      <mesh quaternion={quat} castShadow receiveShadow>
        <cylinderGeometry args={[def.radiusEnd, def.radiusStart, length, 7]} />
        <meshStandardMaterial color="#4A3728" roughness={0.92} metalness={0.02} />
      </mesh>
    </group>
  );
}

function Seed({ growth }: { growth: number }) {
  const crack = smoothstep(0.015, 0.09, growth);
  const hide = smoothstep(0.1, 0.22, growth);
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.04;
  });

  if (hide > 0.98) return null;

  return (
    <group ref={ref} position={[0, 0.12, 0]} scale={1 - hide * 0.4} visible={hide < 0.99}>
      <mesh castShadow position={[-0.02 * crack, 0.012 * crack, 0]} rotation={[0.2, 0.15, -crack * 0.55]}>
        <sphereGeometry args={[0.055, 16, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#7A5A42" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0.02 * crack, 0.012 * crack, 0]} rotation={[0.2, 0.15 + Math.PI, crack * 0.55]}>
        <sphereGeometry args={[0.055, 16, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#6B4E38" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 0.02, 0]} scale={1 - crack * 0.3}>
        <sphereGeometry args={[0.052, 16, 12]} />
        <meshStandardMaterial color="#8B6848" roughness={0.88} />
      </mesh>
    </group>
  );
}

function Sprout({ growth }: { growth: number }) {
  const emerge = smoothstep(0.04, 0.13, growth);
  const fade = smoothstep(0.16, 0.32, growth);
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.1) * 0.05 * emerge;
  });

  if (emerge < 0.01 || fade > 0.99) return null;

  const s = emerge * (1 - fade * 0.35);
  return (
    <group ref={ref} position={[0, 0.08, 0]} scale={[s, s, s]}>
      <mesh castShadow position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.007, 0.011, 0.18, 6]} />
        <meshStandardMaterial color="#4F7A3E" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.035, 0.16, 0]} rotation={[0, 0, -0.7]}>
        <sphereGeometry args={[0.032, 8, 6]} />
        <meshStandardMaterial color="#6B9A4E" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.03, 0.14, 0.01]} rotation={[0, 0, 0.55]}>
        <sphereGeometry args={[0.026, 8, 6]} />
        <meshStandardMaterial color="#5E8E42" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Roots({ growth }: { growth: number }) {
  const show = smoothstep(0.22, 0.42, growth);
  if (show < 0.01) return null;
  return (
    <group>
      {[
        [0.1, 0.02, 0.07, 0.9],
        [-0.09, 0.015, 0.09, -0.6],
        [0.04, 0.01, -0.1, 0.25],
      ].map((r, i) => (
        <mesh
          key={i}
          castShadow
          position={[r[0] * show, r[1], r[2] * show]}
          rotation={[0.25, r[3], 1.15]}
          scale={show}
        >
          <cylinderGeometry args={[0.01, 0.018, 0.16, 5]} />
          <meshStandardMaterial color="#3D2E22" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Leaves({
  positions,
  growth,
  wind,
}: {
  positions: THREE.Vector3[];
  growth: number;
  wind: { x: number; y: number };
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = SEASON_CONFIG[season];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < positions.length; i++) {
      const appear = 0.26 + (i / positions.length) * 0.5;
      const s = smoothstep(appear, appear + 0.12, growth);
      if (s < 0.01) {
        dummy.scale.setScalar(0);
      } else {
        const p = positions[i];
        const sway = Math.sin(t * 1.05 + i * 0.35) * 0.025 + wind.x * 0.05;
        const swayY = Math.cos(t * 0.85 + i * 0.28) * 0.012 + wind.y * 0.015;
        dummy.position.set(p.x + sway, p.y + swayY, p.z);
        dummy.scale.setScalar(s * (0.55 + (i % 4) * 0.08));
        dummy.rotation.set(
          Math.sin(t * 0.45 + i) * 0.15,
          i * 0.6,
          Math.cos(t * 0.35 + i) * 0.12 + wind.x * 0.08
        );
      }
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, positions.length]}
      castShadow
      frustumCulled={false}
    >
      <sphereGeometry args={[0.065, 6, 5]} />
      <meshStandardMaterial color={colors.leaf} roughness={0.85} metalness={0} />
    </instancedMesh>
  );
}

export function Bonsai() {
  const growth = useExperienceStore((s) => s.growth);
  const wind = useExperienceStore((s) => s.wind);
  const branches = useMemo(() => buildBranches(), []);
  const leaves = useMemo(() => leafPositions(branches, 160), [branches]);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.07) * 0.025;
  });

  return (
    <group ref={group} position={[0.55, -0.85, 0]}>
      <Seed growth={growth} />
      <Sprout growth={growth} />
      <Roots growth={growth} />
      {branches.map((b, i) => (
        <BranchMesh key={i} def={b} growth={growth} wind={wind} />
      ))}
      <Leaves positions={leaves} growth={growth} wind={wind} />
    </group>
  );
}
