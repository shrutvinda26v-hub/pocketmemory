"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG, goldenHourBoost } from "@/lib/seasons";

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Soft dust / fireflies when no heavy weather */
export function AmbientParticles() {
  const count = 40;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const progress = useExperienceStore((s) => s.progress);
  const wind = useExperienceStore((s) => s.wind);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const config = SEASON_CONFIG[season];
  const golden = goldenHourBoost(progress);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: 0.2 + hash(i) * 2.2,
        y: hash(i + 2) * 2.2,
        z: (hash(i + 4) - 0.5) * 1.8,
        speed: 0.1 + (i % 7) * 0.03,
        phase: i * 0.4,
        kind: i % 3,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    if (config.rainEnabled || config.snowEnabled) {
      for (let i = 0; i < count; i++) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
      mesh.current.instanceMatrix.needsUpdate = true;
      return;
    }

    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      let x = s.x + Math.sin(t * s.speed + s.phase) * 0.3 + wind.x * 0.4;
      let y = s.y;
      let z = s.z;
      let scale = 0;

      if (golden.fireflies && s.kind === 0) {
        y = s.y + Math.sin(t * 2 + s.phase) * 0.15;
        scale = 0.45 + Math.sin(t * 4 + s.phase) * 0.2;
      } else if (progress > 0.1 && !config.sunVisible) {
        scale = 0.12;
        y = s.y + Math.sin(t * 0.4 + s.phase) * 0.1;
      }

      dummy.position.set(x, y - 0.3, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false} raycast={() => null}>
      <sphereGeometry args={[0.03, 6, 4]} />
      <meshStandardMaterial
        color={golden.fireflies ? "#E8C96A" : config.particleColor}
        emissive={golden.fireflies ? "#E8C96A" : "#000000"}
        emissiveIntensity={golden.fireflies ? 0.8 : 0}
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/** Dense natural snowfall — clearly visible flakes */
export function Snowfall() {
  const count = 420;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const wind = useExperienceStore((s) => s.wind);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const enabled = season === "winter";

  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: 0.85 + (hash(i) - 0.5) * 5.2,
        y: hash(i + 3) * 4.5,
        z: (hash(i + 7) - 0.3) * 3.2,
        speed: 0.22 + hash(i + 11) * 0.4,
        drift: 0.25 + hash(i + 13) * 0.4,
        size: 0.025 + hash(i + 17) * 0.055,
        spin: 0.5 + hash(i + 19) * 2,
        phase: hash(i + 23) * Math.PI * 2,
      })),
    []
  );

  useFrame(({ clock }, dt) => {
    if (!mesh.current) return;
    if (!enabled) {
      for (let i = 0; i < count; i++) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
      mesh.current.instanceMatrix.needsUpdate = true;
      return;
    }

    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const f = flakes[i];
      f.y -= f.speed * dt;
      if (f.y < -1.3) {
        f.y = 3.4 + hash(i + Math.floor(t * 3)) * 0.6;
        f.x = 0.85 + (hash(i * 5 + Math.floor(t * 2)) - 0.5) * 4.5;
      }
      const sway = Math.sin(t * 0.7 + f.phase) * f.drift + wind.x * 0.5;
      dummy.position.set(
        f.x + sway,
        f.y,
        f.z + Math.cos(t * 0.45 + f.phase) * f.drift * 0.5
      );
      dummy.rotation.set(t * f.spin * 0.25, t * 0.15 + f.phase, 0);
      const sc = f.size * 36;
      dummy.scale.set(sc, sc * 0.75, sc);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      raycast={() => null}
    >
      <sphereGeometry args={[1, 7, 5]} />
      <meshBasicMaterial
        color="#FFFFFF"
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/** Monsoon rain — dense visible streaks across the scene */
export function Rainfall() {
  const count = 650;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const wind = useExperienceStore((s) => s.wind);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const enabled = season === "rain";

  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: 0.85 + (hash(i + 1) - 0.5) * 6.2,
        y: hash(i + 5) * 5.8,
        z: (hash(i + 9) - 0.15) * 3.6,
        speed: 5.2 + hash(i + 15) * 4,
        len: 0.1 + hash(i + 21) * 0.16,
        phase: hash(i + 27),
      })),
    []
  );

  useFrame((_, dt) => {
    if (!mesh.current) return;
    if (!enabled) {
      for (let i = 0; i < count; i++) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
      mesh.current.instanceMatrix.needsUpdate = true;
      return;
    }

    const windX = 0.15 + wind.x * 0.7;
    for (let i = 0; i < count; i++) {
      const d = drops[i];
      d.y -= d.speed * dt;
      d.x += windX * dt * 2.2;
      if (d.y < -1.6) {
        d.y = 3.6 + d.phase * 0.8;
        d.x = 0.85 + (hash(i + Math.floor(performance.now() * 0.02)) - 0.5) * 5.5;
        d.z = (hash(i + 40 + Math.floor(performance.now() * 0.01)) - 0.2) * 3.2;
      }

      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0.18, 0, -0.5 - windX * 0.45);
      dummy.scale.set(0.75, d.len * 70, 0.75);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      raycast={() => null}
    >
      <cylinderGeometry args={[0.008, 0.003, 1, 4]} />
      <meshBasicMaterial
        color="#C5D8E8"
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/** Autumn — falling leaves */
export function AutumnLeaves() {
  const count = 140;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const wind = useExperienceStore((s) => s.wind);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const enabled = season === "autumn";

  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: 0.85 + (hash(i) - 0.5) * 3.5,
        y: hash(i + 2) * 3.5,
        z: (hash(i + 4) - 0.3) * 2.2,
        speed: 0.15 + hash(i + 6) * 0.25,
        spin: hash(i + 8) * 3,
        phase: hash(i + 10) * Math.PI * 2,
        hue: hash(i + 12),
        size: 0.035 + hash(i + 14) * 0.04,
      })),
    []
  );

  useFrame(({ clock }, dt) => {
    if (!mesh.current) return;
    if (!enabled) {
      for (let i = 0; i < count; i++) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
      mesh.current.instanceMatrix.needsUpdate = true;
      return;
    }

    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const L = leaves[i];
      L.y -= L.speed * dt;
      if (L.y < -1.2) {
        L.y = 2.8 + hash(i + Math.floor(t)) * 0.5;
        L.x = 0.85 + (hash(i * 2 + Math.floor(t)) - 0.5) * 3.5;
      }
      dummy.position.set(
        L.x + Math.sin(t * 0.8 + L.phase) * 0.35 + wind.x * 0.4,
        L.y,
        L.z + Math.cos(t * 0.6 + L.phase) * 0.2
      );
      dummy.rotation.set(t * L.spin * 0.4, t * 0.5 + L.phase, t * L.spin * 0.25);
      dummy.scale.set(L.size * 2.2, L.size * 0.5, L.size * 1.4);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      if (L.hue > 0.55) color.set("#C8903A");
      else if (L.hue > 0.3) color.set("#B85A2E");
      else color.set("#D4A04A");
      mesh.current.setColorAt(i, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      raycast={() => null}
    >
      <sphereGeometry args={[1, 6, 4]} />
      <meshStandardMaterial roughness={0.85} metalness={0} />
    </instancedMesh>
  );
}

/** Bright summer sun — in front of the paper wall so it's visible */
export function SummerSun() {
  const season = useExperienceStore((s) => s.season);
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const show = useRef(0);
  const enabled = season === "summer";

  useFrame((_, dt) => {
    if (!group.current) return;
    show.current += ((enabled ? 1 : 0) - show.current) * Math.min(1, dt * 1.8);
    group.current.visible = show.current > 0.02;
    const s = show.current;
    group.current.scale.setScalar(0.85 + s * 0.55);
    if (core.current) {
      const m = core.current.material as THREE.MeshBasicMaterial;
      m.opacity = s;
    }
    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial;
      m.opacity = s * 0.55;
    }
  });

  return (
    <group ref={group} position={[2.0, 2.2, -0.9]}>
      <mesh ref={core}>
        <sphereGeometry args={[0.7, 28, 22]} />
        <meshBasicMaterial color="#FFE566" transparent opacity={1} />
      </mesh>
      <mesh ref={glow} scale={2.5}>
        <sphereGeometry args={[0.7, 20, 16]} />
        <meshBasicMaterial
          color="#FFC040"
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={4.2}>
        <sphereGeometry args={[0.7, 16, 12]} />
        <meshBasicMaterial
          color="#FFD080"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#FFD090" intensity={enabled ? 2.2 : 0} distance={28} decay={2} />
    </group>
  );
}

export function Lanterns() {
  const progress = useExperienceStore((s) => s.progress);
  const golden = goldenHourBoost(progress);
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        (golden.lanterns ? 0.6 : 0) + Math.sin(t * 1.5 + i) * 0.1;
      m.position.y = -0.2 + i * 0.15 + Math.sin(t * 0.6 + i) * 0.02;
    });
  });

  if (!golden.lanterns) return null;

  return (
    <group position={[0.85, -0.45, 0.35]}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0.35 + i * 0.2, 0, 0.2 - i * 0.15]}>
          <mesh
            ref={(el) => {
              refs.current[i] = el;
            }}
            castShadow
          >
            <sphereGeometry args={[0.05, 12, 10]} />
            <meshStandardMaterial
              color="#C4893A"
              emissive="#E8A040"
              emissiveIntensity={0.5}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.1, 6]} />
            <meshStandardMaterial color="#3A2F24" />
          </mesh>
          <pointLight
            color="#FFB060"
            intensity={golden.lanterns ? 0.35 : 0}
            distance={1.5}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}

export function Butterfly() {
  const isIdle = useExperienceStore((s) => s.isIdle);
  const growth = useExperienceStore((s) => s.growth);
  const season = useExperienceStore((s) => s.season);
  const group = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const show = useRef(0);
  const weatherOk = season === "summer" || season === "autumn";

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    show.current +=
      ((isIdle && growth > 0.15 && weatherOk ? 1 : 0) - show.current) * 0.02;
    group.current.scale.setScalar(show.current);

    const path = t * 0.35;
    group.current.position.set(
      0.85 + Math.sin(path) * 0.65,
      0.25 + Math.sin(path * 1.3) * 0.4,
      Math.cos(path * 0.8) * 0.45
    );
    group.current.rotation.y = path + Math.PI / 2;

    const flap = Math.sin(t * 14) * 0.7;
    if (wingL.current) wingL.current.rotation.y = 0.4 + flap;
    if (wingR.current) wingR.current.rotation.y = -0.4 - flap;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.015, 6, 4]} />
        <meshStandardMaterial color="#3A3530" />
      </mesh>
      <mesh ref={wingL} position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshStandardMaterial
          color="#C4896A"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={wingR} position={[0, 0, -0.02]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshStandardMaterial
          color="#B87A5C"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
