import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "../experience/sim";
import { makeDiamondTexture } from "../lib/textures";

type Props = {
  index: number;
  color: string;
  position: [number, number, number];
  onActivate: () => void;
};

export function Crystal({ index, color, position, onActivate }: Props) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const map = useMemo(() => makeDiamondTexture(color), [color]);
  const base = useMemo(() => new THREE.Vector3(...position), [position]);
  const phase = useMemo(() => index * 0.9, [index]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const glow = sim.crystalGlow[index];
    const floatY = Math.sin(t * 0.65 + phase) * 0.012;
    const hover = Math.max(0, glow - 0.18);
    g.position.set(base.x, base.y + floatY + hover * 0.03, base.z);
    g.quaternion.copy(camera.quaternion);
    g.rotateZ(Math.sin(t * 0.35 + phase) * 0.04);
    const s = 1 + hover * 0.12;
    g.scale.setScalar(s);
    sim.crystalWorld[index].copy(g.position);
  });

  return (
    <group ref={group} position={position} renderOrder={3}>
      <mesh>
        <planeGeometry args={[0.16, 0.22]} />
        <meshBasicMaterial
          map={map}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
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
        <circleGeometry args={[0.14, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
