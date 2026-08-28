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

function buildShell(color, depth, size, segs, width, depthScale, zOffset, reverse) {
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
    const live = c.a > 28;
    solid[i] = live ? 1 : 0;
    const z = live ? (d.r / 255 - 0.12) * depthScale + zOffset : zOffset;
    pos.setZ(i, z);
    along[i] = THREE.MathUtils.clamp(1 - v + Math.max(0, u - 0.52) * 0.18, 0, 1);
  }

  geo.setAttribute("along", new THREE.BufferAttribute(along, 1));

  const src = geo.index.array;
  const next = [];
  for (let i = 0; i < src.length; i += 3) {
    const a = src[i];
    const b = src[i + 1];
    const c = src[i + 2];
    if (solid[a] && solid[b] && solid[c]) {
      if (reverse) next.push(a, c, b);
      else next.push(a, b, c);
    }
  }
  geo.setIndex(next);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return { geo, solid };
}

function stitchRim(front, back, solid) {
  const uses = new Map();
  const idx = front.index.array;
  const add = (a, b) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    const rec = uses.get(key) || { a, b, n: 0 };
    rec.n += 1;
    uses.set(key, rec);
  };
  for (let i = 0; i < idx.length; i += 3) {
    add(idx[i], idx[i + 1]);
    add(idx[i + 1], idx[i + 2]);
    add(idx[i + 2], idx[i]);
  }

  const fp = front.attributes.position;
  const bp = back.attributes.position;
  const fuv = front.attributes.uv;
  const falong = front.attributes.along;
  const positions = [];
  const uvs = [];
  const alongs = [];
  const normals = [];
  const indices = [];
  let v = 0;

  for (const { a, b, n } of uses.values()) {
    if (n !== 1 || !solid[a] || !solid[b]) continue;
    const verts = [
      [fp.getX(a), fp.getY(a), fp.getZ(a), fuv.getX(a), fuv.getY(a), falong.getX(a)],
      [fp.getX(b), fp.getY(b), fp.getZ(b), fuv.getX(b), fuv.getY(b), falong.getX(b)],
      [bp.getX(b), bp.getY(b), bp.getZ(b), fuv.getX(b), fuv.getY(b), falong.getX(b)],
      [bp.getX(a), bp.getY(a), bp.getZ(a), fuv.getX(a), fuv.getY(a), falong.getX(a)],
    ];
    for (const vert of verts) {
      positions.push(vert[0], vert[1], vert[2]);
      uvs.push(vert[3], vert[4]);
      alongs.push(vert[5]);
      normals.push(0, 0, 1);
    }
    indices.push(v, v + 1, v + 2, v, v + 2, v + 3);
    v += 4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("along", new THREE.Float32BufferAttribute(alongs, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function buildChameleon(material, colorImage, depthImage) {
  const size = 512;
  const segs = 72;
  const width = 1.72;
  const maps = readMaps(colorImage, depthImage, size);
  const front = buildShell(maps.color, maps.depth, size, segs, width, 0.34, 0, false);
  const back = buildShell(maps.color, maps.depth, size, segs, width, 0.34, -0.16, true);
  const rim = stitchRim(front.geo, back.geo, front.solid);

  const group = new THREE.Group();
  const frontMesh = new THREE.Mesh(front.geo, material);
  const backMesh = new THREE.Mesh(back.geo, material);
  const rimMesh = new THREE.Mesh(rim, material);
  for (const mesh of [frontMesh, backMesh, rimMesh]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.skin = true;
    group.add(mesh);
  }

  group.userData.eyes = [];
  group.userData.skin = group;
  group.rotation.x = -0.06;
  return group;
}
