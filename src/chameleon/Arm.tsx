import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "../experience/sim";
import { makeScaleTexture } from "../lib/textures";

const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _hand = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _z = new THREE.Vector3();
const _color = new THREE.Color();

function aim(object: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3) {
  _dir.copy(to).sub(from);
  const len = _dir.length();
  if (len < 0.0001) return 0;
  _z.copy(_dir).normalize();
  object.position.copy(from).addScaledVector(_z, len * 0.5);
  object.quaternion.setFromUnitVectors(_up, _z);
  return len;
}

export function ReachingArm() {
  const group = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Mesh>(null);
  const lower = useRef<THREE.Mesh>(null);
  const hand = useRef<THREE.Group>(null);
  const scaleTex = useMemo(() => makeScaleTexture(), []);
  const skin = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: scaleTex,
        color: "#6ecabb",
        roughness: 0.58,
        metalness: 0.04,
      }),
    [scaleTex],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = THREE.MathUtils.smootherstep(sim.reach, 0.02, 1);
    g.visible = p > 0.02;
    if (!g.visible) return;

    _from.copy(sim.reachFrom);
    _to.copy(sim.reachTo);
    const full = _from.distanceTo(_to);
    const maxReach = 0.52;
    const reachLen = Math.min(full, maxReach) * p;
    _dir.copy(_to).sub(_from).normalize();
    _hand.copy(_from).addScaledVector(_dir, reachLen);
    _mid.copy(_from).lerp(_hand, 0.48);

    _color.copy(sim.toColor);
    skin.color.lerp(_color, 0.2);

    if (upper.current) {
      const len = aim(upper.current, _from, _mid);
      upper.current.scale.set(1, Math.max(0.06, len), 1);
    }
    if (lower.current) {
      const len = aim(lower.current, _mid, _hand);
      lower.current.scale.set(0.92, Math.max(0.06, len), 0.92);
    }
    if (hand.current) {
      hand.current.position.copy(_hand);
      hand.current.lookAt(_to);
      hand.current.scale.setScalar(0.7 + p * 0.45);
    }
  });

  return (
    <group ref={group} visible={false} renderOrder={2}>
      <mesh ref={upper} material={skin} scale={[1, 0.2, 1]} castShadow>
        <capsuleGeometry args={[0.028, 1, 5, 10]} />
      </mesh>
      <mesh ref={lower} material={skin} scale={[1, 0.2, 1]} castShadow>
        <capsuleGeometry args={[0.024, 1, 5, 10]} />
      </mesh>
      <group ref={hand}>
        <mesh material={skin}>
          <sphereGeometry args={[0.038, 12, 12]} />
        </mesh>
        <mesh position={[0.028, 0.008, 0.03]} rotation={[0.5, 0.4, 0.2]} material={skin}>
          <capsuleGeometry args={[0.009, 0.046, 3, 6]} />
        </mesh>
        <mesh position={[-0.028, 0.008, 0.03]} rotation={[0.5, -0.4, -0.2]} material={skin}>
          <capsuleGeometry args={[0.009, 0.046, 3, 6]} />
        </mesh>
        <mesh position={[0.01, 0.014, 0.04]} rotation={[0.35, 0.1, 0]} material={skin}>
          <capsuleGeometry args={[0.008, 0.05, 3, 6]} />
        </mesh>
        <mesh position={[-0.01, 0.014, 0.04]} rotation={[0.35, -0.1, 0]} material={skin}>
          <capsuleGeometry args={[0.008, 0.05, 3, 6]} />
        </mesh>
      </group>
    </group>
  );
}
