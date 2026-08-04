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
  // Main trunk — twisted bonsai silhouette
  const trunkPoints = [
    [0, 0, 0],
    [0.05, 0.25, 0.02],
    [-0.08, 0.55, -0.04],
    [0.06, 0.95, 0.03],
    [-0.02, 1.35, -0.02],
    [0.04, 1.7, 0.01],
  ] as const;

  for (let i = 0; i < trunkPoints.length - 1; i++) {
    const a = trunkPoints[i];
    const b = trunkPoints[i + 1];
    branches.push({
      start: new THREE.Vector3(a[0], a[1], a[2]),
      end: new THREE.Vector3(b[0], b[1], b[2]),
      radiusStart: 0.09 - i * 0.01,
      radiusEnd: 0.08 - i * 0.01,
      appearAt: 0.08 + i * 0.04,
      sway: 0.002,
    });
  }

  const limbDefs: {
    anchorY: number;
    end: [number, number, number];
    appearAt: number;
    r0: number;
    r1: number;
  }[] = [
    { anchorY: 0.9, end: [0.62, 1.35, 0.18], appearAt: 0.28, r0: 0.035, r1: 0.014 },
    { anchorY: 1.0, end: [-0.55, 1.4, -0.22], appearAt: 0.32, r0: 0.032, r1: 0.012 },
    { anchorY: 1.2, end: [0.48, 1.7, -0.28], appearAt: 0.4, r0: 0.028, r1: 0.01 },
    { anchorY: 1.25, end: [-0.42, 1.75, 0.3], appearAt: 0.44, r0: 0.026, r1: 0.01 },
    { anchorY: 1.45, end: [0.28, 2.05, 0.12], appearAt: 0.52, r0: 0.022, r1: 0.008 },
    { anchorY: 1.5, end: [-0.22, 2.1, -0.1], appearAt: 0.56, r0: 0.02, r1: 0.008 },
    { anchorY: 0.7, end: [0.45, 0.95, -0.2], appearAt: 0.36, r0: 0.03, r1: 0.012 },
    { anchorY: 0.75, end: [-0.5, 1.0, 0.15], appearAt: 0.38, r0: 0.028, r1: 0.011 },
    // Fine twigs
    { anchorY: 1.6, end: [0.45, 1.95, 0.05], appearAt: 0.62, r0: 0.012, r1: 0.005 },
    { anchorY: 1.55, end: [-0.4, 1.9, -0.08], appearAt: 0.64, r0: 0.012, r1: 0.005 },
    { anchorY: 1.35, end: [0.7, 1.55, 0.05], appearAt: 0.58, r0: 0.014, r1: 0.005 },
    { anchorY: 1.3, end: [-0.65, 1.5, -0.05], appearAt: 0.6, r0: 0.014, r1: 0.005 },
  ];

  for (const limb of limbDefs) {
    // Find approx trunk x,z at anchorY
    const t = (limb.anchorY - 0) / 1.7;
    const sx = Math.sin(t * Math.PI * 2) * 0.06;
    const sz = Math.cos(t * Math.PI * 1.5) * 0.03;
    branches.push({
      start: new THREE.Vector3(sx, limb.anchorY, sz),
      end: new THREE.Vector3(...limb.end),
      radiusStart: limb.r0,
      radiusEnd: limb.r1,
      appearAt: limb.appearAt,
      sway: 0.01 + (1 - limb.r0) * 0.02,
    });
  }

  return branches;
}

function leafPositions(branches: BranchDef[], count: number) {
  const positions: THREE.Vector3[] = [];
  const outer = branches.filter((b) => b.appearAt > 0.25);
  for (let i = 0; i < count; i++) {
    const b = outer[i % outer.length];
    const t = 0.35 + (i / count) * 0.6;
    const p = new THREE.Vector3().lerpVectors(b.start, b.end, t);
    p.x += (Math.sin(i * 12.9898) * 0.5 + 0.5 - 0.5) * 0.22;
    p.y += (Math.sin(i * 78.233) * 0.5 + 0.5 - 0.5) * 0.12;
    p.z += (Math.sin(i * 45.164) * 0.5 + 0.5 - 0.5) * 0.22;
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
  const ref = useRef<THREE.Mesh>(null);
  const visible = growth >= def.appearAt - 0.05;
  const scaleY = smoothstep(def.appearAt - 0.05, def.appearAt + 0.08, growth);

  const { position, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(def.end, def.start);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(def.start, def.end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { position: mid, quaternion: quat, length };
  }, [def]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const sway =
      Math.sin(t * 0.7 + def.appearAt * 10) * def.sway * scaleY +
      wind.x * def.sway * 0.8;
    ref.current.rotation.z = sway;
    ref.current.rotation.x = wind.y * def.sway * 0.4;
  });

  if (!visible) return null;

  return (
    <mesh
      ref={ref}
      position={position}
      quaternion={quaternion}
      scale={[scaleY, scaleY, scaleY]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry
        args={[def.radiusEnd, def.radiusStart, length, 8]}
      />
      <meshStandardMaterial
        color="#4A3728"
        roughness={0.92}
        metalness={0.02}
      />
    </mesh>
  );
}

function Seed({ growth }: { growth: number }) {
  const crack = smoothstep(0.02, 0.1, growth);
  const hide = smoothstep(0.08, 0.18, growth);
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.05;
  });

  if (hide > 0.98) return null;

  return (
    <group ref={ref} position={[0, 0.08, 0]} scale={1 - hide * 0.5}>
      <mesh castShadow position={[-0.012 * crack, 0, 0]} rotation={[0, 0, -crack * 0.4]}>
        <sphereGeometry args={[0.055, 16, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#6B5344" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.012 * crack, 0, 0]} rotation={[0, Math.PI, crack * 0.4]}>
        <sphereGeometry args={[0.055, 16, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#5C4638" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Sprout({ growth }: { growth: number }) {
  const emerge = smoothstep(0.05, 0.14, growth);
  const fade = smoothstep(0.14, 0.28, growth);
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.2) * 0.04 * emerge;
  });

  if (emerge < 0.01 || fade > 0.99) return null;

  return (
    <group ref={ref} position={[0, 0.06, 0]} scale={[emerge * (1 - fade * 0.3), emerge, emerge]}>
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.16, 6]} />
        <meshStandardMaterial color="#4F7A3E" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.03, 0.14, 0]} rotation={[0, 0, -0.6]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#6B9A4E" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.025, 0.12, 0.01]} rotation={[0, 0, 0.5]}>
        <sphereGeometry args={[0.028, 8, 6]} />
        <meshStandardMaterial color="#5E8E42" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Roots({ growth }: { growth: number }) {
  const show = smoothstep(0.2, 0.4, growth);
  if (show < 0.01) return null;
  return (
    <group>
      {[
        [0.12, 0.02, 0.08, 0.8],
        [-0.1, 0.015, 0.1, -0.5],
        [0.05, 0.01, -0.12, 0.3],
      ].map((r, i) => (
        <mesh
          key={i}
          castShadow
          position={[r[0] * show, r[1], r[2] * show]}
          rotation={[0.2, r[3], 1.2]}
          scale={show}
        >
          <cylinderGeometry args={[0.012, 0.02, 0.18, 5]} />
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
      const appear = 0.22 + (i / positions.length) * 0.55;
      const s = smoothstep(appear, appear + 0.1, growth);
      if (s < 0.01) {
        dummy.scale.setScalar(0);
      } else {
        const p = positions[i];
        const sway =
          Math.sin(t * 1.1 + i * 0.4) * 0.03 + wind.x * 0.06;
        const swayY = Math.cos(t * 0.9 + i * 0.3) * 0.015 + wind.y * 0.02;
        dummy.position.set(p.x + sway, p.y + swayY, p.z);
        dummy.scale.setScalar(s * (0.7 + (i % 5) * 0.08));
        dummy.rotation.set(
          Math.sin(t * 0.5 + i) * 0.2,
          i * 0.7,
          Math.cos(t * 0.4 + i) * 0.15 + wind.x * 0.1
        );
      }
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} castShadow>
      <sphereGeometry args={[0.07, 6, 5]} />
      <meshStandardMaterial
        color={colors.leaf}
        roughness={0.85}
        metalness={0}
      />
    </instancedMesh>
  );
}

export function Bonsai() {
  const growth = useExperienceStore((s) => s.growth);
  const wind = useExperienceStore((s) => s.wind);
  const branches = useMemo(() => buildBranches(), []);
  const leaves = useMemo(() => leafPositions(branches, 180), [branches]);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    // Subtle overall life
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.03;
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
      {/* Secondary leaf color accents */}
      <LeafAccents positions={leaves} growth={growth} wind={wind} />
    </group>
  );
}

function LeafAccents({
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
  const color = SEASON_CONFIG[season].leafSecondary;
  const subset = useMemo(
    () => positions.filter((_, i) => i % 3 === 0),
    [positions]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < subset.length; i++) {
      const appear = 0.3 + (i / subset.length) * 0.5;
      const s = smoothstep(appear, appear + 0.12, growth);
      const p = subset[i];
      dummy.position.set(
        p.x + 0.04 + Math.sin(t + i) * 0.02 + wind.x * 0.04,
        p.y - 0.02,
        p.z + 0.03
      );
      dummy.scale.setScalar(s * 0.55);
      dummy.rotation.set(0.3, i, wind.x * 0.08);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, subset.length]} castShadow>
      <sphereGeometry args={[0.055, 5, 4]} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </instancedMesh>
  );
}
