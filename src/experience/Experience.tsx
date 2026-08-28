import { Preload } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { ReachingArm } from "../chameleon/Arm";
import { Chameleon } from "../chameleon/Chameleon";
import { Crystal } from "../crystals/Crystal";
import {
  Atmosphere,
  CrystalSpores,
  CursorGlow,
  EnergyStream,
} from "../environment/Atmosphere";
import { CRYSTALS } from "./crystals";
import { activateCrystal } from "./interactions";
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
    target.current.set(px * 0.07 * (1 - zoom * 0.4), 0.02 + py * 0.045 * (1 - zoom * 0.4), THREE.MathUtils.lerp(2.42, 2.12, zoom));
    camera.position.lerp(target.current, 1 - Math.pow(0.02, dt * 60 * 0.016 + dt));
    look.current.set(px * 0.04, py * 0.02, 0);
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
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.045, 4, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.03, 4, dt);
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
          world: [p[0] * viewport.width, p[1] * viewport.height, p[2]] as [number, number, number],
        };
      }),
    [viewport.width, viewport.height, isCoarse],
  );

  return (
    <>
      <color attach="background" args={["#e6d3b4"]} />
      <fog attach="fog" args={["#e6d3b4", 6, 14]} />
      <ambientLight intensity={0.7} color="#f6ead6" />
      <hemisphereLight args={["#fff1dc", "#c4ae8d", 0.55]} />
      <directionalLight position={[2.2, 2.8, 4]} intensity={0.65} color="#fff6ea" />
      <directionalLight position={[-2.5, 0.4, 2]} intensity={0.18} color="#cfe8ff" />

      <ChameleonRig />
      <ReachingArm />

      {layout.map((c, i) => (
        <group key={c.id}>
          <Crystal
            index={i}
            color={c.gem}
            position={c.world}
            onActivate={() => activateCrystal(c.id)}
          />
          <CrystalSpores index={i} color={c.gem} />
        </group>
      ))}

      <Atmosphere />
      <EnergyStream />
      <CursorGlow />
      <CameraRig />
      <Preload all />
    </>
  );
}

export function Experience({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
      }}
      camera={{ position: [0, 0.02, 2.42], fov: 36, near: 0.08, far: 24 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#e6d3b4", 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.96;
      }}
    >
      <Suspense fallback={null}>
        <Scene onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
