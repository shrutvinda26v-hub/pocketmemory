"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG } from "@/lib/seasons";
import { getTextures } from "@/lib/textures";
import { ensureSoundOnInteraction, getAmbientEngine } from "@/lib/sound";

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

function buildLimbs(): Limb[] {
  const trunk: Limb = {
    points: [
      new THREE.Vector3(0, 0.0, 0),
      new THREE.Vector3(0.07, 0.16, 0.04),
      new THREE.Vector3(-0.1, 0.38, -0.05),
      new THREE.Vector3(0.12, 0.62, 0.06),
      new THREE.Vector3(-0.08, 0.88, -0.03),
      new THREE.Vector3(0.06, 1.15, 0.04),
      new THREE.Vector3(-0.03, 1.4, -0.01),
      new THREE.Vector3(0.02, 1.62, 0.01),
      new THREE.Vector3(0.0, 1.78, 0),
    ],
    radius: 0.082,
    appearAt: 0.1,
    sway: 0.001,
  };

  const arms: Limb[] = [
    {
      points: [
        new THREE.Vector3(0.08, 0.68, 0.04),
        new THREE.Vector3(0.32, 0.8, 0.14),
        new THREE.Vector3(0.58, 0.94, 0.2),
        new THREE.Vector3(0.78, 1.06, 0.12),
      ],
      radius: 0.03,
      appearAt: 0.28,
      sway: 0.01,
    },
    {
      points: [
        new THREE.Vector3(-0.05, 0.72, -0.02),
        new THREE.Vector3(-0.28, 0.86, -0.14),
        new THREE.Vector3(-0.52, 1.04, -0.2),
        new THREE.Vector3(-0.7, 1.2, -0.1),
      ],
      radius: 0.028,
      appearAt: 0.32,
      sway: 0.011,
    },
    {
      points: [
        new THREE.Vector3(0.04, 0.95, 0.01),
        new THREE.Vector3(0.24, 1.18, -0.16),
        new THREE.Vector3(0.44, 1.4, -0.3),
        new THREE.Vector3(0.52, 1.55, -0.2),
      ],
      radius: 0.024,
      appearAt: 0.4,
      sway: 0.014,
    },
    {
      points: [
        new THREE.Vector3(-0.03, 1.0, 0),
        new THREE.Vector3(-0.22, 1.22, 0.18),
        new THREE.Vector3(-0.42, 1.42, 0.3),
        new THREE.Vector3(-0.5, 1.56, 0.18),
      ],
      radius: 0.022,
      appearAt: 0.44,
      sway: 0.014,
    },
    {
      points: [
        new THREE.Vector3(0.01, 1.28, 0),
        new THREE.Vector3(0.14, 1.5, 0.1),
        new THREE.Vector3(0.24, 1.72, 0.06),
        new THREE.Vector3(0.16, 1.95, 0.02),
      ],
      radius: 0.017,
      appearAt: 0.52,
      sway: 0.016,
    },
    {
      points: [
        new THREE.Vector3(-0.01, 1.3, 0),
        new THREE.Vector3(-0.12, 1.52, -0.08),
        new THREE.Vector3(-0.2, 1.74, -0.04),
        new THREE.Vector3(-0.12, 1.96, 0),
      ],
      radius: 0.016,
      appearAt: 0.55,
      sway: 0.016,
    },
    {
      points: [
        new THREE.Vector3(0.06, 0.5, 0.03),
        new THREE.Vector3(0.26, 0.56, -0.1),
        new THREE.Vector3(0.44, 0.6, -0.18),
      ],
      radius: 0.025,
      appearAt: 0.35,
      sway: 0.01,
    },
    {
      points: [
        new THREE.Vector3(-0.06, 0.52, -0.01),
        new THREE.Vector3(-0.28, 0.6, 0.12),
        new THREE.Vector3(-0.46, 0.66, 0.16),
      ],
      radius: 0.023,
      appearAt: 0.37,
      sway: 0.01,
    },
    {
      points: [
        new THREE.Vector3(0.55, 0.98, 0.16),
        new THREE.Vector3(0.78, 1.1, 0.08),
        new THREE.Vector3(0.9, 1.16, 0.02),
      ],
      radius: 0.009,
      appearAt: 0.58,
      sway: 0.02,
    },
    {
      points: [
        new THREE.Vector3(-0.5, 1.08, -0.14),
        new THREE.Vector3(-0.74, 1.22, -0.06),
        new THREE.Vector3(-0.86, 1.3, 0),
      ],
      radius: 0.009,
      appearAt: 0.6,
      sway: 0.02,
    },
    {
      points: [
        new THREE.Vector3(0.38, 1.35, -0.24),
        new THREE.Vector3(0.6, 1.48, -0.16),
        new THREE.Vector3(0.68, 1.58, -0.06),
      ],
      radius: 0.008,
      appearAt: 0.62,
      sway: 0.022,
    },
    {
      points: [
        new THREE.Vector3(-0.35, 1.38, 0.24),
        new THREE.Vector3(-0.55, 1.52, 0.14),
        new THREE.Vector3(-0.64, 1.6, 0.05),
      ],
      radius: 0.008,
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
  understory?: boolean;
};

function buildPads(): FoliarPad[] {
  // Cloud-pruned bonsai pads: dense outer shells + soft understory layers
  const cores: FoliarPad[] = [
    { center: new THREE.Vector3(0.62, 1.02, 0.12), radius: 0.36, appearAt: 0.34, density: 140 },
    { center: new THREE.Vector3(-0.55, 1.14, -0.1), radius: 0.34, appearAt: 0.38, density: 130 },
    { center: new THREE.Vector3(0.42, 1.42, -0.22), radius: 0.32, appearAt: 0.46, density: 120 },
    { center: new THREE.Vector3(-0.4, 1.46, 0.22), radius: 0.3, appearAt: 0.5, density: 115 },
    { center: new THREE.Vector3(0.1, 1.82, 0.02), radius: 0.34, appearAt: 0.58, density: 150 },
    { center: new THREE.Vector3(-0.08, 1.88, -0.02), radius: 0.28, appearAt: 0.62, density: 95 },
    { center: new THREE.Vector3(0.36, 0.6, -0.12), radius: 0.24, appearAt: 0.4, density: 80 },
    { center: new THREE.Vector3(-0.34, 0.64, 0.1), radius: 0.22, appearAt: 0.42, density: 75 },
    { center: new THREE.Vector3(0.78, 1.12, 0.04), radius: 0.2, appearAt: 0.66, density: 70 },
    { center: new THREE.Vector3(-0.72, 1.24, -0.02), radius: 0.2, appearAt: 0.68, density: 70 },
    { center: new THREE.Vector3(0.55, 1.52, -0.1), radius: 0.19, appearAt: 0.7, density: 58 },
    { center: new THREE.Vector3(-0.5, 1.55, 0.08), radius: 0.19, appearAt: 0.72, density: 58 },
    { center: new THREE.Vector3(0.22, 1.15, 0.18), radius: 0.16, appearAt: 0.55, density: 42 },
    { center: new THREE.Vector3(-0.18, 1.2, -0.16), radius: 0.15, appearAt: 0.56, density: 40 },
  ];
  const under: FoliarPad[] = cores.map((p, i) => ({
    center: p.center.clone().add(new THREE.Vector3(0, -0.06 - (i % 3) * 0.01, 0)),
    radius: p.radius * 0.78,
    appearAt: p.appearAt + 0.02,
    density: Math.floor(p.density * 0.35),
    understory: true,
  }));
  return [...cores, ...under];
}

/** Flat oval leaf card — reads more like real foliage than spheres */
function createLeafGeometry() {
  const geo = new THREE.SphereGeometry(1, 8, 6);
  geo.scale(1.15, 0.28, 0.72);
  geo.computeVertexNormals();
  return geo;
}

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Build a tapered tube along a curve */
function createTaperedTube(
  points: THREE.Vector3[],
  radius: number,
  tubularSegments = 48,
  radialSegments = 8
) {
  const curve = new THREE.CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const geo = new THREE.BufferGeometry();
  const verts: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const p = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radius * (1 - t * 0.62) * (0.92 + Math.sin(t * Math.PI * 3) * 0.06);

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const angle = v * Math.PI * 2;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const cx = -B.x * cos + N.x * sin;
      const cy = -B.y * cos + N.y * sin;
      const cz = -B.z * cos + N.z * sin;
      verts.push(p.x + r * cx, p.y + r * cy, p.z + r * cz);
      uvs.push(t * 2, v);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = a + radialSegments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function TubeLimb({
  limb,
  growth,
  wind,
  index,
  barkMap,
}: {
  limb: Limb;
  growth: number;
  wind: { x: number; y: number };
  index: number;
  barkMap?: THREE.Texture;
}) {
  const pivot = useRef<THREE.Group>(null);
  const eased = useRef(0);
  const visible = growth >= limb.appearAt - 0.08;

  const geometry = useMemo(
    () =>
      createTaperedTube(
        limb.points,
        limb.radius,
        Math.max(32, limb.points.length * 12),
        10
      ),
    [limb]
  );

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
    pivot.current.scale.setScalar(Math.max(0.001, reveal));
  });

  if (!visible) return null;

  return (
    <group ref={pivot}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={barkMap}
          color={barkMap ? "#e8ddd0" : index === 0 ? "#3F2E22" : "#4A3728"}
          roughness={0.96}
          metalness={0.01}
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
  const tipRef = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const hoveredLeaf = useExperienceStore((s) => s.hoveredLeaf);
  const leafRipple = useExperienceStore((s) => s.leafRipple);
  const cursor = useExperienceStore((s) => s.cursor);
  const setHoveredLeaf = useExperienceStore((s) => s.setHoveredLeaf);
  const triggerLeafRipple = useExperienceStore((s) => s.triggerLeafRipple);
  const colors = SEASON_CONFIG[season];
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const eased = useRef(0);
  const hoverStrength = useRef<Float32Array | null>(null);
  const leafGeo = useMemo(() => createLeafGeometry(), []);
  const tipGeo = useMemo(() => new THREE.ConeGeometry(0.28, 1.15, 5), []);

  const needles = useMemo(() => {
    const items: {
      pos: THREE.Vector3;
      appearAt: number;
      scale: number;
      hue: number;
      seed: number;
      layer: number;
    }[] = [];
    let id = 0;
    for (let p = 0; p < pads.length; p++) {
      const pad = pads[p];
      const isUnder = !!pad.understory;
      for (let i = 0; i < pad.density; i++) {
        const u = hash(id + 1);
        const v = hash(id + 2);
        const w = hash(id + 3);
        const theta = u * Math.PI * 2;
        // Flattened cloud-pad distribution (bonsai silhouette)
        const phi = Math.acos(2 * v - 1);
        const r = Math.pow(w, 0.32) * pad.radius;
        const yScale = isUnder ? 0.28 : 0.38;
        items.push({
          pos: new THREE.Vector3(
            pad.center.x + Math.sin(phi) * Math.cos(theta) * r,
            pad.center.y + Math.cos(phi) * r * yScale,
            pad.center.z + Math.sin(phi) * Math.sin(theta) * r * 0.88
          ),
          appearAt: pad.appearAt + (i / pad.density) * 0.12,
          scale: (isUnder ? 0.038 : 0.045) + hash(id + 4) * (isUnder ? 0.05 : 0.07),
          hue: isUnder ? hash(id + 5) * 0.4 : hash(id + 5),
          seed: id,
          layer: isUnder ? 0 : 1,
        });
        id++;
      }
    }
    return items;
  }, [pads]);

  if (!hoverStrength.current || hoverStrength.current.length !== needles.length) {
    hoverStrength.current = new Float32Array(needles.length);
  }

  const cPrimary = useMemo(() => new THREE.Color(colors.leaf), [colors.leaf]);
  const cSecondary = useMemo(
    () => new THREE.Color(colors.leafSecondary),
    [colors.leafSecondary]
  );
  const cHighlight = useMemo(() => {
    const c = new THREE.Color(colors.leafSecondary);
    c.offsetHSL(0.02, 0.12, 0.18);
    return c;
  }, [colors.leafSecondary]);
  const cShadow = useMemo(() => {
    const c = new THREE.Color(colors.leaf);
    c.offsetHSL(-0.02, -0.05, -0.18);
    return c;
  }, [colors.leaf]);

  useFrame(({ clock }, dt) => {
    if (!meshRef.current) return;
    eased.current += (growth - eased.current) * Math.min(1, dt * 2.2);
    const g = eased.current;
    const t = clock.elapsedTime;
    const hs = hoverStrength.current!;
    const rippleId = leafRipple?.id ?? -1;
    const rippleAge = leafRipple ? (performance.now() - leafRipple.at) / 1000 : 99;
    // Soft magnetic field from pointer (normalized -1..1 → canopy space)
    const magX = cursor.x * 0.55;
    const magY = cursor.y * 0.35;

    for (let i = 0; i < needles.length; i++) {
      const targetHover =
        hoveredLeaf === null
          ? 0
          : hoveredLeaf === i
            ? 1
            : needles[i].pos.distanceTo(needles[hoveredLeaf].pos) < 0.22
              ? 0.85
              : needles[i].pos.distanceTo(needles[hoveredLeaf].pos) < 0.42
                ? 0.45
                : needles[i].pos.distanceTo(needles[hoveredLeaf].pos) < 0.65
                  ? 0.18
                  : 0;
      hs[i] += (targetHover - hs[i]) * Math.min(1, dt * 12);

      const n = needles[i];
      const s = smoothstep(n.appearAt, n.appearAt + 0.1, g);
      if (s < 0.01) {
        dummy.scale.setScalar(0);
      } else {
        let ripple = 0;
        if (rippleAge < 1.35 && rippleId >= 0) {
          const d = n.pos.distanceTo(needles[rippleId].pos);
          const wave = rippleAge * 2.1 - d * 3.6;
          if (wave > 0 && wave < 1.35) {
            ripple = Math.sin(wave * Math.PI) * 0.1 * (1 - rippleAge / 1.35);
          }
        }

        const h = hs[i];
        // Cursor magnetism — nearby leaves lean toward pointer
        const toMagX = magX - n.pos.x;
        const toMagY = magY + 1.1 - n.pos.y;
        const magDist = Math.sqrt(toMagX * toMagX + toMagY * toMagY) + 0.001;
        const magFall = Math.max(0, 1 - magDist / 0.9) * 0.04 * (hoveredLeaf === null ? 1 : 0.35);

        const sway =
          Math.sin(t * 1.05 + n.seed * 0.3) * 0.014 +
          wind.x * 0.05 +
          h * 0.09 +
          ripple * 1.5 +
          toMagX * magFall;
        const bob =
          Math.cos(t * 0.9 + n.seed * 0.25) * 0.009 +
          wind.y * 0.014 +
          h * 0.12 +
          ripple * 1.35 +
          toMagY * magFall * 0.6;
        let pushX = 0;
        let pushZ = 0;
        if (hoveredLeaf !== null && h > 0.05) {
          const dx = n.pos.x - needles[hoveredLeaf].pos.x;
          const dz = n.pos.z - needles[hoveredLeaf].pos.z;
          pushX = dx * h * 0.42;
          pushZ = dz * h * 0.42;
        }
        dummy.position.set(n.pos.x + sway + pushX, n.pos.y + bob, n.pos.z + pushZ);
        const sc = n.scale * s * (1 + h * 0.85 + ripple * 4);
        dummy.scale.set(sc * 1.55, sc * 0.55, sc * 1.35);
        dummy.rotation.set(
          Math.sin(t * 0.3 + n.seed) * 0.22 + h * 1.05 + wind.y * 0.15,
          n.seed * 0.7 + h * 0.75,
          Math.cos(t * 0.25 + n.seed) * 0.2 + wind.x * 0.16 + h * 1.1
        );
      }
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      if (hs[i] > 0.2) color.copy(cHighlight);
      else if (n.layer === 0) color.copy(cShadow);
      else color.copy(n.hue > 0.55 ? cSecondary : cPrimary);
      meshRef.current.setColorAt(i, color);

      if (tipRef.current && i % 3 === 0) {
        const tipIdx = Math.floor(i / 3);
        if (s < 0.01) {
          dummy.scale.setScalar(0);
        } else {
          const tipScale = n.scale * 0.38 * s * (1 + hs[i] * 0.65);
          dummy.position.set(
            n.pos.x + wind.x * 0.025 + (hoveredLeaf !== null ? pushOffset(n, needles, hoveredLeaf, hs[i]).x : 0),
            n.pos.y + 0.022 + hs[i] * 0.035,
            n.pos.z + (hoveredLeaf !== null ? pushOffset(n, needles, hoveredLeaf, hs[i]).z : 0)
          );
          dummy.scale.set(tipScale * 0.45, tipScale * 1.55, tipScale * 0.45);
          dummy.rotation.set(0.45 + hs[i] * 0.4, n.seed, wind.x * 0.25 + hs[i] * 0.5);
        }
        dummy.updateMatrix();
        tipRef.current.setMatrixAt(tipIdx, dummy.matrix);
        color.copy(cSecondary);
        tipRef.current.setColorAt(tipIdx, color);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
    if (tipRef.current) {
      tipRef.current.instanceMatrix.needsUpdate = true;
      if (tipRef.current.instanceColor)
        tipRef.current.instanceColor.needsUpdate = true;
    }
  });

  const tipCount = Math.ceil(needles.length / 3);

  const onLeafMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId == null) return;
    setHoveredLeaf(e.instanceId);
    document.body.style.cursor = "pointer";
    ensureSoundOnInteraction();
    getAmbientEngine().playLeafRustle();
  };

  const onLeafClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId == null) return;
    ensureSoundOnInteraction();
    getAmbientEngine().playInteractionChime();
    getAmbientEngine().playLeafRustle();
    const n = needles[e.instanceId];
    // World offset matches Bonsai group placement
    triggerLeafRipple(e.instanceId, {
      x: n.pos.x + 0.85,
      y: n.pos.y - 0.92,
      z: n.pos.z,
    });
  };

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[leafGeo, undefined, needles.length]}
        castShadow
        frustumCulled={false}
        onPointerMove={onLeafMove}
        onPointerOut={() => {
          setHoveredLeaf(null);
          document.body.style.cursor = "auto";
        }}
        onClick={onLeafClick}
      >
        <meshStandardMaterial
          roughness={0.68}
          metalness={0}
          flatShading
          emissive="#2A4A28"
          emissiveIntensity={0.1}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      <instancedMesh
        ref={tipRef}
        args={[tipGeo, undefined, tipCount]}
        frustumCulled={false}
        raycast={() => null}
      >
        <meshStandardMaterial roughness={0.65} metalness={0} />
      </instancedMesh>
    </>
  );
}

function pushOffset(
  n: { pos: THREE.Vector3 },
  needles: { pos: THREE.Vector3 }[],
  hoveredLeaf: number,
  h: number
) {
  if (h < 0.05) return { x: 0, z: 0 };
  const dx = n.pos.x - needles[hoveredLeaf].pos.x;
  const dz = n.pos.z - needles[hoveredLeaf].pos.z;
  return { x: dx * h * 0.42, z: dz * h * 0.42 };
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
      <mesh castShadow position={[0, 0.02, 0]} scale={1 - crack * 0.85}>
        <sphereGeometry args={[0.06, 24, 18]} />
        <meshStandardMaterial color="#8B6848" roughness={0.88} />
      </mesh>
      <mesh
        castShadow
        position={[-0.028 * crack, 0.018 * crack, 0]}
        rotation={[0.25, 0.1, -crack * 0.75]}
        scale={crack > 0.05 ? 1 : 0}
      >
        <sphereGeometry args={[0.054, 16, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#7A5A42" roughness={0.92} />
      </mesh>
      <mesh
        castShadow
        position={[0.028 * crack, 0.018 * crack, 0]}
        rotation={[0.25, 0.1 + Math.PI, crack * 0.75]}
        scale={crack > 0.05 ? 1 : 0}
      >
        <sphereGeometry args={[0.054, 16, 12, 0, Math.PI]} />
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
      <mesh castShadow position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.006, 0.01, 0.22, 6]} />
        <meshStandardMaterial color="#4F7A3E" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.04, 0.2, 0]} rotation={[0, 0, -0.75]}>
        <sphereGeometry args={[0.036, 8, 6]} />
        <meshStandardMaterial color="#6B9A4E" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.034, 0.17, 0.012]} rotation={[0, 0, 0.55]}>
        <sphereGeometry args={[0.03, 8, 6]} />
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

function Moss({ growth }: { growth: number }) {
  const show = smoothstep(0.25, 0.45, growth);
  if (show < 0.01) return null;
  const clumps = [
    [0.06, 0.03, 0.05, 0.045],
    [-0.05, 0.025, 0.07, 0.038],
    [0.02, 0.02, -0.06, 0.042],
    [-0.08, 0.022, -0.03, 0.032],
    [0.1, 0.018, -0.02, 0.028],
  ] as const;
  return (
    <group>
      {clumps.map((c, i) => (
        <mesh
          key={i}
          castShadow
          position={[c[0], c[1], c[2]]}
          scale={show}
          rotation={[0.4, i * 0.7, 0.2]}
        >
          <sphereGeometry args={[c[3], 8, 6]} />
          <meshStandardMaterial
            color={i % 2 ? "#3F6B38" : "#4A7A42"}
            roughness={1}
            flatShading
          />
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
  const textures = useMemo(() => getTextures(), []);

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(performance.now() * 0.00007) * 0.02;
  });

  return (
    <group ref={group} position={[0.85, -0.92, 0]} scale={1.05}>
      <Seed growth={growth} />
      <Sprout growth={growth} />
      <Roots growth={growth} />
      <Moss growth={growth} />
      {limbs.map((limb, i) => (
        <TubeLimb
          key={i}
          limb={limb}
          growth={growth}
          wind={wind}
          index={i}
          barkMap={textures.bark}
        />
      ))}
      <NeedleCanopy pads={pads} growth={growth} wind={wind} />
    </group>
  );
}
