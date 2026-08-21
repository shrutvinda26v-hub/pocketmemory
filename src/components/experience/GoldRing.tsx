"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  MeshRefractionMaterial,
  RoundedBox,
  useEnvironment,
} from "@react-three/drei";
import * as THREE from "three";
import { createBrilliantGeometry } from "@/lib/diamondGeometry";
import { mulberry32 } from "@/lib/diamondGeometry";
import { getJourney } from "@/lib/journey";
import { lerp } from "@/lib/math";
import { useJourney } from "@/store/useJourney";

const GOLD = "#e0b35a";
const GOLD_DEEP = "#b8873a";

function Gold({ roughness = 0.18 }: { roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={GOLD}
      metalness={1}
      roughness={roughness}
      envMapIntensity={1.45}
      clearcoat={0.35}
      clearcoatRoughness={0.22}
      reflectivity={1}
    />
  );
}

function PaveCloud({
  count,
  builder,
}: {
  count: number;
  builder: (i: number, rng: () => number) => {
    p: THREE.Vector3;
    s: number;
    r: THREE.Euler;
  };
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  const transforms = useMemo(() => {
    const rng = mulberry32(count * 17 + 3);
    return Array.from({ length: count }).map((_, i) => builder(i, rng));
  }, [builder, count]);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => {
      dummy.position.copy(t.p);
      dummy.rotation.copy(t.r);
      dummy.scale.setScalar(t.s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <instancedMesh ref={mesh} args={[geo, undefined, count]}>
      <meshPhysicalMaterial
        color="#f6fbff"
        roughness={0.025}
        metalness={0.08}
        transmission={0.62}
        thickness={0.35}
        ior={2.3}
        envMapIntensity={2.1}
        iridescence={0.2}
        iridescenceIOR={1.4}
        iridescenceThicknessRange={[60, 240]}
      />
    </instancedMesh>
  );
}

function CenterDiamond({ geometry }: { geometry: THREE.BufferGeometry }) {
  const env = useEnvironment({ preset: "studio" });
  return (
    <group>
      <mesh geometry={geometry} frustumCulled={false}>
        <MeshRefractionMaterial
          envMap={env}
          ior={2.417}
          bounces={4}
          aberrationStrength={0.018}
          fresnel={1.1}
          fastChroma
          color="#ffffff"
          toneMapped
        />
      </mesh>
      <mesh geometry={geometry} scale={1.012} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#f4f8ff"
          metalness={0.05}
          roughness={0.02}
          transparent
          opacity={0.18}
          envMapIntensity={2.4}
          iridescence={0.22}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[80, 320]}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={0.12}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

export function GoldRing() {
  const root = useRef<THREE.Group>(null);
  const diamondG = useRef<THREE.Group>(null);
  const settingG = useRef<THREE.Group>(null);
  const shoulderG = useRef<THREE.Group>(null);
  const bandG = useRef<THREE.Group>(null);
  const screwL = useRef<THREE.Group>(null);
  const screwR = useRef<THREE.Group>(null);
  const boxG = useRef<THREE.Group>(null);
  const lidG = useRef<THREE.Group>(null);
  const axis = useRef<THREE.Mesh>(null);
  const shadows = useRef<THREE.Group>(null);
  const brilliant = useMemo(() => createBrilliantGeometry(), []);

  const platePave = useMemo(
    () => (i: number, rng: () => number) => {
      const col = i % 8;
      const row = Math.floor(i / 8);
      return {
        p: new THREE.Vector3(
          (col - 3.5) * 0.042,
          0.012,
          (row - 1.5) * 0.046
        ),
        s: 0.016 + rng() * 0.004,
        r: new THREE.Euler(rng() * 0.6, rng() * 1.2, rng() * 0.4),
      };
    },
    []
  );

  const shoulderPave = useMemo(
    () => (i: number, rng: () => number) => {
      const side = i < 28 ? -1 : 1;
      const k = i % 28;
      const col = k % 4;
      const row = Math.floor(k / 4);
      return {
        p: new THREE.Vector3(
          side * (0.34 + col * 0.028),
          0.02 - row * 0.038,
          (col - 1.5) * 0.03
        ),
        s: 0.015 + rng() * 0.004,
        r: new THREE.Euler(rng(), rng(), rng()),
      };
    },
    []
  );

  useFrame(() => {
    const { progress, intro } = useJourney.getState();
    const frame = getJourney(progress, intro);
    if (!root.current) return;

    const enterY = lerp(-2.85, 0, intro);
    root.current.position.y = enterY + frame.ringLift;
    root.current.rotation.y = frame.spinY;
    root.current.rotation.x = 0.22;
    root.current.scale.setScalar(1.15 * frame.ringScale * lerp(0.88, 1, intro));

    const e = frame.explode;
    if (diamondG.current) diamondG.current.position.y = 0.78 + e * 1.72;
    if (settingG.current) settingG.current.position.y = 0.46 + e * 0.82;
    if (shoulderG.current) shoulderG.current.position.y = 0.16 + e * 0.12;
    if (bandG.current) bandG.current.position.y = e * -1.28;
    if (screwL.current) {
      screwL.current.position.set(-0.3 - e * 0.42, 0.02 + e * 0.08, 0);
      screwL.current.visible = true;
    }
    if (screwR.current) {
      screwR.current.position.set(0.3 + e * 0.42, 0.02 + e * 0.08, 0);
    }
    if (axis.current) {
      const mat = axis.current.material as THREE.MeshBasicMaterial;
      mat.opacity = e * 0.55;
      axis.current.visible = e > 0.02;
    }
    if (boxG.current) {
      const show = frame.boxReveal > 0.02;
      boxG.current.visible = show;
      boxG.current.scale.setScalar(lerp(0.55, 1, frame.boxReveal));
      boxG.current.position.y = lerp(-2.1, -1.18, frame.boxReveal);
    }
    if (lidG.current) {
      lidG.current.rotation.x = lerp(-1.22, 0.02, frame.lidClose);
    }
    if (shadows.current) {
      shadows.current.position.y = enterY - 1.15 + frame.ringLift;
    }
  });

  return (
    <group>
      <mesh ref={axis} position={[0, 0.2, 0]} visible={false}>
        <cylinderGeometry args={[0.004, 0.004, 4.2, 8]} />
        <meshBasicMaterial color="#d4b06a" transparent opacity={0} />
      </mesh>

      <group ref={root}>
        <group ref={diamondG} position={[0, 0.78, 0]} scale={0.36} rotation={[0.08, 0.2, 0]}>
          <CenterDiamond geometry={brilliant} />
        </group>

        <group ref={settingG} position={[0, 0.46, 0]}>
          <RoundedBox args={[0.32, 0.13, 0.32]} radius={0.02} smoothness={4}>
            <Gold roughness={0.16} />
          </RoundedBox>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.2]} />
            <meshPhysicalMaterial
              color={GOLD_DEEP}
              metalness={1}
              roughness={0.28}
            />
          </mesh>
          <RoundedBox
            args={[0.38, 0.05, 0.34]}
            radius={0.04}
            smoothness={4}
            position={[0, -0.1, 0]}
          >
            <Gold roughness={0.2} />
          </RoundedBox>
          <PaveCloud count={32} builder={platePave} />
        </group>

        <group ref={shoulderG} position={[0, 0.16, 0]}>
          <RoundedBox args={[0.42, 0.055, 0.24]} radius={0.02} smoothness={3}>
            <Gold />
          </RoundedBox>
          <mesh position={[-0.38, -0.16, 0]} rotation={[0, 0, 0.18]}>
            <cylinderGeometry args={[0.055, 0.07, 0.42, 16]} />
            <Gold roughness={0.2} />
          </mesh>
          <mesh position={[0.38, -0.16, 0]} rotation={[0, 0, -0.18]}>
            <cylinderGeometry args={[0.055, 0.07, 0.42, 16]} />
            <Gold roughness={0.2} />
          </mesh>
          <PaveCloud count={56} builder={shoulderPave} />
          <group ref={screwL} position={[-0.3, 0.02, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.08, 12]} />
              <Gold roughness={0.14} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[0.03, 0.006, 0.01]} />
              <meshPhysicalMaterial color="#6a4318" metalness={1} roughness={0.3} />
            </mesh>
          </group>
          <group ref={screwR} position={[0.3, 0.02, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.08, 12]} />
              <Gold roughness={0.14} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[0.03, 0.006, 0.01]} />
              <meshPhysicalMaterial color="#6a4318" metalness={1} roughness={0.3} />
            </mesh>
          </group>
        </group>

        <group ref={bandG}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.82, 0.155, 32, 96]} />
            <Gold roughness={0.17} />
          </mesh>
          <RoundedBox args={[0.48, 0.09, 0.3]} radius={0.02} smoothness={3} position={[0, 0.14, 0]}>
            <Gold roughness={0.16} />
          </RoundedBox>
        </group>
      </group>

      <group ref={boxG} position={[0, -1.18, 0]} visible={false}>
        <RoundedBox args={[2.35, 0.42, 1.58]} radius={0.04} smoothness={4}>
          <meshPhysicalMaterial
            color="#163056"
            metalness={0.45}
            roughness={0.28}
            envMapIntensity={0.7}
          />
        </RoundedBox>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[2.05, 0.1, 1.32]} />
          <meshStandardMaterial color="#081428" roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[2.38, 0.025, 1.62]} />
          <Gold roughness={0.24} />
        </mesh>
        <group ref={lidG} position={[0, 0.24, -0.79]}>
          <RoundedBox args={[2.35, 0.2, 1.58]} radius={0.04} smoothness={4} position={[0, 0.1, 0.79]}>
            <meshPhysicalMaterial
              color="#1c3b68"
              metalness={0.5}
              roughness={0.26}
            />
          </RoundedBox>
          <mesh position={[0, 0.22, 0.79]}>
            <boxGeometry args={[0.22, 0.04, 0.48]} />
            <Gold />
          </mesh>
        </group>
      </group>

      <group ref={shadows}>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={10}
          blur={2.4}
          far={3}
          color="#02060f"
        />
      </group>
    </group>
  );
}
