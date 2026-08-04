"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG } from "@/lib/seasons";

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

type Limb = {
  points: THREE.Vector3[];
  radius: number;
  appearAt: number;
  sway: number;
};

/** Classic informal upright bonsai silhouette — twisted trunk, layered pads */
function buildLimbs(): Limb[] {
  const trunk: Limb = {
    points: [
      new THREE.Vector3(0, 0.0, 0),
      new THREE.Vector3(0.06, 0.18, 0.03),
      new THREE.Vector3(-0.08, 0.4, -0.04),
      new THREE.Vector3(0.1, 0.65, 0.05),
      new THREE.Vector3(-0.05, 0.92, -0.02),
      new THREE.Vector3(0.04, 1.2, 0.03),
      new THREE.Vector3(-0.02, 1.45, 0),
      new THREE.Vector3(0.01, 1.68, 0.01),
    ],
    radius: 0.078,
    appearAt: 0.1,
    sway: 0.001,
  };

  const arms: Limb[] = [
    {
      points: [
        new THREE.Vector3(0.06, 0.7, 0.03),
        new THREE.Vector3(0.28, 0.82, 0.12),
        new THREE.Vector3(0.52, 0.95, 0.18),
        new THREE.Vector3(0.68, 1.05, 0.14),
      ],
      radius: 0.028,
      appearAt: 0.28,
      sway: 0.01,
    },
    {
      points: [
        new THREE.Vector3(-0.04, 0.75, -0.02),
        new THREE.Vector3(-0.25, 0.88, -0.12),
        new THREE.Vector3(-0.48, 1.05, -0.18),
        new THREE.Vector3(-0.62, 1.18, -0.12),
      ],
      radius: 0.026,
      appearAt: 0.32,
      sway: 0.011,
    },
    {
      points: [
        new THREE.Vector3(0.03, 0.95, 0.01),
        new THREE.Vector3(0.22, 1.15, -0.15),
        new THREE.Vector3(0.4, 1.35, -0.28),
        new THREE.Vector3(0.48, 1.48, -0.22),
      ],
      radius: 0.022,
      appearAt: 0.4,
      sway: 0.014,
    },
    {
      points: [
        new THREE.Vector3(-0.02, 1.0, 0),
        new THREE.Vector3(-0.2, 1.2, 0.16),
        new THREE.Vector3(-0.38, 1.4, 0.28),
        new THREE.Vector3(-0.45, 1.52, 0.2),
      ],
      radius: 0.02,
      appearAt: 0.44,
      sway: 0.014,
    },
    {
      points: [
        new THREE.Vector3(0.01, 1.25, 0),
        new THREE.Vector3(0.12, 1.45, 0.08),
        new THREE.Vector3(0.22, 1.68, 0.06),
        new THREE.Vector3(0.18, 1.88, 0.02),
      ],
      radius: 0.016,
      appearAt: 0.52,
      sway: 0.016,
    },
    {
      points: [
        new THREE.Vector3(-0.01, 1.28, 0),
        new THREE.Vector3(-0.1, 1.48, -0.06),
        new THREE.Vector3(-0.18, 1.7, -0.04),
        new THREE.Vector3(-0.14, 1.9, 0),
      ],
      radius: 0.015,
      appearAt: 0.55,
      sway: 0.016,
    },
    {
      points: [
        new THREE.Vector3(0.05, 0.52, 0.02),
        new THREE.Vector3(0.22, 0.58, -0.1),
        new THREE.Vector3(0.38, 0.62, -0.16),
      ],
      radius: 0.024,
      appearAt: 0.35,
      sway: 0.01,
    },
    {
      points: [
        new THREE.Vector3(-0.05, 0.55, -0.01),
        new THREE.Vector3(-0.24, 0.62, 0.1),
        new THREE.Vector3(-0.4, 0.68, 0.14),
      ],
      radius: 0.022,
      appearAt: 0.37,
      sway: 0.01,
    },
    // Fine twigs for pads
    {
      points: [
        new THREE.Vector3(0.5, 0.98, 0.16),
        new THREE.Vector3(0.72, 1.08, 0.1),
        new THREE.Vector3(0.82, 1.12, 0.05),
      ],
      radius: 0.008,
      appearAt: 0.58,
      sway: 0.02,
    },
    {
      points: [
        new THREE.Vector3(-0.45, 1.08, -0.14),
        new THREE.Vector3(-0.68, 1.2, -0.08),
        new THREE.Vector3(-0.78, 1.28, -0.02),
      ],
      radius: 0.008,
      appearAt: 0.6,
      sway: 0.02,
    },
    {
      points: [
        new THREE.Vector3(0.35, 1.3, -0.22),
        new THREE.Vector3(0.55, 1.42, -0.18),
        new THREE.Vector3(0.62, 1.5, -0.1),
      ],
      radius: 0.007,
      appearAt: 0.62,
      sway: 0.022,
    },
    {
      points: [
        new THREE.Vector3(-0.32, 1.35, 0.22),
        new THREE.Vector3(-0.5, 1.48, 0.16),
        new THREE.Vector3(-0.58, 1.55, 0.08),
      ],
      radius: 0.007,
      appearAt: 0.64,
      sway: 0.022,
    },
  ];

  return [trunk, ...arms];
}

type FoliarPad = {
  center: THREE.Vector3;
  radius: number;
  appearAt: number;
  density: number;
};

function buildPads(): FoliarPad[] {
  return [
    { center: new THREE.Vector3(0.55, 1.0, 0.12), radius: 0.28, appearAt: 0.34, density: 42 },
    { center: new THREE.Vector3(-0.48, 1.1, -0.12), radius: 0.26, appearAt: 0.38, density: 40 },
    { center: new THREE.Vector3(0.38, 1.38, -0.2), radius: 0.24, appearAt: 0.46, density: 38 },
    { center: new THREE.Vector3(-0.35, 1.42, 0.2), radius: 0.22, appearAt: 0.5, density: 36 },
    { center: new THREE.Vector3(0.12, 1.75, 0.02), radius: 0.26, appearAt: 0.58, density: 44 },
    { center: new THREE.Vector3(-0.08, 1.78, -0.02), radius: 0.2, appearAt: 0.62, density: 30 },
    { center: new THREE.Vector3(0.32, 0.62, -0.12), radius: 0.18, appearAt: 0.4, density: 28 },
    { center: new THREE.Vector3(-0.3, 0.66, 0.1), radius: 0.17, appearAt: 0.42, density: 26 },
    { center: new THREE.Vector3(0.7, 1.1, 0.06), radius: 0.14, appearAt: 0.66, density: 22 },
    { center: new THREE.Vector3(-0.65, 1.22, -0.04), radius: 0.14, appearAt: 0.68, density: 22 },
  ];
}

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function TubeLimb({
  limb,
  growth,
  wind,
  index,
}: {
  limb: Limb;
  growth: number;
  wind: { x: number; y: number };
  index: number;
}) {
  const pivot = useRef<THREE.Group>(null);
  const eased = useRef(0);
  const visible = growth >= limb.appearAt - 0.08;

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(limb.points);
    const tubularSegments = Math.max(12, limb.points.length * 8);
    return new THREE.TubeGeometry(
      curve,
      tubularSegments,
      limb.radius,
      8,
      false
    );
  }, [limb]);

  useFrame((_, dt) => {
    if (!pivot.current) return;
    eased.current += (growth - eased.current) * Math.min(1, dt * 2.2);
    const reveal = smoothstep(
      limb.appearAt - 0.08,
      limb.appearAt + 0.12,
      eased.current
    );
    const t = performance.now() * 0.001;
    const sway =
      Math.sin(t * 0.65 + index) * limb.sway * reveal + wind.x * limb.sway * 0.85;
    pivot.current.rotation.z = sway;
    pivot.current.rotation.x = wind.y * limb.sway * 0.3;
    const s = Math.max(0.001, reveal);
    pivot.current.scale.set(s, s, s);
  });

  if (!visible && eased.current < limb.appearAt - 0.1) return null;

  return (
    <group ref={pivot}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={index === 0 ? "#3F2E22" : "#4A3728"}
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
}

function NeedleCanopy({
  pads,
  growth,
  wind,
}: {
  pads: FoliarPad[];
  growth: number;
  wind: { x: number; y: number };
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const colors = SEASON_CONFIG[season];
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const eased = useRef(0);

  const needles = useMemo(() => {
    const items: {
      pos: THREE.Vector3;
      appearAt: number;
      scale: number;
      hue: number;
      seed: number;
    }[] = [];
    let id = 0;
    for (const pad of pads) {
      for (let i = 0; i < pad.density; i++) {
        const u = hash(id + 1);
        const v = hash(id + 2);
        const w = hash(id + 3);
        // Flattened ellipsoid cloud (bonsai pad)
        const theta = u * Math.PI * 2;
        const phi = Math.acos(2 * v - 1);
        const r = Math.pow(w, 0.45) * pad.radius;
        const x = Math.sin(phi) * Math.cos(theta) * r;
        const y = Math.cos(phi) * r * 0.45;
        const z = Math.sin(phi) * Math.sin(theta) * r * 0.85;
        items.push({
          pos: new THREE.Vector3(
            pad.center.x + x,
            pad.center.y + y,
            pad.center.z + z
          ),
          appearAt: pad.appearAt + (i / pad.density) * 0.12,
          scale: 0.045 + hash(id + 4) * 0.055,
          hue: hash(id + 5),
          seed: id,
        });
        id++;
      }
    }
    return items;
  }, [pads]);

  const cPrimary = useMemo(() => new THREE.Color(colors.leaf), [colors.leaf]);
  const cSecondary = useMemo(
    () => new THREE.Color(colors.leafSecondary),
    [colors.leafSecondary]
  );

  useFrame(({ clock }, dt) => {
    if (!meshRef.current) return;
    eased.current += (growth - eased.current) * Math.min(1, dt * 2.2);
    const g = eased.current;
    const t = clock.elapsedTime;
    for (let i = 0; i < needles.length; i++) {
      const n = needles[i];
      const s = smoothstep(n.appearAt, n.appearAt + 0.1, g);
      if (s < 0.01) {
        dummy.scale.setScalar(0);
      } else {
        const sway =
          Math.sin(t * 1.05 + n.seed * 0.3) * 0.02 + wind.x * 0.045;
        const bob =
          Math.cos(t * 0.9 + n.seed * 0.25) * 0.01 + wind.y * 0.012;
        dummy.position.set(n.pos.x + sway, n.pos.y + bob, n.pos.z);
        const sc = n.scale * s;
        dummy.scale.set(sc * 1.15, sc * 0.7, sc * 1.05);
        dummy.rotation.set(
          Math.sin(t * 0.3 + n.seed) * 0.2,
          n.seed * 0.7,
          Math.cos(t * 0.25 + n.seed) * 0.15 + wind.x * 0.08
        );
      }
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      color.copy(n.hue > 0.55 ? cSecondary : cPrimary);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, needles.length]}
      castShadow
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 7, 6]} />
      <meshStandardMaterial roughness={0.82} metalness={0} />
    </instancedMesh>
  );
}

function Seed({ growth }: { growth: number }) {
  const crack = smoothstep(0.012, 0.085, growth);
  const hide = smoothstep(0.09, 0.2, growth);
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.22) * 0.04;
  });

  if (hide > 0.98) return null;

  return (
    <group ref={ref} position={[0, 0.11, 0]} scale={1 - hide * 0.45}>
      {/* Whole seed before crack */}
      <mesh castShadow position={[0, 0.02, 0]} scale={1 - crack * 0.85}>
        <sphereGeometry args={[0.058, 20, 16]} />
        <meshStandardMaterial color="#8B6848" roughness={0.88} />
      </mesh>
      {/* Split halves */}
      <mesh
        castShadow
        position={[-0.025 * crack, 0.015 * crack, 0]}
        rotation={[0.25, 0.1, -crack * 0.7]}
        scale={crack > 0.05 ? 1 : 0}
      >
        <sphereGeometry args={[0.052, 16, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#7A5A42" roughness={0.92} />
      </mesh>
      <mesh
        castShadow
        position={[0.025 * crack, 0.015 * crack, 0]}
        rotation={[0.25, 0.1 + Math.PI, crack * 0.7]}
        scale={crack > 0.05 ? 1 : 0}
      >
        <sphereGeometry args={[0.052, 16, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#6B4E38" roughness={0.92} />
      </mesh>
    </group>
  );
}

function Sprout({ growth }: { growth: number }) {
  const emerge = smoothstep(0.035, 0.12, growth);
  const fade = smoothstep(0.15, 0.3, growth);
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.05) * 0.05 * emerge;
  });

  if (emerge < 0.01 || fade > 0.99) return null;
  const s = emerge * (1 - fade * 0.4);

  return (
    <group ref={ref} position={[0, 0.08, 0]} scale={[s, s, s]}>
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.006, 0.01, 0.2, 6]} />
        <meshStandardMaterial color="#4F7A3E" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.038, 0.18, 0]} rotation={[0, 0, -0.75]}>
        <sphereGeometry args={[0.034, 8, 6]} />
        <meshStandardMaterial color="#6B9A4E" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.032, 0.15, 0.012]} rotation={[0, 0, 0.55]}>
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
        [0.1, 0.02, 0.07, 0.9],
        [-0.09, 0.015, 0.09, -0.55],
        [0.05, 0.012, -0.1, 0.3],
        [-0.06, 0.01, -0.08, -1.1],
      ].map((r, i) => (
        <mesh
          key={i}
          castShadow
          position={[r[0] * show, r[1], r[2] * show]}
          rotation={[0.3, r[3], 1.1]}
          scale={show}
        >
          <cylinderGeometry args={[0.009, 0.016, 0.15, 5]} />
          <meshStandardMaterial color="#3D2E22" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Bonsai() {
  const growth = useExperienceStore((s) => s.growth);
  const wind = useExperienceStore((s) => s.wind);
  const limbs = useMemo(() => buildLimbs(), []);
  const pads = useMemo(() => buildPads(), []);
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(performance.now() * 0.00007) * 0.02;
  });

  return (
    <group ref={group} position={[0.85, -0.92, 0]} scale={1.05}>
      <Seed growth={growth} />
      <Sprout growth={growth} />
      <Roots growth={growth} />
      {limbs.map((limb, i) => (
        <TubeLimb key={i} limb={limb} growth={growth} wind={wind} index={i} />
      ))}
      <NeedleCanopy pads={pads} growth={growth} wind={wind} />
    </group>
  );
}
