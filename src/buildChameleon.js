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

function smoothstep(edge0, edge1, x) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function distanceField(live, cols) {
  const n = cols * cols;
  const dist = new Float32Array(n);
  dist.fill(1e9);
  const queue = [];

  for (let i = 0; i < n; i++) {
    const x = i % cols;
    const y = (i / cols) | 0;
    const border = x === 0 || y === 0 || x === cols - 1 || y === cols - 1;
    if (!live[i] || border) {
      dist[i] = 0;
      queue.push(i);
    }
  }

  const dirs = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [-1, -1, Math.SQRT2],
  ];

  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    const x = i % cols;
    const y = (i / cols) | 0;
    for (const [dx, dy, cost] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= cols) continue;
      const ni = ny * cols + nx;
      const next = dist[i] + cost;
      if (next < dist[ni]) {
        dist[ni] = next;
        queue.push(ni);
      }
    }
  }

  return dist;
}

function averageBody(color, size) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    if (color[o + 3] < 200) continue;
    r += color[o];
    g += color[o + 1];
    b += color[o + 2];
    n++;
  }
  if (!n) return new THREE.Color("#3aa38a");
  return new THREE.Color(r / n / 255, g / n / 255, b / n / 255);
}

function buildSolid(color, depth, size, segs, width, depthScale, backScale) {
  const cols = segs + 1;
  const n = cols * cols;
  const live = new Uint8Array(n);
  const depth01 = new Float32Array(n);
  const alongFront = new Float32Array(n);
  const uvFront = new Float32Array(n * 2);
  const xy = new Float32Array(n * 2);

  let chestU = 0;
  let chestV = 0;
  let chestN = 0;

  for (let iy = 0; iy < cols; iy++) {
    for (let ix = 0; ix < cols; ix++) {
      const i = iy * cols + ix;
      const u = ix / segs;
      const v = 1 - iy / segs;
      const c = sample(color, size, u, v);
      const d = sample(depth, size, u, v);
      live[i] = c.a > 48 ? 1 : 0;
      depth01[i] = d.r / 255;
      alongFront[i] = THREE.MathUtils.clamp(1 - v + Math.max(0, u - 0.52) * 0.18, 0, 1);
      uvFront[i * 2] = u;
      uvFront[i * 2 + 1] = v;
      xy[i * 2] = (u - 0.5) * width;
      xy[i * 2 + 1] = (v - 0.5) * width;
      if (live[i]) {
        chestU += u;
        chestV += v;
        chestN++;
      }
    }
  }

  chestU = chestN ? chestU / chestN : 0.5;
  chestV = chestN ? chestV / chestN : 0.45;

  const dist = distanceField(live, cols);
  const pos = [];
  const uvs = [];
  const along = [];
  const shell = [];

  const pushVert = (x, y, z, u, v, alongV, shellV) => {
    const index = pos.length / 3;
    pos.push(x, y, z);
    uvs.push(u, v);
    along.push(alongV);
    shell.push(shellV);
    return index;
  };

  const frontOf = new Int32Array(n);
  const backOf = new Int32Array(n);
  frontOf.fill(-1);
  backOf.fill(-1);

  for (let i = 0; i < n; i++) {
    if (!live[i]) continue;
    const fade = smoothstep(0.2, 6.5, dist[i]);
    const puff = Math.min(1, dist[i] / 11);
    const zF = Math.max(0.07, depth01[i] * depthScale) * (0.4 + 0.6 * fade);
    const zB = -Math.max(0.1, backScale * (0.35 + 0.65 * puff));

    frontOf[i] = pushVert(
      xy[i * 2],
      xy[i * 2 + 1],
      zF,
      uvFront[i * 2],
      uvFront[i * 2 + 1],
      alongFront[i],
      0
    );
    backOf[i] = pushVert(
      xy[i * 2],
      xy[i * 2 + 1],
      zB,
      chestU,
      chestV,
      alongFront[i],
      1
    );
  }

  const indices = [];
  const edgeUse = new Map();
  const frontIndex = [];

  const addEdge = (a, b) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    edgeUse.set(key, (edgeUse.get(key) || 0) + 1);
  };

  const tri = (i0, i1, i2) => {
    if (!live[i0] || !live[i1] || !live[i2]) return;
    frontIndex.push(i0, i1, i2);
    addEdge(i0, i1);
    addEdge(i1, i2);
    addEdge(i2, i0);
    indices.push(frontOf[i0], frontOf[i1], frontOf[i2]);
    indices.push(backOf[i0], backOf[i2], backOf[i1]);
  };

  for (let iy = 0; iy < segs; iy++) {
    for (let ix = 0; ix < segs; ix++) {
      const a = iy * cols + ix;
      const b = (iy + 1) * cols + ix;
      const c = iy * cols + (ix + 1);
      const d = (iy + 1) * cols + (ix + 1);
      tri(a, b, c);
      tri(b, d, c);
    }
  }

  const seenRim = new Set();
  for (let i = 0; i < frontIndex.length; i += 3) {
    const triIds = [frontIndex[i], frontIndex[i + 1], frontIndex[i + 2]];
    for (let e = 0; e < 3; e++) {
      const a = triIds[e];
      const b = triIds[(e + 1) % 3];
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      if (edgeUse.get(key) !== 1 || seenRim.has(key)) continue;
      seenRim.add(key);

      const rfA = pushVert(
        xy[a * 2],
        xy[a * 2 + 1],
        pos[frontOf[a] * 3 + 2],
        chestU,
        chestV,
        alongFront[a],
        2
      );
      const rfB = pushVert(
        xy[b * 2],
        xy[b * 2 + 1],
        pos[frontOf[b] * 3 + 2],
        chestU,
        chestV,
        alongFront[b],
        2
      );
      const rbA = pushVert(
        xy[a * 2],
        xy[a * 2 + 1],
        pos[backOf[a] * 3 + 2],
        chestU,
        chestV,
        alongFront[a],
        2
      );
      const rbB = pushVert(
        xy[b * 2],
        xy[b * 2 + 1],
        pos[backOf[b] * 3 + 2],
        chestU,
        chestV,
        alongFront[b],
        2
      );

      // Outward winding: interior is to the left of a→b on the front,
      // so a→back→b faces out of the silhouette.
      indices.push(rfA, rbA, rbB);
      indices.push(rfA, rbB, rfB);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("along", new THREE.Float32BufferAttribute(along, 1));
  geo.setAttribute("shell", new THREE.Float32BufferAttribute(shell, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingBox();

  const bb = geo.boundingBox;
  geo.translate(
    -(bb.min.x + bb.max.x) * 0.5,
    -(bb.min.y + bb.max.y) * 0.5,
    -(bb.min.z + bb.max.z) * 0.5
  );
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

export function buildChameleon(material, colorImage, depthImage) {
  const maps = readMaps(colorImage, depthImage, 512);
  const body = averageBody(maps.color, 512);
  if (material.userData.uniforms?.uBody) {
    material.userData.uniforms.uBody.value.copy(body);
  }

  const geo = buildSolid(maps.color, maps.depth, 512, 96, 1.72, 0.48, 0.36);

  const group = new THREE.Group();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.skin = true;
  group.add(mesh);

  group.userData.eyes = [];
  group.userData.skin = group;
  group.rotation.x = -0.04;
  return group;
}
