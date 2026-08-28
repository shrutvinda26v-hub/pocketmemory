import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "../experience/sim";
import { makeCircleSprite } from "../lib/textures";

type Props = {
  index: number;
  color: string;
  position: [number, number, number];
  onActivate: () => void;
};

export function Crystal({ index, color, position, onActivate }: Props) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.Sprite>(null);
  const gemColor = useMemo(() => new THREE.Color(color), [color]);
  const haloTex = useMemo(() => makeCircleSprite("#ffffff"), []);
  const base = useMemo(() => new THREE.Vector3(...position), [position]);
  const spin = useMemo(() => 0.18 + (index % 5) * 0.07, [index]);
  const phase = useMemo(() => index * 0.9, [index]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const glow = sim.crystalGlow[index];
    const floatY = Math.sin(t * 0.7 + phase) * 0.03;
    const hoverLift = (glow - 0.18) * 0.06;
    g.position.set(base.x, base.y + floatY + hoverLift, base.z);
    g.rotation.y += dt * (spin + glow * 0.8);
    g.rotation.z = Math.sin(t * 0.4 + phase) * 0.12;
    sim.crystalWorld[index].copy(g.position);

    if (inner.current) {
      const mat = inner.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(gemColor);
      mat.opacity = 0.35 + glow * 0.4;
    }
    if (light.current) {
      light.current.intensity = 0.25 + glow * 0.9;
    }
    if (halo.current) {
      const s = 0.42 + glow * 0.55;
      halo.current.scale.set(s, s, 1);
      const mat = halo.current.material as THREE.SpriteMaterial;
      mat.opacity = 0.18 + glow * 0.4;
      mat.color.copy(gemColor);
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh castShadow>
        <octahedronGeometry args={[0.085, 0]} />
        <meshPhysicalMaterial
          color={gemColor}
          roughness={0.08}
          metalness={0.15}
          transmission={0.72}
          thickness={0.6}
          ior={1.7}
          transparent
          opacity={0.92}
          emissive={gemColor}
          emissiveIntensity={0.55}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh scale={[0.55, 1.15, 0.55]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshPhysicalMaterial
          color={gemColor}
          roughness={0.12}
          metalness={0.2}
          transmission={0.55}
          thickness={0.4}
          transparent
          opacity={0.7}
          emissive={gemColor}
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh ref={inner} scale={0.38}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshBasicMaterial color={gemColor} transparent opacity={0.5} />
      </mesh>
      <sprite ref={halo} scale={0.5}>
        <spriteMaterial
          map={haloTex}
          color={gemColor}
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight ref={light} color={gemColor} intensity={0.4} distance={1.6} decay={2} />
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          onActivate();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
