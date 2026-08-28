import * as THREE from "three";

export function createSkinUniforms() {
  return {
    uProgress: { value: 1 },
    uFrom: { value: new THREE.Color("#3aa38a") },
    uTo: { value: new THREE.Color("#3aa38a") },
    uFromAmt: { value: 0 },
    uToAmt: { value: 0 },
  };
}

export function createSkinMaterial(albedo, bump, uniforms) {
  const material = new THREE.MeshPhysicalMaterial({
    map: albedo,
    bumpMap: bump,
    bumpScale: 0.06,
    roughness: 0.46,
    metalness: 0.05,
    sheen: 0.42,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color("#6fd0b4"),
    envMapIntensity: 0.55,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uProgress = uniforms.uProgress;
    shader.uniforms.uFrom = uniforms.uFrom;
    shader.uniforms.uTo = uniforms.uTo;
    shader.uniforms.uFromAmt = uniforms.uFromAmt;
    shader.uniforms.uToAmt = uniforms.uToAmt;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
       attribute float along;
       varying float vAlong;
       varying vec3 vWorldN;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       vAlong = along;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <defaultnormal_vertex>",
      `#include <defaultnormal_vertex>
       vWorldN = normalize(mat3(modelMatrix) * objectNormal);`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
       uniform float uProgress;
       uniform vec3 uFrom;
       uniform vec3 uTo;
       uniform float uFromAmt;
       uniform float uToAmt;
       varying float vAlong;
       varying vec3 vWorldN;

       vec3 rgb2hsl(vec3 color) {
         float maxc = max(max(color.r, color.g), color.b);
         float minc = min(min(color.r, color.g), color.b);
         float l = (maxc + minc) * 0.5;
         float d = maxc - minc;
         if (d < 1e-5) return vec3(0.0, 0.0, l);
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
         if (hsl.y < 1e-5) return vec3(hsl.z);
         float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
         float p = 2.0 * hsl.z - q;
         return vec3(
           hue2rgb(p, q, hsl.x + 1.0 / 3.0),
           hue2rgb(p, q, hsl.x),
           hue2rgb(p, q, hsl.x - 1.0 / 3.0)
         );
       }

       vec3 colorBlend(vec3 base, vec3 blend) {
         vec3 bh = rgb2hsl(base);
         vec3 lh = rgb2hsl(blend);
         return hsl2rgb(vec3(lh.x, min(1.0, lh.y * 1.1 + 0.06), bh.z));
       }

       vec3 tintSkin(vec3 src, vec3 target, float amount) {
         if (amount < 0.001) return src;
         vec3 colored = colorBlend(src, target);
         float lum = dot(src, vec3(0.2126, 0.7152, 0.0722));
         float shadow = smoothstep(0.03, 0.16, lum);
         float highlight = smoothstep(0.78, 0.97, lum);
         colored = mix(src, colored, shadow);
         colored = mix(colored, src, highlight * 0.55);
         return mix(src, colored, amount);
       }`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       float facing = smoothstep(0.05, 0.72, dot(normalize(vWorldN), vec3(0.0, 0.12, 1.0)));
       vec3 proc = mix(vec3(0.22, 0.48, 0.42), vec3(0.55, 0.72, 0.48), facing);
       diffuseColor.rgb = mix(proc, diffuseColor.rgb, facing);

       float t = mix(-0.12, 1.12, uProgress);
       float reveal = 1.0 - smoothstep(t - 0.11, t + 0.11, vAlong);
       vec3 fromCol = tintSkin(diffuseColor.rgb, uFrom, uFromAmt);
       vec3 toCol = tintSkin(diffuseColor.rgb, uTo, uToAmt);
       diffuseColor.rgb = mix(fromCol, toCol, reveal);
       float front = exp(-pow((vAlong - t) * 12.0, 2.0));
       diffuseColor.rgb += toCol * front * 0.16;`
    );
  };

  material.customProgramCacheKey = () => "chameleon-skin-v2";
  return material;
}
