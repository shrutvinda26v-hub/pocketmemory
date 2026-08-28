import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildChameleon } from "./buildChameleon.js";
import { createSkinMaterial, createSkinUniforms } from "./skinMaterial.js";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function createChameleonScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 0.08, 2.55);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.28;

  const [colorImage, depthImage] = await Promise.all([
    loadImage("assets/chameleon.webp"),
    loadImage("assets/chameleon-depth.webp"),
  ]);

  const albedo = new THREE.Texture(colorImage);
  albedo.colorSpace = THREE.SRGBColorSpace;
  albedo.anisotropy = 8;
  albedo.needsUpdate = true;

  const bump = new THREE.Texture(depthImage);
  bump.colorSpace = THREE.NoColorSpace;
  bump.needsUpdate = true;

  const uniforms = createSkinUniforms();
  const skinMat = createSkinMaterial(albedo, bump, uniforms);
  const chameleon = buildChameleon(skinMat, colorImage, depthImage);
  chameleon.position.y = 0.02;
  scene.add(chameleon);

  const key = new THREE.SpotLight(0xfff1dc, 18, 14, 0.4, 0.65, 1);
  key.position.set(0.15, 3.2, 2.0);
  key.target.position.set(0, 0.1, 0.15);
  scene.add(key, key.target);

  const fill = new THREE.DirectionalLight(0x9eb4c8, 0.45);
  fill.position.set(-2.8, 1.2, 2.2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffe6c2, 0.9);
  rim.position.set(2.2, 2.4, -2.6);
  scene.add(rim);

  const hemi = new THREE.HemisphereLight(0x5a6a78, 0x08090c, 0.38);
  scene.add(hemi);

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 1.8;
  controls.maxDistance = 3.8;
  controls.minPolarAngle = Math.PI * 0.46;
  controls.maxPolarAngle = Math.PI * 0.54;
  controls.minAzimuthAngle = -0.48;
  controls.maxAzimuthAngle = 0.48;
  controls.target.set(0, 0.06, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.7;
  controls.update();

  canvas.addEventListener("pointerdown", () => {
    controls.autoRotate = false;
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const start = performance.now();
  function tick() {
    const t = (performance.now() - start) / 1000;
    chameleon.position.y = 0.02 + Math.sin(t * 1.35) * 0.01;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);

  return {
    uniforms,
    controls,
    resize,
  };
}
