"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import {
  createBrilliantGeometry,
  createBrilliantWire,
  createRoughGeometry,
  createShardGeometry,
} from "@/lib/diamondGeometry";
import { useJourney } from "@/store/useJourney";
import { BAND_RADIUS, HEAD_Y, getJourney } from "@/lib/journey";
import { lerp } from "@/lib/math";

const PLATINUM = "#c8cac7";
const DIAMOND_SCALE = 0.38;

function Brilliant({ geometry }: { geometry: THREE.BufferGeometry }) {
  const mesh = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useFrame((state) => {
    const frame = getJourney(useJourney.getState().progress);
    const visible = frame.cutOpacity > 0.02;
    if (mesh.current) {
      mesh.current.visible = visible;
      mesh.current.scale.setScalar(frame.diamondScale);
      const mat = mesh.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = frame.cutOpacity;
      mat.roughness = lerp(0.32, 0.0, frame.polish);
      mat.envMapIntensity = lerp(0.55, 1.7, frame.polish);
    }
    if (shell.current) {
      shell.current.visible = visible;
      const mat = shell.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = frame.cutOpacity * lerp(0.18, 0.42, frame.polish);
      mat.roughness = lerp(0.25, 0.02, frame.polish);
      shell.current.scale.setScalar(frame.diamondScale * 1.01);
    }
    if (core.current) {
      const mat = core.current.material as THREE.MeshBasicMaterial;
      mat.opacity = frame.cutOpacity * lerp(0.14, 0.55, frame.polish);
      core.current.rotation.y = state.clock.elapsedTime * 0.35;
    }
  });

  return (
    <group>
      <mesh ref={mesh} geometry={geometry} frustumCulled={false}>
        <MeshTransmissionMaterial
          backside
          samples={isMobile ? 3 : 5}
          resolution={isMobile ? 192 : 384}
          thickness={1.4}
          chromaticAberration={0.07}
          anisotropy={0.12}
          ior={2.417}
          roughness={0.02}
          color="#f4f8ff"
          attenuationColor="#d9e7ff"
          attenuationDistance={0.9}
          envMapIntensity={1.35}
          toneMapped
          transparent
        />
      </mesh>
      <mesh ref={shell} geometry={geometry} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#f7fbff"
          metalness={0.05}
          roughness={0.04}
          transparent
          opacity={0.28}
          envMapIntensity={2.1}
          iridescence={0.18}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[80, 280]}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={core} scale={0.14}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color="#f7fbff"
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function RoughStone({ geometry }: { geometry: THREE.BufferGeometry }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const frame = getJourney(useJourney.getState().progress);
    if (!mesh.current) return;
    mesh.current.visible = frame.roughOpacity > 0.02;
    mesh.current.scale.setScalar(1.05 + (1 - frame.cutOpacity) * 0.06);
    const mat = mesh.current.material as THREE.MeshPhysicalMaterial;
    mat.opacity = frame.roughOpacity;
  });

  return (
    <mesh ref={mesh} geometry={geometry} frustumCulled={false}>
      <meshPhysicalMaterial
        color="#cfd6df"
        roughness={0.46}
        metalness={0.06}
        transmission={0.34}
        thickness={2.1}
        ior={2.17}
        transparent
        opacity={1}
        flatShading
        envMapIntensity={0.9}
        attenuationColor="#e7eef7"
        attenuationDistance={1.15}
      />
    </mesh>
  );
}

function CuttingGuides({ geometry }: { geometry: THREE.BufferGeometry }) {
  const group = useRef<THREE.Group>(null);
  const line = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    const frame = getJourney(useJourney.getState().progress);
    if (!group.current) return;
    group.current.visible = frame.guides > 0.02;
    group.current.scale.setScalar(1.12 + frame.guides * 0.06);
    if (line.current) {
      const mat = line.current.material as THREE.LineBasicMaterial;
      mat.opacity = frame.guides * 0.8;
    }
    group.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  const markers = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.2;
        return {
          pos: [Math.cos(a) * 1.45, 0.05, Math.sin(a) * 1.45] as Vec3,
          rot: [0, -a + Math.PI / 2, 0] as Vec3,
        };
      }),
    []
  );

  return (
    <group ref={group}>
      <lineSegments ref={line} geometry={geometry}>
        <lineBasicMaterial
          color="#d8b978"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </lineSegments>
      {markers.map((m, i) => (
        <group key={i} position={m.pos} rotation={m.rot}>
          <mesh>
            <boxGeometry args={[0.38, 0.005, 0.005]} />
            <meshBasicMaterial color="#d8b978" transparent opacity={0.65} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

type Vec3 = [number, number, number];

function SetGuides() {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const frame = getJourney(useJourney.getState().progress);
    if (!group.current) return;
    group.current.visible = frame.setGuides > 0.02;
    group.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat?.opacity !== undefined) mat.opacity = frame.setGuides * 0.5;
    });
  });

  return (
    <group ref={group} position={[0, HEAD_Y, 0]}>
      <mesh>
        <ringGeometry args={[0.34, 0.346, 64]} />
        <meshBasicMaterial
          color="#d8b978"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[0.004, 1.15, 0.004]} />
        <meshBasicMaterial color="#d8b978" transparent opacity={0.4} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.9, 0.004, 0.004]} />
        <meshBasicMaterial color="#d8b978" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

function Fragments() {
  const group = useRef<THREE.Group>(null);
  const shards = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const y = ((i % 5) - 2) * 0.1;
        return {
          geometry: createShardGeometry(i + 11),
          dir: new THREE.Vector3(
            Math.cos(a) * (0.85 + (i % 3) * 0.12),
            y,
            Math.sin(a) * (0.85 + (i % 4) * 0.1)
          ),
          spin: [0.4 + (i % 3) * 0.25, 0.5 + (i % 5) * 0.15, 0.2] as Vec3,
        };
      }),
    []
  );

  useFrame((_, delta) => {
    const frame = getJourney(useJourney.getState().progress);
    if (!group.current) return;
    group.current.visible = frame.fragments > 0.01;
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const shard = shards[i];
      const p = frame.fragments;
      mesh.position.copy(shard.dir).multiplyScalar(0.28 + p * 1.05);
      mesh.rotation.x += delta * shard.spin[0];
      mesh.rotation.y += delta * shard.spin[1];
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      mat.opacity = Math.sin(p * Math.PI) * 0.8;
      mesh.scale.setScalar(0.65 + p * 0.45);
    });
  });

  return (
    <group ref={group}>
      {shards.map((shard, i) => (
        <mesh key={i} geometry={shard.geometry}>
          <meshPhysicalMaterial
            color="#d7dde6"
            roughness={0.35}
            transmission={0.4}
            thickness={0.6}
            transparent
            opacity={0}
            flatShading
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function SparkleField() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 16;
    const data = new Float32Array(count * 3);
    const geo = createBrilliantGeometry();
    const pos = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor((i / count) * pos.count);
      data[i * 3] = pos.getX(idx) * 1.03;
      data[i * 3 + 1] = pos.getY(idx) * 1.03;
      data[i * 3 + 2] = pos.getZ(idx) * 1.03;
    }
    geo.dispose();
    return data;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const frame = getJourney(useJourney.getState().progress);
    const mat = ref.current.material as THREE.PointsMaterial;
    const pulse =
      0.3 + Math.abs(Math.sin(state.clock.elapsedTime * 7.2)) * 0.7;
    mat.opacity = frame.cutOpacity * frame.sparkle * pulse * 0.8;
    mat.size = 0.04 + frame.sparkle * 0.028;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f7fbff"
        size={0.05}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function PlatinumMaterial() {
  return (
    <meshPhysicalMaterial
      color={PLATINUM}
      metalness={1}
      roughness={0.16}
      envMapIntensity={1.2}
      transparent
      opacity={1}
    />
  );
}

function RingSetting() {
  const root = useRef<THREE.Group>(null);
  const band = useRef<THREE.Mesh>(null);
  const gallery = useRef<THREE.Group>(null);

  useFrame(() => {
    const frame = getJourney(useJourney.getState().progress);
    if (!root.current) return;
    root.current.visible = frame.ringOpacity > 0.02;
    root.current.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as THREE.MeshPhysicalMaterial | undefined;
      if (mat && "opacity" in mat && mat.transparent) {
        mat.opacity = frame.ringOpacity;
      }
    });
    if (band.current) {
      band.current.position.y = lerp(-0.55, 0, frame.ringExplode);
    }
    if (gallery.current) {
      gallery.current.position.y =
        HEAD_Y + lerp(-0.38, 0, frame.ringExplode);
      gallery.current.scale.setScalar(lerp(0.86, 1, frame.ringExplode));
    }
  });

  const prongAngles = [0.55, Math.PI - 0.55, Math.PI + 0.55, -0.55];

  return (
    <group ref={root}>
      <mesh ref={band}>
        <torusGeometry args={[BAND_RADIUS, 0.052, 20, 96]} />
        <meshPhysicalMaterial
          color={PLATINUM}
          metalness={1}
          roughness={0.18}
          envMapIntensity={1.15}
          transparent
          opacity={1}
        />
      </mesh>
      <group ref={gallery} position={[0, HEAD_Y, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <torusGeometry args={[0.13, 0.018, 12, 32]} />
          <PlatinumMaterial />
        </mesh>
        {prongAngles.map((angle) => (
          <Prong key={angle} angle={angle} />
        ))}
      </group>
    </group>
  );
}

function Prong({ angle }: { angle: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const frame = getJourney(useJourney.getState().progress);
    if (!ref.current) return;
    const close = frame.prongClose;
    const explode = frame.ringExplode;
    const radial = lerp(0.28, 0.125, explode);
    const lean = lerp(0.55, 0.18, close);
    ref.current.position.set(
      Math.cos(angle) * radial,
      0.02,
      Math.sin(angle) * radial
    );
    ref.current.rotation.z = -Math.cos(angle) * lean;
    ref.current.rotation.x = Math.sin(angle) * lean;
    ref.current.visible = frame.ringOpacity > 0.02;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.01, 0.016, 0.28, 8]} />
        <meshPhysicalMaterial
          color={PLATINUM}
          metalness={1}
          roughness={0.15}
          transparent
          opacity={1}
        />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <sphereGeometry args={[0.013, 10, 10]} />
        <meshPhysicalMaterial
          color={PLATINUM}
          metalness={1}
          roughness={0.1}
          transparent
          opacity={1}
        />
      </mesh>
    </group>
  );
}

export function Jewelry() {
  const root = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Group>(null);
  const brilliant = useMemo(() => createBrilliantGeometry(), []);
  const rough = useMemo(() => createRoughGeometry(11), []);
  const wire = useMemo(() => createBrilliantWire(), []);

  useFrame((state, delta) => {
    const frame = getJourney(useJourney.getState().progress);
    if (!root.current || !gem.current) return;
    root.current.rotation.y =
      frame.objectYaw * 0.32 + state.clock.elapsedTime * 0.1;
    root.current.rotation.x = frame.objectPitch;
    root.current.scale.setScalar(frame.objectScale);
    gem.current.position.y = HEAD_Y + frame.diamondY;
    gem.current.rotation.y += delta * 0.07;
  });

  return (
    <group ref={root}>
      <group ref={gem} scale={DIAMOND_SCALE}>
        <Brilliant geometry={brilliant} />
        <RoughStone geometry={rough} />
        <CuttingGuides geometry={wire} />
        <Fragments />
        <SparkleField />
      </group>
      <SetGuides />
      <RingSetting />
    </group>
  );
}
