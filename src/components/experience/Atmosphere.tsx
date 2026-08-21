"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useJourney } from "@/store/useJourney";
import { getJourney } from "@/lib/journey";
import { mulberry32 } from "@/lib/diamondGeometry";

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const rng = mulberry32(42);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * 6;
      positions[i * 3 + 1] = (rng() - 0.5) * 8;
      positions[i * 3 + 2] = (rng() - 0.5) * 5;
      speeds[i] = 0.015 + rng() * 0.04;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, delta) => {
    const points = ref.current;
    if (!points) return;
    const arr = points.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < speeds.length; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 4;
      if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = -4;
    }
    points.geometry.attributes.position.needsUpdate = true;
    points.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f5f3ee"
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </points>
  );
}

function Specks() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 40;
    const data = new Float32Array(count * 3);
    const rng = mulberry32(99);
    for (let i = 0; i < count; i++) {
      data[i * 3] = (rng() - 0.5) * 5;
      data[i * 3 + 1] = (rng() - 0.5) * 6;
      data[i * 3 + 2] = (rng() - 0.5) * 4;
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#d8b978"
        size={0.028}
        transparent
        opacity={0.16}
        depthWrite={false}
      />
    </points>
  );
}

function Glow() {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      8,
      size / 2,
      size / 2,
      size / 2
    );
    g.addColorStop(0, "rgba(245,243,238,0.34)");
    g.addColorStop(0.28, "rgba(216,185,120,0.12)");
    g.addColorStop(0.62, "rgba(17,16,14,0.04)");
    g.addColorStop(1, "rgba(17,16,14,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame(() => {
    if (!ref.current || !tex) return;
    const frame = getJourney(useJourney.getState().progress);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.42 + frame.glow * 0.38;
    ref.current.scale.setScalar(2.4 + frame.glow * 0.55);
  });

  if (!tex) return null;

  return (
    <mesh ref={ref} position={[0, 0.1, -0.4]}>
      <planeGeometry args={[4.2, 4.2]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function LightRays() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const frame = getJourney(useJourney.getState().progress);
    if (!group.current) return;
    group.current.visible = frame.lightRays > 0.01;
    group.current.rotation.y = state.clock.elapsedTime * 0.08;
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = frame.lightRays * (0.045 + (i % 3) * 0.012);
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[0, (i / 6) * Math.PI, 0.18 + i * 0.04]}
          position={[0, 0.05, 0]}
        >
          <planeGeometry args={[0.12, 4.8]} />
          <meshBasicMaterial
            color="#f5f3ee"
            transparent
            opacity={0.04}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Atmosphere() {
  return (
    <>
      <Glow />
      <LightRays />
      <Dust />
      <Specks />
    </>
  );
}
