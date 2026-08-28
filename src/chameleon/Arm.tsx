import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "../experience/sim";
import { makeScaleTexture } from "../lib/textures";

const UPPER = 0.175;
const LOWER = 0.185;
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _ctrl = new THREE.Vector3();
const _hand = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _pole = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _upperDir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _z = new THREE.Vector3();
const _color = new THREE.Color();

function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number, out: THREE.Vector3) {
  const u = 1 - t;
  out.set(
    u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    u * u * a.y + 2 * u * t * b.y + t * t * c.y,
    u * u * a.z + 2 * u * t * b.z + t * t * c.z,
  );
}

function aimY(object: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3) {
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
  const pinch = useRef(0);
  const scaleTex = useMemo(() => makeScaleTexture(), []);
  const skin = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: scaleTex,
        color: "#6bb8aa",
        roughness: 0.62,
        metalness: 0.02,
      }),
    [scaleTex],
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const p = THREE.MathUtils.smootherstep(sim.reach, 0.0, 1);
    g.visible = p > 0.03;
    if (!g.visible) return;

    _from.copy(sim.reachFrom);
    _to.copy(sim.reachTo);
    const side = sim.reachSide;

    _ctrl.lerpVectors(_from, _to, 0.42);
    _ctrl.x += side * 0.06;
    _ctrl.y -= 0.07;
    _ctrl.z += 0.04;
    bezier(_from, _ctrl, _to, p, _hand);
    _dir.copy(_hand).sub(_from);
    const want = _dir.length();
    const maxLen = UPPER + LOWER - 0.01;
    if (want > 0.0001) _dir.multiplyScalar(1 / want);
    if (want > maxLen) {
      _hand.copy(_from).addScaledVector(_dir, maxLen);
    }
    const dist = _from.distanceTo(_hand);

    _pole.set(side * 0.35, -1, 0.15);
    _axis.crossVectors(_dir, _pole);
    if (_axis.lengthSq() < 1e-5) _axis.set(0, 0, 1);
    else _axis.normalize();

    const cosA = THREE.MathUtils.clamp(
      (UPPER * UPPER + dist * dist - LOWER * LOWER) / (2 * UPPER * Math.max(dist, 0.001)),
      -1,
      1,
    );
    const ang = Math.acos(cosA);
    _upperDir.copy(_dir).applyAxisAngle(_axis, ang);
    _mid.copy(_from).addScaledVector(_upperDir, UPPER);

    _color.copy(sim.toColor);
    skin.color.lerp(_color, 0.18);

    if (upper.current) {
      const len = aimY(upper.current, _from, _mid);
      upper.current.scale.set(1, Math.max(0.04, len), 1);
    }
    if (lower.current) {
      const len = aimY(lower.current, _mid, _hand);
      lower.current.scale.set(0.9, Math.max(0.04, len), 0.9);
    }

    const close = THREE.MathUtils.smoothstep(p, 0.72, 1);
    pinch.current = THREE.MathUtils.damp(pinch.current, close, 12, dt);

    if (hand.current) {
      hand.current.position.copy(_hand);
      hand.current.lookAt(_to);
      const open = 0.22 - pinch.current * 0.14;
      const left = hand.current.children[1] as THREE.Object3D | undefined;
      const right = hand.current.children[2] as THREE.Object3D | undefined;
      if (left) left.rotation.y = open;
      if (right) right.rotation.y = -open;
    }
  });

  return (
    <group ref={group} visible={false} renderOrder={2}>
      <mesh ref={upper} material={skin}>
        <capsuleGeometry args={[0.032, 1, 6, 14]} />
      </mesh>
      <mesh ref={lower} material={skin}>
        <capsuleGeometry args={[0.026, 1, 6, 14]} />
      </mesh>
      <group ref={hand}>
        <mesh material={skin}>
          <sphereGeometry args={[0.04, 16, 16]} />
        </mesh>
        <group>
          <mesh position={[0.022, 0.006, 0.034]} rotation={[0.55, 0.15, 0.1]} material={skin}>
            <capsuleGeometry args={[0.01, 0.042, 4, 8]} />
          </mesh>
          <mesh position={[0.034, 0.002, 0.022]} rotation={[0.45, 0.55, 0.2]} material={skin}>
            <capsuleGeometry args={[0.009, 0.034, 4, 8]} />
          </mesh>
        </group>
        <group>
          <mesh position={[-0.022, 0.006, 0.034]} rotation={[0.55, -0.15, -0.1]} material={skin}>
            <capsuleGeometry args={[0.01, 0.042, 4, 8]} />
          </mesh>
          <mesh position={[-0.034, 0.002, 0.022]} rotation={[0.45, -0.55, -0.2]} material={skin}>
            <capsuleGeometry args={[0.009, 0.034, 4, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
