import * as THREE from "three";
import type { CrystalId } from "./crystals";

export const sim = {
  look: new THREE.Vector2(0, 0),
  lookTarget: new THREE.Vector2(0, 0),
  head: new THREE.Vector2(0, 0),
  blink: 0,
  breathe: 0,
  tail: 0,
  weight: 0,
  reach: 0,
  transition: 1,
  pulse: 0,
  energy: 0,
  fromColor: new THREE.Color("#ffffff"),
  toColor: new THREE.Color("#5ec4b6"),
  fromAmount: 0,
  toAmount: 0,
  spreadUv: new THREE.Vector2(0.46, 0.28),
  reachFrom: new THREE.Vector3(-0.18, -0.42, 0.12),
  reachTo: new THREE.Vector3(0.8, 0.2, 0.4),
  reachSide: 1 as -1 | 1,
  busy: false,
  hoveredId: null as CrystalId | null,
  crystalGlow: [0, 0, 0, 0, 0, 0, 0],
  crystalWorld: Array.from({ length: 7 }, () => new THREE.Vector3()),
  pointerNdc: new THREE.Vector2(),
  pointerWorld: new THREE.Vector3(),
  cameraZoom: 0,
  planeWidth: 3.2,
  planeHeight: 1.8,
};

export const NATURAL_TINT = new THREE.Color("#5ec4b6");
