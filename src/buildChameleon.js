import * as THREE from "three";

function stampAlong(mesh, head, dir, length) {
  mesh.updateMatrixWorld(true);
  const pos = mesh.geometry.attributes.position;
  const along = new Float32Array(pos.count);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    along[i] = THREE.MathUtils.clamp(v.sub(head).dot(dir) / length, 0, 1);
  }
  mesh.geometry.setAttribute("along", new THREE.BufferAttribute(along, 1));
}

function projectFrontUVs(mesh) {
  const pos = mesh.geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  const v = new THREE.Vector3();
  mesh.updateMatrixWorld(true);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    uvs[i * 2] = THREE.MathUtils.clamp((v.x + 0.95) / 1.9, 0, 1);
    uvs[i * 2 + 1] = THREE.MathUtils.clamp((v.y + 0.15) / 1.45, 0, 1);
  }
  mesh.geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}

function skinMesh(geometry, material, position, rotation, scale) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  if (scale) mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.skin = true;
  return mesh;
}

function makeEye(side) {
  const group = new THREE.Group();
  const lidMat = new THREE.MeshPhysicalMaterial({
    color: "#8fbf8a",
    roughness: 0.55,
    metalness: 0.04,
  });
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.155, 32, 24), lidMat);
  lid.scale.set(1.05, 0.92, 0.92);
  lid.userData.skin = true;
  lid.castShadow = true;

  const look = new THREE.Group();
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.112, 32, 24),
    new THREE.MeshPhysicalMaterial({
      color: "#2a3320",
      roughness: 0.22,
      metalness: 0.08,
    })
  );
  const iris = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 24, 16),
    new THREE.MeshPhysicalMaterial({
      color: "#4a5a28",
      roughness: 0.28,
      metalness: 0.1,
    })
  );
  iris.position.z = 0.055;
  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 20, 14),
    new THREE.MeshPhysicalMaterial({
      color: "#07080a",
      roughness: 0.12,
      metalness: 0.2,
    })
  );
  pupil.position.z = 0.078;
  const highlight = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 12, 10),
    new THREE.MeshBasicMaterial({ color: "#f4f0e4" })
  );
  highlight.position.set(-0.02, 0.03, 0.1);

  look.add(globe, iris, pupil, highlight);
  group.add(lid, look);
  group.position.set(side * 0.36, 0.54, 0.66);
  group.rotation.y = side * 0.55;
  group.userData.look = look;
  group.userData.lid = lid;
  return group;
}

function makeLeg(material, x, z, front) {
  const g = new THREE.Group();
  const upper = skinMesh(
    new THREE.SphereGeometry(0.13, 24, 18),
    material,
    [0, 0.18, 0],
    [front ? 0.35 : -0.15, 0, x > 0 ? -0.2 : 0.2],
    [1.05, 1.35, 1.05]
  );
  const lower = skinMesh(
    new THREE.SphereGeometry(0.11, 24, 18),
    material,
    [x > 0 ? 0.08 : -0.08, 0.02, front ? 0.06 : -0.04],
    [0.15, 0, 0],
    [1.15, 0.9, 1.15]
  );
  const foot = skinMesh(
    new THREE.SphereGeometry(0.1, 20, 16),
    material,
    [x > 0 ? 0.14 : -0.14, -0.08, front ? 0.12 : -0.02],
    [0, 0, 0],
    [1.45, 0.45, 1.2]
  );
  for (let i = 0; i < 3; i++) {
    const claw = skinMesh(
      new THREE.SphereGeometry(0.028, 10, 8),
      material,
      [
        (x > 0 ? 0.2 : -0.2) + (x > 0 ? 0.04 : -0.04) * i,
        -0.11,
        (front ? 0.08 : -0.06) + (i - 1) * 0.05,
      ],
      null,
      [1.1, 0.45, 1.6]
    );
    g.add(claw);
  }
  g.add(upper, lower, foot);
  g.position.set(x, 0.02, z);
  return g;
}

function makeTail(material) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    const ang = t * Math.PI * 2.5;
    const rad = 0.05 + t * 0.26;
    pts.push(
      new THREE.Vector3(
        0.18 + Math.cos(ang) * rad,
        0.11 + Math.sin(t * Math.PI) * 0.03,
        -0.38 - t * 0.52 + Math.sin(ang) * rad * 0.7
      )
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  for (let i = 0; i < 22; i++) {
    const t = i / 21;
    const p = curve.getPointAt(t);
    const r = 0.105 * (1 - t * 0.72);
    const bead = skinMesh(
      new THREE.SphereGeometry(r, 16, 12),
      material,
      [p.x, p.y, p.z],
      null,
      [1, 0.9, 1]
    );
    g.add(bead);
  }
  return g;
}

export function buildChameleon(material) {
  const root = new THREE.Group();
  const skin = new THREE.Group();

  const body = skinMesh(
    new THREE.SphereGeometry(0.48, 64, 48),
    material,
    [0, 0.28, -0.06],
    [0.12, 0, 0],
    [1.12, 0.78, 1.42]
  );

  const chest = skinMesh(
    new THREE.SphereGeometry(0.36, 48, 36),
    material,
    [0, 0.26, 0.28],
    [0.2, 0, 0],
    [1.15, 0.85, 0.95]
  );

  const head = skinMesh(
    new THREE.SphereGeometry(0.42, 64, 48),
    material,
    [0, 0.5, 0.5],
    [0.08, 0, 0],
    [1.18, 0.95, 0.98]
  );

  const snout = skinMesh(
    new THREE.SphereGeometry(0.22, 36, 28),
    material,
    [0, 0.4, 0.78],
    [0.25, 0, 0],
    [0.95, 0.7, 1.05]
  );

  const casque = skinMesh(
    new THREE.SphereGeometry(0.3, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.62),
    material,
    [0, 0.82, 0.4],
    [-0.55, 0, 0],
    [0.28, 1.15, 0.85]
  );

  const ridge = skinMesh(
    new THREE.SphereGeometry(0.12, 20, 16),
    material,
    [0, 0.62, 0.62],
    [0.4, 0, 0],
    [0.35, 1.8, 1.4]
  );

  const chin = skinMesh(
    new THREE.SphereGeometry(0.16, 24, 18),
    material,
    [0, 0.28, 0.68],
    [0.3, 0, 0],
    [1.1, 0.7, 1]
  );

  skin.add(body, chest, head, snout, casque, ridge, chin);
  skin.add(makeLeg(material, 0.42, 0.32, true));
  skin.add(makeLeg(material, -0.42, 0.32, true));
  skin.add(makeLeg(material, 0.38, -0.22, false));
  skin.add(makeLeg(material, -0.38, -0.22, false));
  skin.add(makeTail(material));

  const eyeL = makeEye(-1);
  const eyeR = makeEye(1);
  eyeL.userData.lid.material = material;
  eyeR.userData.lid.material = material;

  root.add(skin, eyeL, eyeR);

  const headPoint = new THREE.Vector3(0, 0.98, 0.55);
  const tailPoint = new THREE.Vector3(0.38, 0.1, -0.92);
  const dir = tailPoint.clone().sub(headPoint);
  const length = dir.length();
  dir.normalize();

  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (obj.isMesh && obj.userData.skin) {
      projectFrontUVs(obj);
      stampAlong(obj, headPoint, dir, length);
    }
  });
  stampAlong(eyeL.userData.lid, headPoint, dir, length);
  stampAlong(eyeR.userData.lid, headPoint, dir, length);
  projectFrontUVs(eyeL.userData.lid);
  projectFrontUVs(eyeR.userData.lid);

  root.userData.eyes = [eyeL, eyeR];
  root.userData.skin = skin;
  return root;
}
