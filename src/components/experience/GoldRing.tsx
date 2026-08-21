"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createBrilliantGeometry } from "@/lib/diamondGeometry";
import { getJourney } from "@/lib/journey";
import { lerp } from "@/lib/math";
import { useJourney } from "@/store/useJourney";

const GOLD = "#d4b06a";
const GOLD_DEEP = "#a67c3d";

function GoldMat({ roughness = 0.22 }: { roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={GOLD}
      metalness={1}
      roughness={roughness}
      envMapIntensity={1.35}
    />
  );
}

function PaveDots({
  count,
  radius,
  y,
  spread = 0.22,
}: {
  count: number;
  radius: number;
  y: number;
  spread?: number;
}) {
  const geo = useMemo(() => new THREE.OctahedronGeometry(0.028, 0), []);
  const positions = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const a = (i / count) * Math.PI * 2;
      const r = radius + ((i % 3) - 1) * spread * 0.15;
      return [Math.cos(a) * r, y + (i % 2) * 0.01, Math.sin(a) * r] as [
        number,
        number,
        number,
      ];
    });
  }, [count, radius, y, spread]);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p} geometry={geo} scale={0.55 + (i % 3) * 0.08}>
          <meshPhysicalMaterial
            color="#f4f8ff"
            roughness={0.04}
            metalness={0.08}
            transmission={0.45}
            thickness={0.4}
            envMapIntensity={1.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export function GoldRing() {
  const root = useRef<THREE.Group>(null);
  const diamondG = useRef<THREE.Group>(null);
  const settingG = useRef<THREE.Group>(null);
  const shoulderG = useRef<THREE.Group>(null);
  const bandG = useRef<THREE.Group>(null);
  const boxG = useRef<THREE.Group>(null);
  const lidG = useRef<THREE.Group>(null);
  const brilliant = useMemo(() => createBrilliantGeometry(), []);

  useFrame(() => {
    const { progress, intro } = useJourney.getState();
    const frame = getJourney(progress, intro);
    if (!root.current) return;

    const enterY = lerp(-2.6, 0, intro);
    root.current.position.y = enterY + frame.ringLift;
    root.current.rotation.y = frame.spinY;
    root.current.rotation.x = 0.18;
    root.current.scale.setScalar(frame.ringScale * lerp(0.92, 1, intro));
    const e = frame.explode;
    if (diamondG.current) diamondG.current.position.y = 0.72 + e * 1.55;
    if (settingG.current) settingG.current.position.y = 0.42 + e * 0.72;
    if (shoulderG.current) shoulderG.current.position.y = 0.18 + e * 0.08;
    if (bandG.current) bandG.current.position.y = e * -1.15;

    if (boxG.current) {
      boxG.current.visible = frame.boxReveal > 0.02;
      boxG.current.scale.setScalar(lerp(0.4, 1, frame.boxReveal));
      boxG.current.position.y = lerp(-1.8, -1.05, frame.boxReveal) - enterY;
    }
    if (lidG.current) {
      lidG.current.rotation.x = lerp(-1.15, 0, frame.lidClose);
    }
  });

  return (
    <group>
      <group ref={root}>
        <group ref={diamondG} position={[0, 0.72, 0]} scale={0.34} rotation={[0.12, 0, 0]}>
          <mesh geometry={brilliant}>
            <meshPhysicalMaterial
              color="#eef4ff"
              metalness={0.1}
              roughness={0.02}
              transmission={0.7}
              thickness={1.3}
              ior={2.4}
              envMapIntensity={1.7}
              iridescence={0.14}
              iridescenceIOR={1.5}
              iridescenceThicknessRange={[80, 280]}
            />
          </mesh>
        </group>

        <group ref={settingG} position={[0, 0.42, 0]}>
          <mesh>
            <boxGeometry args={[0.28, 0.12, 0.28]} />
            <GoldMat roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[0.22, 0.04, 0.22]} />
            <meshPhysicalMaterial color={GOLD_DEEP} metalness={1} roughness={0.28} />
          </mesh>
          <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.035, 10, 24]} />
            <GoldMat />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.22, 0.24, 0.045, 32]} />
            <GoldMat roughness={0.2} />
          </mesh>
          <PaveDots count={18} radius={0.16} y={-0.13} />
        </group>

        <group ref={shoulderG} position={[0, 0.18, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.07, 12, 48, Math.PI]} />
            <GoldMat roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <boxGeometry args={[0.38, 0.05, 0.22]} />
            <GoldMat />
          </mesh>
          <PaveDots count={22} radius={0.42} y={0.02} spread={0.1} />
          <mesh position={[-0.28, -0.12, 0]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.03, 0.03, 0.12, 10]} />
            <GoldMat roughness={0.16} />
          </mesh>
          <mesh position={[0.28, -0.12, 0]} rotation={[0, 0, -0.15]}>
            <cylinderGeometry args={[0.03, 0.03, 0.12, 10]} />
            <GoldMat roughness={0.16} />
          </mesh>
        </group>

        <group ref={bandG}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.78, 0.14, 24, 80]} />
            <GoldMat roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.42, 0.08, 0.28]} />
            <GoldMat roughness={0.18} />
          </mesh>
        </group>
      </group>

      <group ref={boxG} position={[0, -1.05, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.1, 0.38, 1.45]} />
          <meshPhysicalMaterial
            color="#152544"
            metalness={0.35}
            roughness={0.35}
            envMapIntensity={0.6}
          />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[1.85, 0.08, 1.22]} />
          <meshStandardMaterial color="#0b1a33" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[2.14, 0.03, 1.49]} />
          <GoldMat roughness={0.25} />
        </mesh>
        <group ref={lidG} position={[0, 0.22, -0.72]}>
          <mesh position={[0, 0.12, 0.72]}>
            <boxGeometry args={[2.1, 0.22, 1.45]} />
            <meshPhysicalMaterial
              color="#1a335c"
              metalness={0.4}
              roughness={0.32}
            />
          </mesh>
          <mesh position={[0, 0.24, 0.72]}>
            <boxGeometry args={[0.18, 0.04, 0.42]} />
            <GoldMat />
          </mesh>
        </group>
      </group>
    </group>
  );
}
