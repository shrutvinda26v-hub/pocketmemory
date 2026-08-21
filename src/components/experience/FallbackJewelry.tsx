"use client";

import { useMemo } from "react";
import { getJourney } from "@/lib/journey";
import { lerp } from "@/lib/math";
import { useJourney } from "@/store/useJourney";
import { mulberry32 } from "@/lib/diamondGeometry";

export function FallbackJewelry() {
  const progress = useJourney((s) => s.progress);
  const frame = getJourney(progress);
  const t = progress;

  const yaw = frame.objectYaw * 18 + progress * 12;
  const pitch = frame.objectPitch * 18;
  const scale = lerp(0.92, 1.08, frame.objectScale - 1 + 0.5);
  const polish = frame.polish;
  const glow = 0.35 + frame.glow * 0.55;

  const dust = useMemo(() => {
    const rng = mulberry32(21);
    return Array.from({ length: 28 }).map((_, i) => ({
      x: rng() * 100,
      y: rng() * 100,
      s: 1 + rng() * 2.2,
      d: 8 + rng() * 16,
      delay: rng() * 8,
      gold: i % 5 === 0,
    }));
  }, []);

  const shards = useMemo(() => {
    const rng = mulberry32(44);
    return Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return {
        x: Math.cos(a) * (28 + rng() * 10),
        y: Math.sin(a) * (22 + rng() * 8) - 8,
        r: rng() * 40,
        w: 6 + rng() * 8,
        h: 4 + rng() * 6,
      };
    });
  }, []);

  return (
    <div className="fallback-stage" aria-hidden>
      <div
        className="fallback-glow"
        style={{ opacity: glow, transform: `scale(${1 + frame.glow * 0.18})` }}
      />
      <div className="fallback-dust">
        {dust.map((p, i) => (
          <span
            key={i}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.s,
              height: p.s,
              animationDuration: `${p.d}s`,
              animationDelay: `-${p.delay}s`,
              background: p.gold ? "#d8b978" : "#f5f3ee",
            }}
          />
        ))}
      </div>

      <div
        className="fallback-jewel"
        style={{
          transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${scale})`,
        }}
      >
        <svg viewBox="0 0 200 240" className="fallback-svg">
          <defs>
            <radialGradient id="gGlow" cx="50%" cy="42%" r="48%">
              <stop offset="0%" stopColor="#f5f3ee" stopOpacity="0.28" />
              <stop offset="42%" stopColor="#d8b978" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#11100e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gPlat" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f2f1ee" />
              <stop offset="38%" stopColor="#c6c8c5" />
              <stop offset="70%" stopColor="#9a9c99" />
              <stop offset="100%" stopColor="#e8e7e3" />
            </linearGradient>
            <linearGradient id="gPlatDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dddcd8" />
              <stop offset="100%" stopColor="#7d7f7c" />
            </linearGradient>
            <linearGradient id="gIce" x1="0.15" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#eef4ff" />
              <stop offset="100%" stopColor="#c5d4ea" />
            </linearGradient>
            <linearGradient id="gFacetA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#c9d7ec" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="gFacetB" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f4f8ff" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#8fa4c0" stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id="gRough" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e8edf3" />
              <stop offset="55%" stopColor="#b9c3d0" />
              <stop offset="100%" stopColor="#8b97a6" />
            </linearGradient>
            <filter id="soft">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>

          <ellipse
            cx="100"
            cy="118"
            rx="78"
            ry="70"
            fill="url(#gGlow)"
            opacity={0.85}
          />

          <g
            className="fallback-ring"
            style={{ opacity: frame.ringOpacity }}
            transform={`translate(0 ${lerp(28, 0, frame.ringExplode)})`}
          >
            <ellipse
              cx="100"
              cy="148"
              rx="62"
              ry="70"
              fill="none"
              stroke="url(#gPlatDark)"
              strokeWidth="13"
            />
            <ellipse
              cx="100"
              cy="148"
              rx="62"
              ry="70"
              fill="none"
              stroke="url(#gPlat)"
              strokeWidth="7.5"
            />
            <ellipse
              cx="100"
              cy="146"
              rx="62"
              ry="70"
              fill="none"
              stroke="rgba(255,255,255,0.38)"
              strokeWidth="1.4"
              strokeDasharray="18 210"
              strokeDashoffset={t * -40}
            />
            <g
              style={{ opacity: frame.ringOpacity }}
              transform={`translate(0 ${lerp(-18, 0, frame.ringExplode)})`}
            >
              <ellipse
                cx="100"
                cy="78"
                rx="16"
                ry="7"
                fill="none"
                stroke="url(#gPlat)"
                strokeWidth="3.2"
              />
              {[0.55, 2.6, 3.7, -0.55].map((a, i) => {
                const close = frame.prongClose;
                const lean = lerp(14, 4, close);
                const x = 100 + Math.cos(a) * lerp(22, 12, frame.ringExplode);
                const y = 72 + Math.sin(a) * 5;
                return (
                  <g key={i} transform={`translate(${x} ${y}) rotate(${Math.cos(a) * lean * 4})`}>
                    <rect x="-1.3" y="0" width="2.6" height="18" rx="1.1" fill="url(#gPlat)" />
                    <circle cx="0" cy="1" r="1.8" fill="#ececea" />
                  </g>
                );
              })}
            </g>
          </g>

          <g
            className="fallback-guides"
            style={{ opacity: Math.max(frame.guides, frame.setGuides) * 0.9 }}
          >
            <circle cx="100" cy="86" r="48" fill="none" stroke="#d8b978" strokeWidth="0.6" />
            <line x1="100" y1="38" x2="100" y2="136" stroke="#d8b978" strokeWidth="0.5" />
            <line x1="58" y1="86" x2="142" y2="86" stroke="#d8b978" strokeWidth="0.5" />
            <line x1="100" y1="86" x2="148" y2="58" stroke="#d8b978" strokeWidth="0.45" />
            <line x1="100" y1="86" x2="52" y2="58" stroke="#d8b978" strokeWidth="0.45" />
          </g>

          <g
            className="fallback-rough"
            style={{ opacity: frame.roughOpacity }}
            transform={`translate(100 ${70 + (frame.diamondY - 0.26) * 8})`}
          >
            <polygon
              points="0,-34 18,-26 32,-8 28,16 8,32 -16,28 -30,8 -26,-18"
              fill="url(#gRough)"
              stroke="#dfe6ee"
              strokeWidth="0.8"
              opacity="0.95"
            />
            <polygon points="0,-34 18,-26 4,-4" fill="#f7f9fc" opacity="0.35" />
            <polygon points="18,-26 32,-8 4,-4" fill="#9aabbe" opacity="0.28" />
            <polygon points="-26,-18 0,-34 4,-4" fill="#c5d0dc" opacity="0.22" />
            <line x1="-8" y1="-10" x2="12" y2="8" stroke="#f5f3ee" strokeWidth="0.6" opacity="0.35" />
          </g>

          <g
            className="fallback-cut"
            style={{
              opacity: frame.cutOpacity,
              filter: `saturate(${0.7 + polish * 0.5}) brightness(${0.82 + polish * 0.4})`,
            }}
            transform={`translate(0 ${(0.26 - frame.diamondY) * 72})`}
          >
            <polygon points="100,44 118,56 100,62 82,56" fill="#ffffff" opacity={0.55 + polish * 0.35} />
            <polygon points="82,56 100,62 88,78 70,68" fill="url(#gFacetA)" />
            <polygon points="118,56 130,68 112,78 100,62" fill="url(#gFacetB)" />
            <polygon points="70,68 88,78 76,90 58,82" fill="#c5d3e6" opacity={0.55} />
            <polygon points="130,68 142,82 124,90 112,78" fill="#9eb0c8" opacity={0.5} />
            <polygon points="88,78 100,62 112,78 100,92" fill="#f8fbff" opacity={0.42 + polish * 0.3} />
            <polygon points="76,90 100,92 88,108 68,104" fill="#d9e4f2" opacity={0.7} />
            <polygon points="124,90 132,104 112,108 100,92" fill="#a9bbd1" opacity={0.62} />
            <polygon points="88,108 100,92 112,108 100,128" fill="#eef4ff" opacity={0.5 + polish * 0.25} />
            <polygon points="68,104 88,108 100,128 78,122" fill="#8fa3bb" opacity={0.55} />
            <polygon points="112,108 132,104 122,122 100,128" fill="#cfdced" opacity={0.6} />
            <polygon points="78,122 100,128 90,146" fill="#dce6f3" opacity={0.75} />
            <polygon points="122,122 110,146 100,128" fill="#b7c7db" opacity={0.7} />
            <polygon points="90,146 100,128 110,146 100,168" fill="#f4f8ff" opacity={0.48 + polish * 0.4} />
            <line x1="100" y1="44" x2="100" y2="168" stroke="#ffffff" strokeWidth="0.4" opacity={0.25 + polish * 0.25} />
            <polygon
              points="96,58 104,64 100,78"
              fill="#ffffff"
              opacity={0.15 + polish * 0.55}
              filter="url(#soft)"
            />
          </g>

          <g style={{ opacity: frame.fragments }}>
            {shards.map((s, i) => (
              <polygon
                key={i}
                points={`${100 + s.x * frame.fragments},${86 + s.y * frame.fragments} ${
                  100 + s.x * frame.fragments + s.w
                },${86 + s.y * frame.fragments + 2} ${
                  100 + s.x * frame.fragments + 2
                },${86 + s.y * frame.fragments + s.h}`}
                fill="#d7dee8"
                stroke="#f5f3ee"
                strokeWidth="0.3"
                opacity={Math.sin(frame.fragments * Math.PI)}
                transform={`rotate(${s.r * frame.fragments} ${100 + s.x} ${86 + s.y})`}
              />
            ))}
          </g>
        </svg>

        <div
          className="fallback-sweep"
          style={{
            opacity: frame.sweep * 0.7,
            transform: `translateX(${lerp(-120, 120, frame.sweep)}%) rotate(18deg)`,
          }}
        />
      </div>
    </div>
  );
}
