"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { testimonials } from "@/data/content";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SEASON_CONFIG } from "@/lib/seasons";

function FloatingLeaf({
  id,
  index,
}: {
  id: string;
  index: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const setActiveTestimonial = useExperienceStore((s) => s.setActiveTestimonial);
  const activeTestimonial = useExperienceStore((s) => s.activeTestimonial);
  const wind = useExperienceStore((s) => s.wind);
  const season = useExperienceStore((s) => s.season);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const base = useMemo(
    () => ({
      x: -1.2 + (index % 4) * 0.7,
      y: 0.3 + (index % 3) * 0.5,
      z: 0.4 - index * 0.1,
      speed: 0.15 + (index % 5) * 0.04,
    }),
    [index]
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime * base.speed + phase;
    const held = activeTestimonial === id;
    if (held) {
      mesh.current.position.lerp(new THREE.Vector3(0.2, 0.6, 0.8), 0.05);
      mesh.current.scale.lerp(new THREE.Vector3(1.4, 1.4, 1.4), 0.05);
    } else {
      mesh.current.position.set(
        base.x + Math.sin(t) * 0.4 + wind.x * 0.3,
        base.y + Math.cos(t * 0.7) * 0.25,
        base.z + Math.sin(t * 0.5) * 0.2
      );
      mesh.current.rotation.set(t * 0.5, t * 0.3, t * 0.4 + wind.x * 0.2);
      mesh.current.scale.setScalar(1);
    }
  });

  return (
    <mesh
      ref={mesh}
      castShadow
      onClick={(e) => {
        e.stopPropagation();
        setActiveTestimonial(activeTestimonial === id ? null : id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[0.06, 8, 6]} />
      <meshStandardMaterial
        color={SEASON_CONFIG[season].leaf}
        roughness={0.8}
        flatShading
      />
    </mesh>
  );
}

export function TestimonialLeaves() {
  const section = useExperienceStore((s) => s.section);
  const show = section === "testimonials" || section === "finale";

  if (!show) return null;

  return (
    <group>
      {testimonials.map((t, i) => (
        <FloatingLeaf key={t.id} id={t.id} index={i} />
      ))}
    </group>
  );
}
