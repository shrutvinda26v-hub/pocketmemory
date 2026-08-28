export const chameleonVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vDepth;
varying float vBody;

uniform sampler2D tDepth;
uniform sampler2D tMask;
uniform float uBreathe;
uniform float uTail;
uniform float uWeight;
uniform vec2 uHead;
uniform float uTime;

void main() {
  vUv = uv;
  float depth = texture2D(tDepth, uv).r;
  float body = texture2D(tMask, uv).r;
  vDepth = depth;
  vBody = body;

  vec3 pos = position;
  pos.z += depth * 0.22;

  float chest = smoothstep(0.22, 0.48, uv.y) * smoothstep(0.72, 0.42, uv.y) * smoothstep(0.18, 0.4, uv.x) * smoothstep(0.78, 0.55, uv.x);
  pos.z += uBreathe * 0.028 * (0.35 + depth) * chest;

  vec2 headC = vec2(0.455, 0.63);
  float headM = smoothstep(0.28, 0.08, length((uv - headC) * vec2(1.65, 1.0))) * body;
  pos.x += uHead.x * 0.045 * headM;
  pos.y += uHead.y * 0.028 * headM;
  pos.z += abs(uHead.x) * 0.01 * headM;

  vec2 tailC = vec2(0.70, 0.50);
  float tailM = smoothstep(0.26, 0.08, length((uv - tailC) * vec2(1.4, 1.15))) * body;
  float ta = uTail * 0.04;
  pos.x += cos(uTime * 0.7) * ta * tailM;
  pos.y += sin(uTime * 0.55 + 1.2) * ta * 0.6 * tailM;

  pos.x += uWeight * 0.012 * body * depth;

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const chameleonFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vWorldPos;
varying float vDepth;
varying float vBody;

uniform sampler2D tMap;
uniform sampler2D tMask;
uniform float uTime;
uniform vec2 uLook;
uniform float uBlink;
uniform float uTransition;
uniform float uFromAmount;
uniform float uToAmount;
uniform vec3 uFromColor;
uniform vec3 uToColor;
uniform vec2 uSpreadUv;
uniform float uPulse;
uniform float uEnergy;
uniform vec3 uCrystalPos[7];
uniform vec3 uCrystalCol[7];
uniform float uCrystalGlow[7];

vec3 hash3(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return fract(sin(p) * 43758.5453123);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash3(i).x;
  float n100 = hash3(i + vec3(1.0, 0.0, 0.0)).x;
  float n010 = hash3(i + vec3(0.0, 1.0, 0.0)).x;
  float n110 = hash3(i + vec3(1.0, 1.0, 0.0)).x;
  float n001 = hash3(i + vec3(0.0, 0.0, 1.0)).x;
  float n101 = hash3(i + vec3(1.0, 0.0, 1.0)).x;
  float n011 = hash3(i + vec3(0.0, 1.0, 1.0)).x;
  float n111 = hash3(i + vec3(1.0, 1.0, 1.0)).x;
  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);
}

vec3 applyTint(vec3 albedo, vec3 tint) {
  float luma = dot(albedo, vec3(0.299, 0.587, 0.114));
  vec3 detail = albedo / max(luma, 0.06);
  float tl = dot(tint, vec3(0.299, 0.587, 0.114));
  vec3 hue = tint / max(tl, 0.06);
  vec3 shifted = detail * luma * hue * 1.08;
  shifted = mix(shifted, shifted * (0.78 + luma * 0.55), 0.35);
  return clamp(shifted, 0.0, 1.0);
}

float eyeDist(vec2 uv, vec2 center) {
  vec2 d = (uv - center) * vec2(1.777, 1.0);
  return length(d);
}

vec3 sampleEye(vec2 uv, vec2 center, vec2 look, float blink, vec3 albedo) {
  float radius = 0.056;
  vec2 aspect = vec2(1.777, 1.0);
  vec2 local = (uv - center) * aspect;
  float dist = length(local);
  if (dist > radius * 1.15) return albedo;

  vec2 offset = look * radius * 0.42;
  vec2 sampleLocal = local - offset;
  vec2 sampleUv = center + sampleLocal / aspect;

  float inside = smoothstep(radius * 1.12, radius * 0.78, dist);
  vec3 moved = texture2D(tMap, sampleUv).rgb;
  vec3 eyeCol = mix(albedo, moved, inside);

  vec2 hl = local - vec2(-0.30, 0.34) * radius;
  float spec = smoothstep(0.18 * radius, 0.02 * radius, length(hl));
  vec2 hl2 = local - vec2(-0.18, 0.22) * radius;
  float spec2 = smoothstep(0.08 * radius, 0.01 * radius, length(hl2));
  eyeCol += spec * 0.55 + spec2 * 0.22;

  float ny = local.y / radius;
  float lidShape = 1.0 - blink * 1.05;
  float lid = smoothstep(lidShape + 0.08, lidShape - 0.12, ny);
  float lower = smoothstep(-0.72 + blink * 0.35, -0.92 + blink * 0.2, ny);
  float closed = max(lid, lower * blink);

  vec2 lidUv = center + vec2(local.x, max(radius * 0.95, abs(local.y))) / aspect;
  vec3 lidCol = texture2D(tMap, lidUv).rgb * 0.92;
  eyeCol = mix(eyeCol, lidCol, clamp(closed, 0.0, 1.0));

  return eyeCol;
}

void main() {
  vec2 uv = vUv;
  vec3 albedo = texture2D(tMap, uv).rgb;
  float body = max(vBody, texture2D(tMask, uv).r);

  vec2 look = uLook;
  albedo = sampleEye(uv, vec2(0.343, 0.632), look, uBlink, albedo);
  albedo = sampleEye(uv, vec2(0.575, 0.626), look, uBlink, albedo);

  float n = noise(vec3(uv * 9.0, uTime * 0.12));
  vec2 origin = uSpreadUv * vec2(1.777, 1.0);
  vec2 p = uv * vec2(1.777, 1.0);
  float d = length(p - origin);
  float tailBias = smoothstep(0.58, 0.82, uv.x) * 0.28;
  float headBias = smoothstep(0.58, 0.78, uv.y) * 0.1;
  float footBias = (1.0 - smoothstep(0.18, 0.38, uv.y)) * -0.12;
  float progress = uTransition * 1.5;
  float spread = smoothstep(0.0, 0.2, progress - d * 1.05 - tailBias - headBias - footBias + n * 0.1);
  spread *= smoothstep(0.05, 0.45, body + vDepth);

  float amt = mix(uFromAmount, uToAmount, spread);
  vec3 tintCol = mix(uFromColor, uToColor, spread);
  vec3 tinted = applyTint(albedo, tintCol);
  vec3 color = mix(albedo, tinted, amt);

  vec3 light = vec3(0.0);
  for (int i = 0; i < 7; i++) {
    float dist = distance(vWorldPos, uCrystalPos[i]);
    float att = uCrystalGlow[i] / (1.0 + dist * dist * 6.5);
    light += uCrystalCol[i] * att;
  }
  color += color * light * 0.38 * (0.25 + body);

  float pulse = uPulse * exp(-length(p - origin) * 3.4) * body;
  color += tintCol * pulse * 0.55;

  float energyBand = uEnergy * smoothstep(0.22, 0.0, abs(d - uTransition * 0.9)) * body;
  color += tintCol * energyBand * 0.28;

  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color += vec3(0.04, 0.035, 0.02) * pow(luma, 1.4) * body * 0.15;

  gl_FragColor = vec4(color, 1.0);
}
`;
