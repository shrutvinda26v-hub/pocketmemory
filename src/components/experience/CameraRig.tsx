"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useJourney } from "@/store/useJourney";
import { getJourney } from "@/lib/journey";

export function CameraRig() {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const look = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3());

  useFrame(() => {
    const frame = getJourney(useJourney.getState().progress);
    if (!camera.current) return;
    pos.current.set(frame.cameraPos[0], frame.cameraPos[1], frame.cameraPos[2]);
    look.current.set(frame.lookAt[0], frame.lookAt[1], frame.lookAt[2]);
    camera.current.position.lerp(pos.current, 0.12);
    camera.current.fov = THREE.MathUtils.lerp(camera.current.fov, frame.fov, 0.1);
    camera.current.lookAt(look.current);
    camera.current.updateProjectionMatrix();
  });

  return (
    <PerspectiveCamera
      ref={camera}
      makeDefault
      fov={31}
      near={0.08}
      far={40}
      position={[0, 0.22, 4.55]}
    />
  );
}
