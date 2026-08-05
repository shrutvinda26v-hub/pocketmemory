"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";

/** Soft golden sparkles when a leaf is clicked */
export function LeafSparkles() {
  const leafRipple = useExperienceStore((s) => s.leafRipple);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 28;
  const origin = useRef(new THREE.Vector3(0.85, 0.5, 0));
  const lastRipple = useRef(0);
  const velocities = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        v: new THREE.Vector3(),
        life: 99,
      })),
    []
  );

  useFrame((_, dt) => {
    if (!mesh.current) return;

    if (leafRipple && leafRipple.at !== lastRipple.current) {
      lastRipple.current = leafRipple.at;
      origin.current.set(
        0.7 + Math.random() * 0.4,
        0.3 + Math.random() * 1.0,
        -0.15 + Math.random() * 0.3
      );
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const elev = Math.random() * Math.PI * 0.7;
        velocities[i].v.set(
          Math.cos(a) * Math.sin(elev),
          Math.cos(elev) * 0.9 + 0.35,
          Math.sin(a) * Math.sin(elev)
        ).multiplyScalar(0.55 + Math.random() * 0.7);
        velocities[i].life = 0;
      }
    }

    for (let i = 0; i < count; i++) {
      const p = velocities[i];
      p.life += dt;
      if (p.life > 1.1) {
        dummy.scale.setScalar(0);
      } else {
        const t = p.life;
        dummy.position.set(
          origin.current.x + p.v.x * t,
          origin.current.y + p.v.y * t - t * t * 0.55,
          origin.current.z + p.v.z * t
        );
        dummy.scale.setScalar(Math.max(0, (1 - t / 1.1) * 0.04));
      }
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
      <sphereGeometry args={[1, 6, 4]} />
      <meshStandardMaterial
        color="#F0D78C"
        emissive="#E8C96A"
        emissiveIntensity={1.1}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
