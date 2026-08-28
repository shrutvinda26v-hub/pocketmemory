const VERT = `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTex;
uniform vec3 uFrom;
uniform vec3 uTo;
uniform float uFromAmt;
uniform float uToAmt;
uniform float uProgress;
uniform float uSoftness;

vec3 rgb2hsl(vec3 color) {
  float maxc = max(max(color.r, color.g), color.b);
  float minc = min(min(color.r, color.g), color.b);
  float l = (maxc + minc) * 0.5;
  float d = maxc - minc;
  if (d < 1e-5) {
    return vec3(0.0, 0.0, l);
  }
  float s = l > 0.5 ? d / (2.0 - maxc - minc) : d / (maxc + minc);
  float h;
  if (maxc == color.r) h = mod((color.g - color.b) / d, 6.0);
  else if (maxc == color.g) h = (color.b - color.r) / d + 2.0;
  else h = (color.r - color.g) / d + 4.0;
  h /= 6.0;
  if (h < 0.0) h += 1.0;
  return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x;
  float s = hsl.y;
  float l = hsl.z;
  if (s < 1e-5) return vec3(l);
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(
    hue2rgb(p, q, h + 1.0 / 3.0),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1.0 / 3.0)
  );
}

vec3 colorBlend(vec3 base, vec3 blend) {
  vec3 baseH = rgb2hsl(base);
  vec3 blendH = rgb2hsl(blend);
  float sat = min(1.0, blendH.y * 1.12 + 0.08);
  return hsl2rgb(vec3(blendH.x, sat, baseH.z));
}

vec3 overlay(vec3 base, vec3 blend) {
  return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}

vec3 tintSkin(vec3 src, vec3 target, float amount) {
  if (amount < 0.001) return src;
  vec3 colored = colorBlend(src, target);
  vec3 warmed = overlay(src, mix(vec3(0.5), target, 0.72));
  vec3 mixed = mix(colored, warmed, 0.28);
  float lum = dot(src, vec3(0.2126, 0.7152, 0.0722));
  float shadow = smoothstep(0.03, 0.16, lum);
  float highlight = smoothstep(0.78, 0.97, lum);
  mixed = mix(src, mixed, shadow);
  mixed = mix(mixed, src, highlight * 0.62);
  return mix(src, mixed, amount);
}

void main() {
  vec4 src = texture(uTex, vUv);
  if (src.a < 0.01) discard;

  // Head is the top of the image, tail sits lower-right.
  // vUv.y = 1 at the crest, 0 at the floor after Y-flip.
  float y = 1.0 - vUv.y;
  y += (vUv.x - 0.52) * 0.16;
  y += sin(vUv.x * 36.0 + vUv.y * 14.0) * 0.018;
  y = clamp(y, 0.0, 1.0);

  float t = mix(-uSoftness, 1.0 + uSoftness, uProgress);
  float reveal = 1.0 - smoothstep(t - uSoftness, t + uSoftness, y);

  vec3 fromCol = tintSkin(src.rgb, uFrom, uFromAmt);
  vec3 toCol = tintSkin(src.rgb, uTo, uToAmt);
  vec3 mixed = mix(fromCol, toCol, reveal);

  float front = exp(-pow((y - t) * 14.0, 2.0));
  mixed += toCol * front * 0.28;

  outColor = vec4(mixed * src.a, src.a);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(gl, vert, frag) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

export async function createChameleon(canvas, src) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
  });
  if (!gl) throw new Error("WebGL2 is required");

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load chameleon"));
    img.src = src;
  });

  const program = createProgram(gl, VERT, FRAG);
  gl.useProgram(program);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const aPos = gl.getAttribLocation(program, "aPos");
  const aUv = gl.getAttribLocation(program, "aUv");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  const uniforms = {
    uTex: gl.getUniformLocation(program, "uTex"),
    uFrom: gl.getUniformLocation(program, "uFrom"),
    uTo: gl.getUniformLocation(program, "uTo"),
    uFromAmt: gl.getUniformLocation(program, "uFromAmt"),
    uToAmt: gl.getUniformLocation(program, "uToAmt"),
    uProgress: gl.getUniformLocation(program, "uProgress"),
    uSoftness: gl.getUniformLocation(program, "uSoftness"),
  };

  gl.uniform1i(uniforms.uTex, 0);
  gl.uniform1f(uniforms.uSoftness, 0.11);

  const state = {
    from: [0.35, 0.62, 0.52],
    to: [0.35, 0.62, 0.52],
    fromAmt: 0,
    toAmt: 0,
    progress: 1,
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform3fv(uniforms.uFrom, state.from);
    gl.uniform3fv(uniforms.uTo, state.to);
    gl.uniform1f(uniforms.uFromAmt, state.fromAmt);
    gl.uniform1f(uniforms.uToAmt, state.toAmt);
    gl.uniform1f(uniforms.uProgress, state.progress);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  draw();

  return {
    image,
    state,
    draw,
    resize,
  };
}
