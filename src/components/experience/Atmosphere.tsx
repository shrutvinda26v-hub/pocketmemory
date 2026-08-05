"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG, goldenHourBoost } from "@/lib/seasons";

/** Soft dust / autumn leaves — shared ambient motes */
export function AmbientParticles() {
  const count = 50;
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
        x: (Math.sin(i * 12.9) * 0.5 + 0.5) * 4 - 2,
        y: (Math.sin(i * 78.2) * 0.5 + 0.5) * 2.5,
        z: (Math.sin(i * 45.1) * 0.5 + 0.5) * 2 - 1,
        speed: 0.1 + (i % 7) * 0.03,
        phase: i * 0.4,
        kind: i % 3,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    // Hide when rain/snow systems own the weather
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
      let z = s.z + Math.cos(t * s.speed * 0.7 + s.phase) * 0.2;
      let scale = 0;

      if (golden.fireflies && s.kind === 0) {
        y = s.y + Math.sin(t * 2 + s.phase) * 0.15;
        scale = 0.35 + Math.sin(t * 4 + s.phase) * 0.15;
      } else if (progress > 0.75 && s.kind === 1) {
        y = ((s.y - t * 0.08 * s.speed) % 2.2 + 2.2) % 2.2;
        x += Math.sin(t + s.phase) * 0.2;
        scale = season === "autumn" || progress > 0.78 ? 0.55 : 0.25;
      } else if (config.blossomEnabled && s.kind === 2) {
        y = (s.y + t * 0.05) % 2.2;
        scale = 0.4;
      } else if (progress > 0.1) {
        scale = 0.15;
        y = s.y + Math.sin(t * 0.4 + s.phase) * 0.1;
      }

      dummy.position.set(x, y - 0.5, z);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(t * 0.2 + i, t * 0.1, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.03, 6, 4]} />
      <meshStandardMaterial
        color={golden.fireflies ? "#E8C96A" : config.particleColor}
        emissive={golden.fireflies ? "#E8C96A" : "#000000"}
        emissiveIntensity={golden.fireflies ? 0.8 : 0}
        transparent
        opacity={0.85}
        roughness={0.5}
      />
    </instancedMesh>
  );
}

/** Natural snowfall — soft drifting flakes */
export function Snowfall() {
  const count = 180;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const wind = useExperienceStore((s) => s.wind);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const enabled = SEASON_CONFIG[season].snowEnabled;

  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (hash(i) - 0.5) * 5.5,
        y: hash(i + 3) * 4.5,
        z: (hash(i + 7) - 0.5) * 3.5 - 0.2,
        speed: 0.12 + hash(i + 11) * 0.22,
        drift: 0.15 + hash(i + 13) * 0.25,
        size: 0.012 + hash(i + 17) * 0.028,
        spin: hash(i + 19) * 2,
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
      f.y -= f.speed * dt * 0.85;
      if (f.y < -1.2) {
        f.y = 3.2 + hash(i + Math.floor(t)) * 0.8;
        f.x = (hash(i * 3 + Math.floor(t * 2)) - 0.5) * 5.5;
      }
      const sway =
        Math.sin(t * 0.6 + f.phase) * f.drift + wind.x * 0.35;
      dummy.position.set(
        f.x + sway,
        f.y,
        f.z + Math.cos(t * 0.4 + f.phase) * f.drift * 0.4
      );
      dummy.rotation.set(t * f.spin * 0.3, t * 0.2 + f.phase, t * f.spin * 0.15);
      dummy.scale.setScalar(f.size * 22);
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
      <sphereGeometry args={[1, 6, 5]} />
      <meshStandardMaterial
        color="#F8FBFF"
        emissive="#E8F0F8"
        emissiveIntensity={0.15}
        transparent
        opacity={0.88}
        depthWrite={false}
        roughness={1}
      />
    </instancedMesh>
  );
}

/** Soft monsoon rain — thin streaks falling with wind */
export function Rainfall() {
  const count = 220;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const season = useExperienceStore((s) => s.season);
  const wind = useExperienceStore((s) => s.wind);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const enabled = SEASON_CONFIG[season].rainEnabled;

  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (hash(i + 1) - 0.5) * 6,
        y: hash(i + 5) * 5,
        z: (hash(i + 9) - 0.5) * 4,
        speed: 2.8 + hash(i + 15) * 2.2,
        len: 0.04 + hash(i + 21) * 0.06,
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

    const windX = wind.x * 0.55 + 0.08;
    for (let i = 0; i < count; i++) {
      const d = drops[i];
      d.y -= d.speed * dt;
      d.x += windX * dt * 1.4;
      if (d.y < -1.4) {
        d.y = 3.4 + d.phase;
        d.x = (hash(i + Math.floor(performance.now() * 0.01)) - 0.5) * 6;
      }
      if (d.x > 3.2) d.x = -3.2;
      if (d.x < -3.2) d.x = 3.2;

      dummy.position.set(d.x, d.y, d.z);
      // Tilt with wind — natural streak angle
      dummy.rotation.set(0, 0, -0.35 - windX * 0.5);
      dummy.scale.set(0.35, d.len * 28, 0.35);
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
      <cylinderGeometry args={[0.004, 0.002, 1, 4]} />
      <meshBasicMaterial
        color="#9BB0C0"
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/** Bright summer sun disc high in the sky */
export function SummerSun() {
  const season = useExperienceStore((s) => s.season);
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const show = useRef(0);
  const config = SEASON_CONFIG[season];

  useFrame((_, dt) => {
    if (!group.current) return;
    show.current += ((config.sunVisible ? 1 : 0) - show.current) * Math.min(1, dt * 1.4);
    group.current.visible = show.current > 0.02;
    group.current.scale.setScalar(0.55 + show.current * 0.45);
    const mats = group.current.children;
    mats.forEach((c) => {
      if (c instanceof THREE.Mesh) {
        const m = c.material as THREE.MeshStandardMaterial;
        if (m.opacity !== undefined) m.opacity = show.current * (c === glow.current ? 0.35 : 1);
        if (m.emissiveIntensity !== undefined)
          m.emissiveIntensity = show.current * (c === glow.current ? 0.6 : 1.4);
      }
    });
  });

  return (
    <group ref={group} position={[2.8, 3.2, -3.5]}>
      <mesh>
        <sphereGeometry args={[0.38, 24, 20]} />
        <meshStandardMaterial
          color="#FFE7A0"
          emissive="#FFC050"
          emissiveIntensity={1.4}
          roughness={0.35}
          transparent
          opacity={1}
        />
      </mesh>
      <mesh ref={glow} scale={2.1}>
        <sphereGeometry args={[0.38, 16, 12]} />
        <meshStandardMaterial
          color="#FFD070"
          emissive="#FFB040"
          emissiveIntensity={0.6}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#FFD090" intensity={1.1} distance={18} decay={2} />
    </group>
  );
}

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
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
  // Hide butterfly in heavy weather
  const weatherOk =
    !SEASON_CONFIG[season].rainEnabled && !SEASON_CONFIG[season].snowEnabled;

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
