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

function buildSolid(color, depth, size, segs, width, depthScale, backScale) {
  const cols = segs + 1;
  const n = cols * cols;
  const live = new Uint8Array(n);
  const depth01 = new Float32Array(n);
  const alongFront = new Float32Array(n);
  const uvFront = new Float32Array(n * 2);
  const xy = new Float32Array(n * 2);

  for (let iy = 0; iy < cols; iy++) {
    for (let ix = 0; ix < cols; ix++) {
      const i = iy * cols + ix;
      const u = ix / segs;
      const v = 1 - iy / segs;
      const c = sample(color, size, u, v);
      const d = sample(depth, size, u, v);
      live[i] = c.a > 40 ? 1 : 0;
      depth01[i] = d.r / 255;
      alongFront[i] = THREE.MathUtils.clamp(1 - v + Math.max(0, u - 0.52) * 0.18, 0, 1);
      uvFront[i * 2] = u;
      uvFront[i * 2 + 1] = v;
      xy[i * 2] = (u - 0.5) * width;
      xy[i * 2 + 1] = (v - 0.5) * width;
    }
  }

  const dist = distanceField(live, cols);
  const positions = new Float32Array(n * 2 * 3);
  const uvs = new Float32Array(n * 2 * 2);
  const along = new Float32Array(n * 2);
  const shell = new Float32Array(n * 2);

  for (let i = 0; i < n; i++) {
    const fade = smoothstep(0.45, 7.2, dist[i]);
    const puff = Math.min(1, dist[i] / 13);
    const zF = depth01[i] * depthScale * (0.12 + 0.88 * fade);
    const zB = -backScale * puff * (0.18 + 0.82 * fade) - (1 - depth01[i]) * 0.03 * fade;

    positions[i * 3] = xy[i * 2];
    positions[i * 3 + 1] = xy[i * 2 + 1];
    positions[i * 3 + 2] = zF;
    uvs[i * 2] = uvFront[i * 2];
    uvs[i * 2 + 1] = uvFront[i * 2 + 1];
    along[i] = alongFront[i];
    shell[i] = 0;

    const b = n + i;
    positions[b * 3] = xy[i * 2];
    positions[b * 3 + 1] = xy[i * 2 + 1];
    positions[b * 3 + 2] = zB;
    uvs[b * 2] = uvFront[i * 2];
    uvs[b * 2 + 1] = uvFront[i * 2 + 1];
    along[b] = alongFront[i];
    shell[b] = 1;
  }

  const frontIndex = [];
  const edgeUse = new Map();

  const addEdge = (a, b) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    edgeUse.set(key, (edgeUse.get(key) || 0) + 1);
  };

  for (let iy = 0; iy < segs; iy++) {
    for (let ix = 0; ix < segs; ix++) {
      const a = iy * cols + ix;
      const b = (iy + 1) * cols + ix;
      const c = iy * cols + (ix + 1);
      const d = (iy + 1) * cols + (ix + 1);

      const tri = (i0, i1, i2) => {
        if (!live[i0] || !live[i1] || !live[i2]) return;
        frontIndex.push(i0, i1, i2);
        addEdge(i0, i1);
        addEdge(i1, i2);
        addEdge(i2, i0);
      };

      tri(a, b, c);
      tri(b, d, c);
    }
  }

  const indices = [];
  for (let i = 0; i < frontIndex.length; i += 3) {
    const a = frontIndex[i];
    const b = frontIndex[i + 1];
    const c = frontIndex[i + 2];
    indices.push(a, b, c);
    indices.push(a + n, c + n, b + n);
  }

  const seenRim = new Set();
  for (let i = 0; i < frontIndex.length; i += 3) {
    const tri = [frontIndex[i], frontIndex[i + 1], frontIndex[i + 2]];
    for (let e = 0; e < 3; e++) {
      const a = tri[e];
      const b = tri[(e + 1) % 3];
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      if (edgeUse.get(key) !== 1) continue;
      if (seenRim.has(key)) continue;
      seenRim.add(key);
      indices.push(a, b, b + n);
      indices.push(a, b + n, a + n);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute("along", new THREE.BufferAttribute(along, 1));
  geo.setAttribute("shell", new THREE.BufferAttribute(shell, 1));
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
  const geo = buildSolid(maps.color, maps.depth, 512, 80, 1.72, 0.5, 0.34);

  const group = new THREE.Group();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.skin = true;
  group.add(mesh);

  group.userData.eyes = [];
  group.userData.skin = group;
  group.rotation.x = -0.05;
  return group;
}
