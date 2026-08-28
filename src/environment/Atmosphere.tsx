import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "../experience/sim";

export function EnergyStream() {
  const count = 16;
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const ref = useRef<THREE.Points>(null);
  const color = useMemo(() => new THREE.Color("#ffffff"), []);

  useFrame((state) => {
    const mat = ref.current?.material as THREE.PointsMaterial | undefined;
    const visible = sim.energy > 0.02;
    if (ref.current) ref.current.visible = visible;
    if (!visible || !mat) return;
    const t = state.clock.elapsedTime;
    color.copy(sim.toColor);
    mat.color.copy(color);
    mat.opacity = sim.energy * 0.45;
    const from = sim.reachTo;
    const to = sim.reachFrom;
    for (let i = 0; i < count; i++) {
      const u = (i / count + t * 0.22) % 1;
      positions[i * 3] = THREE.MathUtils.lerp(from.x, to.x, u);
      positions[i * 3 + 1] = THREE.MathUtils.lerp(from.y, to.y, u);
      positions[i * 3 + 2] = THREE.MathUtils.lerp(from.z, to.z, u);
    }
    const attr = ref.current?.geometry.attributes.position;
    if (attr) attr.needsUpdate = true;
  });

  return (
    <points ref={ref} visible={false} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        transparent
        opacity={0.4}
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}
