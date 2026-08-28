import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "../experience/sim";
import { makeScaleTexture } from "../lib/textures";

function Toe({
  position,
  rotation,
  length,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, length / 2]} castShadow>
        <capsuleGeometry args={[0.018, length, 4, 8]} />
        <meshStandardMaterial color="#7ec9bc" roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.006, length + 0.028]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.01, 0.04, 6]} />
        <meshPhysicalMaterial
          color="#e8d8c8"
          roughness={0.25}
          metalness={0.15}
          clearcoat={0.4}
          transmission={0.15}
        />
      </mesh>
    </group>
  );
}

export function ReachingArm() {
  const group = useRef<THREE.Group>(null);
  const hand = useRef<THREE.Group>(null);
  const scaleTex = useMemo(() => makeScaleTexture(), []);
  const color = useMemo(() => new THREE.Color("#5ec4b6"), []);
  const dummy = useMemo(() => new THREE.Vector3(), []);
  const restQuat = useMemo(() => new THREE.Quaternion(), []);
  const aimQuat = useMemo(() => new THREE.Quaternion(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const z = useMemo(() => new THREE.Vector3(), []);
  const x = useMemo(() => new THREE.Vector3(), []);
  const y = useMemo(() => new THREE.Vector3(), []);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const p = THREE.MathUtils.smootherstep(sim.reach, 0, 1);
    g.visible = p > 0.02;
    if (!g.visible) return;

    dummy.lerpVectors(sim.reachFrom, sim.reachTo, p);
    const from = sim.reachFrom;
    g.position.lerp(from, 1 - Math.pow(0.0001, dt));
    g.position.copy(from);

    z.copy(dummy).sub(from).normalize();
    x.crossVectors(up, z).normalize();
    if (x.lengthSq() < 0.001) x.set(1, 0, 0);
    y.crossVectors(z, x).normalize();
    mat.makeBasis(x, y, z);
    aimQuat.setFromRotationMatrix(mat);
    restQuat.identity();
    g.quaternion.slerpQuaternions(restQuat, aimQuat, p);

    const stretch = from.distanceTo(dummy);
    g.scale.set(1, 1, Math.max(0.15, stretch / 0.42));

    color.copy(sim.toColor);
    const skin = (g.children[0] as THREE.Mesh | undefined)?.material as THREE.MeshStandardMaterial | undefined;
    if (skin) {
      skin.color.lerp(color, 0.15);
    }

    if (hand.current) {
      hand.current.position.z = 0.42;
      hand.current.rotation.z = (1 - p) * 0.4 * sim.reachSide;
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.18]} castShadow>
        <capsuleGeometry args={[0.042, 0.28, 6, 12]} />
        <meshStandardMaterial
          map={scaleTex}
          color="#6ecabb"
          roughness={0.58}
          metalness={0.04}
        />
      </mesh>
      <group ref={hand} position={[0, 0, 0.42]}>
        <mesh>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#7acfc0" roughness={0.55} map={scaleTex} />
        </mesh>
        <Toe position={[0.03, 0.01, 0.03]} rotation={[-0.2, 0.4, 0.2]} length={0.07} />
        <Toe position={[0.012, 0.02, 0.04]} rotation={[-0.1, 0.12, 0.05]} length={0.08} />
        <Toe position={[-0.012, 0.02, 0.04]} rotation={[-0.1, -0.12, -0.05]} length={0.08} />
        <Toe position={[-0.03, 0.01, 0.03]} rotation={[-0.2, -0.4, -0.2]} length={0.07} />
      </group>
    </group>
  );
}
