import { Preload } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { ReachingArm } from "../chameleon/Arm";
import { Chameleon } from "../chameleon/Chameleon";
import { Crystal } from "../crystals/Crystal";
import { EnergyStream } from "../environment/Atmosphere";
import { CRYSTALS } from "./crystals";
import { activateCrystal } from "./interactions";
import { getPlaneSize } from "./layout";
import { sim } from "./sim";
import { useExperience } from "./store";

function CameraRig() {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const zoom = sim.cameraZoom;
    const px = pointer.x;
    const py = pointer.y;
    target.current.set(
      px * 0.035 * (1 - zoom * 0.5),
      py * 0.02 * (1 - zoom * 0.5),
      THREE.MathUtils.lerp(2.85, 2.7, zoom),
    );
    camera.position.lerp(target.current, 1 - Math.exp(-3.2 * dt));
    look.current.set(px * 0.02, py * 0.01, 0);
    camera.lookAt(look.current);
  });
  return null;
}

function ChameleonRig() {
  const ref = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.02, 4, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.012, 4, dt);
  });
  return (
    <group ref={ref}>
      <Chameleon />
    </group>
  );
}

function Scene({ onReady }: { onReady: () => void }) {
  const { viewport } = useThree();
  const isCoarse = useExperience((s) => s.isCoarse);
  const readyOnce = useRef(false);
  const plane = useMemo(
    () => getPlaneSize(viewport.width, viewport.height, isCoarse),
    [viewport.width, viewport.height, isCoarse],
  );

  useFrame(() => {
    if (!readyOnce.current) {
      readyOnce.current = true;
      onReady();
    }
  });

  const layout = useMemo(
    () =>
      CRYSTALS.map((c) => {
        const p = isCoarse ? c.mobile : c.desktop;
        return {
          ...c,
          world: [p[0] * plane.width, p[1] * plane.height, p[2]] as [number, number, number],
        };
      }),
    [plane.width, plane.height, isCoarse],
  );

  return (
    <>
      <color attach="background" args={["#f0dbbc"]} />
      <ambientLight intensity={0.85} color="#ffffff" />
      <directionalLight position={[2, 3, 4]} intensity={0.45} color="#ffffff" />

      <ChameleonRig />
      <ReachingArm />

      {layout.map((c, i) => (
        <Crystal
          key={c.id}
          index={i}
          color={c.gem}
          position={c.world}
          onActivate={() => activateCrystal(c.id)}
        />
      ))}

      <EnergyStream />
      <CameraRig />
      <Preload all />
    </>
  );
}

export function Experience({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
      }}
      camera={{ position: [0, 0, 2.85], fov: 34, near: 0.08, far: 24 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#f0dbbc", 1);
        gl.toneMapping = THREE.NoToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Suspense fallback={null}>
        <Scene onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
