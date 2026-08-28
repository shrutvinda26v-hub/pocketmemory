import * as THREE from "three";

function sample(data, size, u, v) {
  const x = Math.min(size - 1, Math.max(0, Math.floor(u * (size - 1))));
  const y = Math.min(size - 1, Math.max(0, Math.floor((1 - v) * (size - 1))));
  const i = (y * size + x) * 4;
  return {
    r: data[i],
    g: data[i + 1],
    b: data[i + 2],
    a: data[i + 3],
  };
}

function readMaps(colorImage, depthImage, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(colorImage, 0, 0, size, size);
  const color = ctx.getImageData(0, 0, size, size).data;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(depthImage, 0, 0, size, size);
  const depth = ctx.getImageData(0, 0, size, size).data;
  return { color, depth };
}

function buildShell(color, depth, size, segs, width, depthScale) {
  const geo = new THREE.PlaneGeometry(width, width, segs, segs);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const along = new Float32Array(pos.count);
  const solid = new Uint8Array(pos.count);

  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    const c = sample(color, size, u, v);
    const d = sample(depth, size, u, v);
    const live = c.a > 40;
    solid[i] = live ? 1 : 0;
    pos.setZ(i, live ? (d.r / 255) * depthScale : 0);
    along[i] = THREE.MathUtils.clamp(1 - v + Math.max(0, u - 0.52) * 0.18, 0, 1);
  }

  geo.setAttribute("along", new THREE.BufferAttribute(along, 1));

  const src = geo.index.array;
  const next = [];
  for (let i = 0; i < src.length; i += 3) {
    const a = src[i];
    const b = src[i + 1];
    const c = src[i + 2];
    if (solid[a] && solid[b] && solid[c]) next.push(a, b, c);
  }
  geo.setIndex(next);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

export function buildChameleon(material, colorImage, depthImage) {
  const size = 512;
  const segs = 72;
  const width = 1.72;
  const maps = readMaps(colorImage, depthImage, size);
  const geo = buildShell(maps.color, maps.depth, size, segs, width, 0.42);

  const group = new THREE.Group();
  const frontMesh = new THREE.Mesh(geo, material);
  frontMesh.castShadow = false;
  frontMesh.receiveShadow = false;
  frontMesh.userData.skin = true;
  group.add(frontMesh);

  group.userData.eyes = [];
  group.userData.skin = group;
  group.rotation.x = -0.06;
  return group;
}
