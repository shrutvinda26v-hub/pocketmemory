"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";

/** Soft golden sparkles when a leaf is clicked — spawn at the leaf */
export function LeafSparkles() {
  const leafRipple = useExperienceStore((s) => s.leafRipple);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 36;
  const origin = useRef(new THREE.Vector3(0.85, 0.5, 0));
  const lastRipple = useRef(0);
  const velocities = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        v: new THREE.Vector3(),
        life: 99,
        spin: 0,
      })),
    []
  );

  useFrame((_, dt) => {
    if (!mesh.current) return;

    if (leafRipple && leafRipple.at !== lastRipple.current) {
      lastRipple.current = leafRipple.at;
      origin.current.set(leafRipple.x, leafRipple.y, leafRipple.z);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const elev = Math.random() * Math.PI * 0.75;
        velocities[i].v
          .set(
            Math.cos(a) * Math.sin(elev),
            Math.cos(elev) * 0.95 + 0.4,
            Math.sin(a) * Math.sin(elev)
          )
          .multiplyScalar(0.45 + Math.random() * 0.85);
        velocities[i].life = 0;
        velocities[i].spin = (Math.random() - 0.5) * 6;
      }
    }

    for (let i = 0; i < count; i++) {
      const p = velocities[i];
      p.life += dt;
      if (p.life > 1.25) {
        dummy.scale.setScalar(0);
      } else {
        const t = p.life;
        const fade = 1 - t / 1.25;
        dummy.position.set(
          origin.current.x + p.v.x * t,
          origin.current.y + p.v.y * t - t * t * 0.6,
          origin.current.z + p.v.z * t
        );
        dummy.rotation.z = t * p.spin;
        dummy.scale.setScalar(Math.max(0, fade * 0.045));
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
        emissiveIntensity={1.25}
        transparent
        opacity={0.92}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
