import * as THREE from "three";

const TWO_PI = Math.PI * 2;

function polar(radius: number, y: number, angle: number) {
  return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
}

function addTri(
  positions: number[],
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3
) {
  const ab = new THREE.Vector3().subVectors(b, a);
  const ac = new THREE.Vector3().subVectors(c, a);
  const n = new THREE.Vector3().crossVectors(ab, ac);
  const centroid = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
  const outward = n.dot(centroid) >= 0;
  const p1 = outward ? b : c;
  const p2 = outward ? c : b;
  positions.push(a.x, a.y, a.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
}

function addQuad(
  positions: number[],
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  d: THREE.Vector3
) {
  addTri(positions, a, b, c);
  addTri(positions, a, c, d);
}

export function createBrilliantGeometry() {
  const positions: number[] = [];

  const tableR = 0.55;
  const starR = 0.72;
  const crownH = 0.33;
  const girdleH = 0.038;
  const pavilionH = 0.86;
  const gTop = girdleH * 0.5;
  const gBot = -girdleH * 0.5;

  const table: THREE.Vector3[] = [];
  const star: THREE.Vector3[] = [];
  const gT: THREE.Vector3[] = [];
  const gB: THREE.Vector3[] = [];

  for (let i = 0; i < 8; i++) {
    table.push(polar(tableR, crownH, (i / 8) * TWO_PI + Math.PI / 8));
    star.push(polar(starR, crownH * 0.5, (i / 8) * TWO_PI));
  }

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TWO_PI;
    const r = i % 2 === 0 ? 1 : 0.985;
    gT.push(polar(r, gTop, a));
    gB.push(polar(r, gBot, a));
  }

  const tableCenter = new THREE.Vector3(0, crownH, 0);
  for (let i = 0; i < 8; i++) {
    addTri(positions, tableCenter, table[i], table[(i + 1) % 8]);
  }

  for (let i = 0; i < 8; i++) {
    addTri(positions, table[i], table[(i + 1) % 8], star[(i + 1) % 8]);
  }

  for (let i = 0; i < 8; i++) {
    addTri(positions, table[i], star[i], star[(i + 1) % 8]);
    addTri(positions, star[i], gT[i * 2], star[(i + 1) % 8]);
  }

  for (let i = 0; i < 8; i++) {
    const s0 = star[i];
    const s1 = star[(i + 1) % 8];
    addTri(positions, s0, gT[i * 2], gT[i * 2 + 1]);
    addTri(positions, s1, gT[i * 2 + 1], gT[(i * 2 + 2) % 16]);
  }

  for (let i = 0; i < 16; i++) {
    addQuad(positions, gT[i], gT[(i + 1) % 16], gB[(i + 1) % 16], gB[i]);
  }

  const pav: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    pav.push(
      polar(0.5, gBot - pavilionH * 0.52, (i / 8) * TWO_PI + Math.PI / 8)
    );
  }
  const culet = new THREE.Vector3(0, gBot - pavilionH, 0);

  for (let i = 0; i < 8; i++) {
    const g0 = gB[i * 2];
    const g1 = gB[i * 2 + 1];
    const g2 = gB[(i * 2 + 2) % 16];
    const p0 = pav[i];
    const p1 = pav[(i + 1) % 8];
    addTri(positions, g0, g1, p0);
    addTri(positions, g1, g2, p1);
    addTri(positions, g1, p0, p1);
    addTri(positions, p0, p1, culet);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createBrilliantWire() {
  const positions: number[] = [];
  const tableR = 0.55;
  const crownH = 0.33;
  const girdleH = 0.038;
  const pavilionH = 0.86;
  const gTop = girdleH * 0.5;
  const gBot = -girdleH * 0.5;

  const pushLine = (a: THREE.Vector3, b: THREE.Vector3) => {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
  };

  const table: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    table.push(polar(tableR, crownH, (i / 8) * TWO_PI + Math.PI / 8));
  }
  for (let i = 0; i < 8; i++) {
    pushLine(table[i], table[(i + 1) % 8]);
  }

  const girdle: THREE.Vector3[] = [];
  for (let i = 0; i < 16; i++) {
    girdle.push(polar(1, gTop, (i / 16) * TWO_PI));
  }
  for (let i = 0; i < 16; i++) {
    pushLine(girdle[i], girdle[(i + 1) % 16]);
  }

  const culet = new THREE.Vector3(0, gBot - pavilionH, 0);
  for (let i = 0; i < 8; i++) {
    pushLine(girdle[i * 2], culet);
    pushLine(table[i], girdle[i * 2 + 1]);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  return geometry;
}

export function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRoughGeometry(seed = 7) {
  const base = new THREE.IcosahedronGeometry(1, 1);
  const geometry = base.toNonIndexed();
  const pos = geometry.attributes.position;
  const rng = mulberry32(seed);
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    const ridges = 0.78 + rng() * 0.34 + Math.abs(n.y) * 0.08;
    const shear = (rng() - 0.5) * 0.12;
    v.copy(n).multiplyScalar(ridges);
    v.x += shear;
    v.z -= shear * 0.4;
    v.y *= 1.08;
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createShardGeometry(seed: number) {
  const rng = mulberry32(seed);
  const geometry = new THREE.TetrahedronGeometry(0.08 + rng() * 0.07, 0);
  geometry.scale(0.7 + rng() * 0.8, 0.35 + rng() * 0.5, 0.5 + rng() * 0.7);
  geometry.computeVertexNormals();
  return geometry;
}
