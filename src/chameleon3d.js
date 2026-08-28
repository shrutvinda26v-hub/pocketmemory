import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildChameleon } from "./buildChameleon.js";
import { createSkinMaterial, createSkinUniforms } from "./skinMaterial.js";

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
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 0.42, 3.15);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const loader = new THREE.TextureLoader();
  const [albedo, bump] = await Promise.all([
    loader.loadAsync("assets/chameleon.webp"),
    loader.loadAsync("assets/chameleon-depth.webp"),
  ]);
  albedo.colorSpace = THREE.SRGBColorSpace;
  albedo.anisotropy = 8;
  bump.colorSpace = THREE.NoColorSpace;

  const uniforms = createSkinUniforms();
  const skinMat = createSkinMaterial(albedo, bump, uniforms);
  const chameleon = buildChameleon(skinMat);
  chameleon.position.y = -0.08;
  scene.add(chameleon);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshStandardMaterial({
      color: 0x07080a,
      roughness: 0.28,
      metalness: 0.35,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.12;
  floor.receiveShadow = true;
  scene.add(floor);

  const key = new THREE.SpotLight(0xfff1dc, 28, 16, 0.42, 0.55, 1);
  key.position.set(0.2, 4.2, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.target.position.set(0, 0.35, 0.2);
  scene.add(key, key.target);

  const fill = new THREE.DirectionalLight(0x9eb4c8, 0.55);
  fill.position.set(-3.2, 1.4, 2.4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffe6c2, 1.15);
  rim.position.set(2.4, 2.8, -3.2);
  scene.add(rim);

  const hemi = new THREE.HemisphereLight(0x5a6a78, 0x08090c, 0.42);
  scene.add(hemi);

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.15;
  controls.maxDistance = 4.6;
  controls.minPolarAngle = Math.PI * 0.38;
  controls.maxPolarAngle = Math.PI * 0.54;
  controls.target.set(0, 0.38, 0.12);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.55;
  controls.update();

  canvas.addEventListener("pointerdown", () => {
    controls.autoRotate = false;
  });

  const lookTarget = new THREE.Vector3();
  const ndc = new THREE.Vector2();

  function lookEyes(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    lookTarget.set(ndc.x * 1.8, 0.45 + ndc.y * 0.8, 1.6);
    for (const eye of chameleon.userData.eyes) {
      eye.userData.look.lookAt(lookTarget);
    }
  }

  window.addEventListener("pointermove", (event) => {
    lookEyes(event.clientX, event.clientY);
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    chameleon.userData.skin.position.y = Math.sin(t * 1.4) * 0.012;
    chameleon.userData.skin.rotation.y = Math.sin(t * 0.35) * 0.03;
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
