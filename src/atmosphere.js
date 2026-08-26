const $ = (sel) => document.querySelector(sel);

function svg(html) {
  const wrap = document.createElement("div");
  wrap.className = "moment";
  wrap.innerHTML = html.trim();
  return wrap;
}

function spawn(cls, x, y) {
  const el = document.createElement("div");
  el.className = `moment ${cls}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  return el;
}

const MOMENTS = {
  dragon: (origin) => {
    const gid = `dg-${Math.random().toString(36).slice(2, 8)}`;
    const el = svg(`
      <svg viewBox="0 0 200 80" width="240" height="96">
        <defs>
          <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff6a1a"/>
            <stop offset="55%" stop-color="#c45a12"/>
            <stop offset="100%" stop-color="#3a0a08"/>
          </linearGradient>
        </defs>
        <g fill="url(#${gid})">
          <path d="M8 50C22 46 34 28 56 32C72 16 98 14 118 32C138 24 164 20 192 12C172 36 144 46 118 48C94 62 60 66 32 60C20 68 10 60 8 50Z"/>
          <path d="M56 32C46 8 72 2 80 26"/>
          <path d="M86 24C80 4 102 0 108 22"/>
        </g>
        <circle cx="128" cy="30" r="2.4" fill="#ffd27a"/>
      </svg>
    `);
    const goingRight = origin.x < innerWidth * 0.5;
    const endX = goingRight ? innerWidth + 200 : -240;
    const endY = origin.y - 90 - Math.random() * 110;
    const rot = goingRight ? 10 : -14;
    el.style.left = `${origin.x}px`;
    el.style.top = `${origin.y}px`;
    el.animate(
      [
        { transform: "translate(-40%, -40%) scale(.4) rotate(-6deg)", opacity: 0 },
        { transform: "translate(-40%, -80%) scale(1) rotate(4deg)", opacity: 1, offset: 0.16 },
        {
          transform: `translate(${endX - origin.x}px, ${endY - origin.y}px) scale(1.18) rotate(${rot}deg)`,
          opacity: 0.95,
          offset: 0.82,
        },
        {
          transform: `translate(${endX - origin.x}px, ${endY - origin.y - 36}px) scale(.85) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      { duration: 2400, easing: "cubic-bezier(.22,.7,.28,1)", fill: "forwards" },
    );
    return el;
  },

  forest: (origin) => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 16; i += 1) {
      const el = spawn(
        "leaf-moment",
        origin.x + (Math.random() - 0.5) * 90,
        origin.y + (Math.random() - 0.5) * 46,
      );
      const dx = (Math.random() - 0.15) * innerWidth * 0.72;
      const dy = 140 + Math.random() * 280;
      const rot = (Math.random() - 0.5) * 560;
      el.animate(
        [
          { transform: "translate(0,0) rotate(0deg) scale(.35)", opacity: 0 },
          {
            transform: `translate(${dx * 0.28}px, -36px) rotate(${rot * 0.28}deg) scale(1)`,
            opacity: 1,
            offset: 0.18,
          },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(.65)`, opacity: 0 },
        ],
        {
          duration: 2600 + Math.random() * 900,
          delay: i * 38,
          easing: "cubic-bezier(.2,.6,.2,1)",
          fill: "forwards",
        },
      );
      frag.appendChild(el);
    }
    return frag;
  },

  castle: (origin) => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 6; i += 1) {
      const el = svg(`
        <svg viewBox="0 0 44 18" width="${26 + i * 3}" height="14">
          <path d="M1 11Q12 2 18 11Q24 2 43 9Q26 9 18 14Q10 9 1 11Z" fill="#1a140c"/>
        </svg>
      `);
      el.style.left = `${origin.x}px`;
      el.style.top = `${origin.y - 16}px`;
      const dir = origin.x < innerWidth * 0.5 ? 1 : -1;
      const dx = dir * (innerWidth * (0.42 + i * 0.05));
      const dy = -36 - i * 26 - Math.random() * 50;
      el.animate(
        [
          { transform: "translate(0,0) scale(.35)", opacity: 0 },
          { transform: `translate(${dx * 0.18}px, ${dy * 0.2}px) scale(1)`, opacity: 1, offset: 0.14 },
          { transform: `translate(${dx}px, ${dy}px) scale(.8)`, opacity: 0 },
        ],
        {
          duration: 2100 + i * 160,
          delay: i * 80,
          easing: "cubic-bezier(.2,.65,.2,1)",
          fill: "forwards",
        },
      );
      frag.appendChild(el);
    }
    return frag;
  },

  underwater: (origin) => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 20; i += 1) {
      const size = 6 + Math.random() * 16;
      const b = spawn(
        "bubble-moment",
        origin.x + (Math.random() - 0.5) * 80,
        origin.y + (Math.random() - 0.5) * 24,
      );
      b.style.width = `${size}px`;
      b.style.height = `${size}px`;
      b.animate(
        [
          { transform: "translate(0,0) scale(.25)", opacity: 0 },
          {
            transform: `translate(${(Math.random() - 0.5) * 40}px, -90px) scale(1)`,
            opacity: 0.9,
            offset: 0.32,
          },
          {
            transform: `translate(${(Math.random() - 0.5) * 90}px, ${-230 - Math.random() * 90}px)`,
            opacity: 0,
          },
        ],
        { duration: 1300 + Math.random() * 500, delay: i * 24, fill: "forwards" },
      );
      frag.appendChild(b);
    }
    const gid = `wh-${Math.random().toString(36).slice(2, 8)}`;
    const whale = svg(`
      <svg viewBox="0 0 220 80" width="300" height="108">
        <defs>
          <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#9edaf0"/>
            <stop offset="100%" stop-color="#1a4a6a"/>
          </linearGradient>
        </defs>
        <ellipse cx="110" cy="42" rx="78" ry="22" fill="url(#${gid})"/>
        <path d="M32 42 Q8 18 4 42 Q8 62 32 48Z" fill="#2a6288"/>
        <ellipse cx="168" cy="38" rx="18" ry="12" fill="#5aa6c8"/>
        <circle cx="176" cy="36" r="2.4" fill="#0b2030"/>
        <path d="M110 58 Q118 72 128 58" fill="#3a7aa0"/>
      </svg>
    `);
    whale.style.left = `${origin.x}px`;
    whale.style.top = `${origin.y + 8}px`;
    const dir = origin.x < innerWidth * 0.5 ? 1 : -1;
    whale.animate(
      [
        { transform: `translate(0,0) scale(.3) scaleX(${dir})`, opacity: 0 },
        {
          transform: `translate(${dir * 70}px, -18px) scale(.82) scaleX(${dir})`,
          opacity: 1,
          offset: 0.2,
        },
        {
          transform: `translate(${dir * innerWidth * 0.7}px, -36px) scale(1) scaleX(${dir})`,
          opacity: 0.95,
          offset: 0.78,
        },
        {
          transform: `translate(${dir * innerWidth * 0.92}px, -24px) scale(.75) scaleX(${dir})`,
          opacity: 0,
        },
      ],
      { duration: 3200, delay: 380, easing: "cubic-bezier(.22,.7,.2,1)", fill: "forwards" },
    );
    frag.appendChild(whale);
    return frag;
  },

  galaxy: (origin) => {
    const el = spawn("shooting-star", origin.x, origin.y);
    const goingRight = origin.x < innerWidth * 0.55;
    const endX = goingRight ? innerWidth + 40 : -180;
    const endY = origin.y + (goingRight ? innerWidth * 0.16 : -innerWidth * 0.1);
    const ang = (Math.atan2(endY - origin.y, endX - origin.x) * 180) / Math.PI;
    el.animate(
      [
        { transform: `rotate(${ang}deg) scaleX(.2)`, opacity: 0 },
        { transform: `rotate(${ang}deg) scaleX(1)`, opacity: 1, offset: 0.08 },
        {
          transform: `translate(${endX - origin.x}px, ${endY - origin.y}px) rotate(${ang}deg) scaleX(1)`,
          opacity: 1,
          offset: 0.86,
        },
        {
          transform: `translate(${endX - origin.x}px, ${endY - origin.y}px) rotate(${ang}deg) scaleX(.3)`,
          opacity: 0,
        },
      ],
      { duration: 1600, easing: "cubic-bezier(.15,.7,.2,1)", fill: "forwards" },
    );
    return el;
  },

  garden: (origin) => {
    const el = svg(`
      <svg viewBox="0 0 48 40" width="58" height="48">
        <ellipse cx="16" cy="20" rx="12" ry="8" fill="#d4783a" transform="rotate(-18 16 20)"/>
        <ellipse cx="32" cy="20" rx="12" ry="8" fill="#f0b060" transform="rotate(18 32 20)"/>
        <ellipse cx="24" cy="22" rx="4" ry="6" fill="#5a3a12"/>
      </svg>
    `);
    const book = $("#bookShell");
    const r = book.getBoundingClientRect();
    const cx = r.left + r.width * 0.5;
    const cy = r.top + r.height * 0.42;
    el.style.left = `${origin.x}px`;
    el.style.top = `${origin.y}px`;
    el.style.zIndex = "11";
    el.animate(
      [
        { transform: "translate(-50%, -50%) scale(.25)", opacity: 0 },
        {
          transform: `translate(${cx - origin.x}px, ${cy - origin.y - 110}px) scale(1) rotate(18deg)`,
          opacity: 1,
          offset: 0.22,
        },
        {
          transform: `translate(${cx - origin.x + 170}px, ${cy - origin.y - 20}px) scale(1) rotate(-12deg)`,
          opacity: 1,
          offset: 0.44,
        },
        {
          transform: `translate(${cx - origin.x + 20}px, ${cy - origin.y + 90}px) scale(.95) rotate(14deg)`,
          opacity: 1,
          offset: 0.66,
        },
        {
          transform: `translate(${cx - origin.x - 40}px, ${cy - origin.y + 8}px) scale(.55) rotate(-6deg)`,
          opacity: 0.7,
          offset: 0.84,
        },
        {
          transform: `translate(${cx - origin.x - 16}px, ${cy - origin.y - 6}px) scale(.2)`,
          opacity: 0,
        },
      ],
      { duration: 2800, easing: "cubic-bezier(.22,.7,.28,1)", fill: "forwards" },
    );
    return el;
  },
};

export function playMoment(worldId, origin) {
  const layer = $("#moments");
  const make = MOMENTS[worldId];
  if (!layer || !make) return;
  const pack = document.createElement("div");
  pack.className = "moment-pack";
  pack.appendChild(make(origin));
  layer.appendChild(pack);
  window.setTimeout(() => pack.remove(), 4500);
}
