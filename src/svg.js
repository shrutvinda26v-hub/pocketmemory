/** Deterministic luxury SVG primitives. Every gradient id is unique. */

export function svgDiamond(id, { tint = "#eef6ff" } = {}) {
  return `
<svg viewBox="0 0 48 52" class="svg-gem" aria-hidden="true">
  <defs>
    <linearGradient id="d${id}a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="${tint}"/>
      <stop offset="100%" stop-color="#b7c9de"/>
    </linearGradient>
    <linearGradient id="d${id}b" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#9eb4cc" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <polygon points="24,2 44,16 24,50 4,16" fill="url(#d${id}a)" stroke="#dfe9f4" stroke-width="0.4"/>
  <polygon points="24,2 32,16 24,22 16,16" fill="#ffffff" opacity="0.85" class="sparkle"/>
  <polygon points="24,2 44,16 32,16" fill="#c5d6ea" opacity="0.7"/>
  <polygon points="24,2 4,16 16,16" fill="url(#d${id}b)" opacity="0.8"/>
  <polygon points="4,16 24,50 16,16" fill="#8ea4bd" opacity="0.55"/>
  <polygon points="44,16 24,50 32,16" fill="#dce8f5" opacity="0.5"/>
  <polygon points="16,16 24,22 32,16" fill="#ffffff" opacity="0.55"/>
</svg>`;
}

export function svgGem(id, { color = "#1d4ea0", cut = "oval" } = {}) {
  const dark = shade(color, -0.35);
  const lite = shade(color, 0.42);
  if (cut === "pear") {
    return `
<svg viewBox="0 0 40 56" class="svg-gem" aria-hidden="true">
  <defs>
    <radialGradient id="g${id}" cx="38%" cy="28%" r="70%">
      <stop offset="0%" stop-color="${lite}"/>
      <stop offset="45%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <path d="M20,3 C28,3 36,16 36,26 C36,40 20,54 20,54 C20,54 4,40 4,26 C4,16 12,3 20,3Z" fill="url(#g${id})" stroke="${lite}" stroke-width="0.5"/>
  <path d="M20,8 L28,22 20,30 12,22Z" fill="${lite}" opacity="0.35" class="sparkle"/>
  <path d="M14,10 Q20,6 22,14" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.55"/>
</svg>`;
  }
  if (cut === "emerald") {
    return `
<svg viewBox="0 0 52 38" class="svg-gem" aria-hidden="true">
  <defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${lite}"/>
      <stop offset="50%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <polygon points="10,4 42,4 50,12 50,26 42,34 10,34 2,26 2,12" fill="url(#g${id})" stroke="${lite}" stroke-width="0.6"/>
  <polygon points="14,8 38,8 44,13 44,25 38,30 14,30 8,25 8,13" fill="${lite}" opacity="0.18"/>
  <polygon points="16,10 24,10 20,18" fill="#fff" opacity="0.35" class="sparkle"/>
</svg>`;
  }
  return `
<svg viewBox="0 0 48 60" class="svg-gem" aria-hidden="true">
  <defs>
    <radialGradient id="g${id}" cx="36%" cy="30%" r="72%">
      <stop offset="0%" stop-color="${lite}"/>
      <stop offset="42%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <ellipse cx="24" cy="30" rx="20" ry="26" fill="url(#g${id})" stroke="${lite}" stroke-width="0.7"/>
  <ellipse cx="18" cy="20" rx="7" ry="10" fill="#fff" opacity="0.22" class="sparkle"/>
  <path d="M24,6 L30,30 24,54 18,30Z" fill="${dark}" opacity="0.18"/>
  <path d="M8,30 L24,18 40,30 24,42Z" fill="${lite}" opacity="0.12"/>
</svg>`;
}

export function svgPearl(id, { tone = "#f4eee4" } = {}) {
  return `
<svg viewBox="0 0 32 32" aria-hidden="true">
  <defs>
    <radialGradient id="p${id}" cx="34%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="${tone}"/>
      <stop offset="100%" stop-color="#cbbba8"/>
    </radialGradient>
  </defs>
  <circle cx="16" cy="16" r="14" fill="url(#p${id})"/>
  <circle cx="11" cy="11" r="4.2" fill="#fff" opacity="0.55" class="sparkle"/>
</svg>`;
}

export function svgPetal(id, { color = "#f3b6c8" } = {}) {
  const dark = shade(color, -0.22);
  return `
<svg viewBox="0 0 36 56" aria-hidden="true">
  <defs>
    <linearGradient id="pt${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <path d="M18,4 C28,10 34,24 32,38 C30,48 22,54 18,54 C14,54 6,48 4,38 C2,24 8,10 18,4Z" fill="url(#pt${id})"/>
  <path d="M18,8 C20,22 20,40 18,52" fill="none" stroke="${dark}" stroke-width="0.6" opacity="0.35"/>
</svg>`;
}

export function svgLeaf(id) {
  return `
<svg viewBox="0 0 40 64" aria-hidden="true">
  <defs>
    <linearGradient id="lf${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9cbf6a"/>
      <stop offset="100%" stop-color="#3f6a32"/>
    </linearGradient>
  </defs>
  <path d="M20,2 C32,16 38,34 20,62 C2,34 8,16 20,2Z" fill="url(#lf${id})"/>
  <path d="M20,8 C22,26 22,44 20,60" fill="none" stroke="#2d4a24" stroke-width="0.8" opacity="0.45"/>
  <path d="M20,22 C26,26 28,30 30,34" fill="none" stroke="#2d4a24" stroke-width="0.5" opacity="0.35"/>
  <path d="M20,34 C14,38 12,42 10,46" fill="none" stroke="#2d4a24" stroke-width="0.5" opacity="0.35"/>
</svg>`;
}

export function svgGold(id, { variant = "scroll" } = {}) {
  if (variant === "bar") {
    return `
<svg viewBox="0 0 64 16" aria-hidden="true">
  <defs>
    <linearGradient id="gl${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8e7a8"/>
      <stop offset="45%" stop-color="#d4a441"/>
      <stop offset="100%" stop-color="#8a5a18"/>
    </linearGradient>
  </defs>
  <rect x="1" y="4" width="62" height="8" rx="3" fill="url(#gl${id})"/>
  <rect x="4" y="6" width="18" height="2" rx="1" fill="#fff6d2" opacity="0.45"/>
</svg>`;
  }
  if (variant === "frame") {
    return `
<svg viewBox="0 0 60 72" aria-hidden="true">
  <defs>
    <linearGradient id="gl${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3e0a6"/>
      <stop offset="50%" stop-color="#c9963a"/>
      <stop offset="100%" stop-color="#7a4e16"/>
    </linearGradient>
  </defs>
  <path d="M8,18 C8,8 18,6 30,6 C42,6 52,8 52,18 L56,54 C56,64 44,68 30,68 C16,68 4,64 4,54Z" fill="none" stroke="url(#gl${id})" stroke-width="4"/>
  <circle cx="30" cy="6" r="3.2" fill="#f6e7b0"/>
  <circle cx="8" cy="18" r="2.4" fill="#e8c56a"/>
  <circle cx="52" cy="18" r="2.4" fill="#e8c56a"/>
</svg>`;
  }
  return `
<svg viewBox="0 0 48 48" aria-hidden="true">
  <defs>
    <linearGradient id="gl${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7e7b4"/>
      <stop offset="40%" stop-color="#d7ae4a"/>
      <stop offset="100%" stop-color="#7c4f14"/>
    </linearGradient>
  </defs>
  <path d="M8,28 C8,12 20,6 28,8 C22,16 24,22 34,18 C40,16 44,22 40,30 C36,40 22,44 14,40 C8,36 8,32 8,28Z" fill="url(#gl${id})"/>
  <path d="M16,22 C22,16 30,18 32,24" fill="none" stroke="#fff3c4" stroke-width="1.1" opacity="0.55"/>
</svg>`;
}

export function svgChainLink(id) {
  return `
<svg viewBox="0 0 22 34" aria-hidden="true">
  <defs>
    <linearGradient id="ch${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3e0a4"/>
      <stop offset="50%" stop-color="#c9963a"/>
      <stop offset="100%" stop-color="#7a4e16"/>
    </linearGradient>
  </defs>
  <ellipse cx="11" cy="17" rx="7" ry="12.5" fill="none" stroke="url(#ch${id})" stroke-width="3.1"/>
  <ellipse cx="11" cy="17" rx="4.2" ry="9.2" fill="none" stroke="#fff1c2" stroke-width="0.6" opacity="0.35"/>
</svg>`;
}

export function svgFlower(id, { color = "#e9a0b8" } = {}) {
  const dark = shade(color, -0.2);
  const lite = shade(color, 0.18);
  return `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <radialGradient id="fl${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${lite}"/>
      <stop offset="70%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  ${[0, 45, 90, 135, 180, 225, 270, 315]
    .map(
      (a, i) =>
        `<ellipse cx="32" cy="18" rx="8" ry="16" fill="url(#fl${id})" transform="rotate(${a} 32 32)" opacity="${0.82 + (i % 3) * 0.05}"/>`
    )
    .join("")}
  <circle cx="32" cy="32" r="7" fill="#f4e3a8"/>
  <circle cx="32" cy="32" r="3.4" fill="#c9843a"/>
</svg>`;
}

function shade(hex, amt) {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = clamp(r + Math.round(255 * amt));
  g = clamp(g + Math.round(255 * amt));
  b = clamp(b + Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}
