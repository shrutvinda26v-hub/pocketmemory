"use client";

import { useMemo } from "react";
import { getJourney } from "@/lib/journey";
import { lerp } from "@/lib/math";
import { useJourney } from "@/store/useJourney";
import { mulberry32 } from "@/lib/diamondGeometry";

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
}

function octagon(cx: number, cy: number, r: number) {
  return Array.from({ length: 8 })
    .map((_, i) => polar(cx, cy, r, i * 45 + 22.5))
    .join(" ");
}

export function FallbackJewelry() {
  const progress = useJourney((s) => s.progress);
  const frame = getJourney(progress);

  const yaw = frame.objectYaw * 16 + progress * 10;
  const pitch = 12 + frame.objectPitch * 14;
  const scale = 0.98 + (frame.objectScale - 1) * 0.8 + (1 - frame.ringOpacity) * 0.12;
  const polish = frame.polish;
  const glow = 0.38 + frame.glow * 0.5;
  const gemY = (0.26 - frame.diamondY) * 54;

  const dust = useMemo(() => {
    const rng = mulberry32(21);
    return Array.from({ length: 32 }).map((_, i) => ({
      x: rng() * 100,
      y: rng() * 100,
      s: 1 + rng() * 2.1,
      d: 9 + rng() * 14,
      delay: rng() * 9,
      gold: i % 5 === 0,
    }));
  }, []);

  const shards = useMemo(() => {
    const rng = mulberry32(44);
    return Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return {
        x: Math.cos(a) * (34 + rng() * 12),
        y: Math.sin(a) * (28 + rng() * 10),
        r: rng() * 50,
        w: 5 + rng() * 7,
        h: 4 + rng() * 5,
      };
    });
  }, []);

  const table = octagon(100, 84, 16);
  const girdle = Array.from({ length: 16 })
    .map((_, i) => polar(100, 84, 40, i * 22.5))
    .join(" ");

  return (
    <div className="fallback-stage" aria-hidden>
      <div
        className="fallback-glow"
        style={{ opacity: glow, transform: `scale(${1 + frame.glow * 0.16})` }}
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
            <radialGradient id="gGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#f5f3ee" stopOpacity="0.3" />
              <stop offset="40%" stopColor="#d8b978" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#11100e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gPlat" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f4f3f0" />
              <stop offset="45%" stopColor="#c4c6c3" />
              <stop offset="100%" stopColor="#8f9190" />
            </linearGradient>
            <linearGradient id="gPlatEdge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eceae6" />
              <stop offset="100%" stopColor="#6f716f" />
            </linearGradient>
            <radialGradient id="gTable" cx="42%" cy="34%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e7eef8" />
              <stop offset="100%" stopColor="#b7c6db" />
            </radialGradient>
            <linearGradient id="gIce" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#9aafc8" />
            </linearGradient>
            <linearGradient id="gRough" x1="0.2" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#eef2f6" />
              <stop offset="50%" stopColor="#b7c2d0" />
              <stop offset="100%" stopColor="#8893a2" />
            </linearGradient>
            <filter id="sparkle">
              <feGaussianBlur stdDeviation="0.8" />
            </filter>
          </defs>

          <ellipse cx="100" cy="118" rx="84" ry="72" fill="url(#gGlow)" />

          <g
            style={{ opacity: frame.ringOpacity }}
            transform={`translate(0 ${lerp(26, 0, frame.ringExplode)})`}
          >
            <ellipse
              cx="100"
              cy="156"
              rx="58"
              ry="66"
              fill="none"
              stroke="url(#gPlatEdge)"
              strokeWidth="14"
            />
            <ellipse
              cx="100"
              cy="156"
              rx="58"
              ry="66"
              fill="none"
              stroke="url(#gPlat)"
              strokeWidth="8"
            />
            <ellipse
              cx="100"
              cy="154"
              rx="58"
              ry="66"
              fill="none"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth="1.3"
              strokeDasharray="16 200"
              strokeDashoffset={progress * -36}
            />
            <g transform={`translate(0 ${lerp(-16, 0, frame.ringExplode)})`}>
              <ellipse
                cx="100"
                cy="92"
                rx="15"
                ry="6.5"
                fill="none"
                stroke="url(#gPlat)"
                strokeWidth="3"
              />
              {[0.7, 2.45, 3.85, -0.7].map((a, i) => {
                const lean = lerp(12, 3.5, frame.prongClose);
                const x = 100 + Math.cos(a) * lerp(20, 11.5, frame.ringExplode);
                const y = 86 + Math.sin(a) * 4;
                return (
                  <g
                    key={i}
                    transform={`translate(${x} ${y}) rotate(${Math.cos(a) * lean * 3.4})`}
                  >
                    <rect
                      x="-1.2"
                      y="0"
                      width="2.4"
                      height="16"
                      rx="1"
                      fill="url(#gPlat)"
                    />
                    <circle cx="0" cy="1.2" r="1.7" fill="#f3f2ef" />
                  </g>
                );
              })}
            </g>
          </g>

          <g
            style={{ opacity: Math.max(frame.guides, frame.setGuides) * 0.88 }}
          >
            <circle
              cx="100"
              cy="84"
              r="46"
              fill="none"
              stroke="#d8b978"
              strokeWidth="0.55"
            />
            <line
              x1="100"
              y1="32"
              x2="100"
              y2="136"
              stroke="#d8b978"
              strokeWidth="0.45"
            />
            <line
              x1="52"
              y1="84"
              x2="148"
              y2="84"
              stroke="#d8b978"
              strokeWidth="0.45"
            />
            {[30, 150, 210, 330].map((d) => (
              <line
                key={d}
                x1="100"
                y1="84"
                x2={100 + Math.cos(((d - 90) * Math.PI) / 180) * 52}
                y2={84 + Math.sin(((d - 90) * Math.PI) / 180) * 52}
                stroke="#d8b978"
                strokeWidth="0.4"
              />
            ))}
          </g>

          <g
            style={{ opacity: frame.roughOpacity }}
            transform={`translate(100 ${84 + gemY})`}
          >
            <polygon
              points="2,-36 22,-24 34,-2 26,22 6,34 -20,28 -34,6 -28,-20"
              fill="url(#gRough)"
              stroke="#e7eef6"
              strokeWidth="0.8"
            />
            <polygon points="2,-36 22,-24 6,-6" fill="#ffffff" opacity="0.32" />
            <polygon points="-28,-20 2,-36 6,-6" fill="#c5d0dc" opacity="0.28" />
            <polygon points="22,-24 34,-2 6,-6" fill="#8f9eae" opacity="0.24" />
            <line
              x1="-10"
              y1="-8"
              x2="14"
              y2="10"
              stroke="#f5f3ee"
              strokeWidth="0.55"
              opacity="0.4"
            />
          </g>

          <g
            style={{
              opacity: frame.cutOpacity,
              filter: `brightness(${0.84 + polish * 0.38})`,
            }}
            transform={`translate(0 ${gemY})`}
          >
            <polygon points={girdle} fill="#9eafc4" opacity="0.55" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a0 = i * 45;
              const a1 = a0 + 45;
              const dim = i % 2 === 0;
              return (
                <polygon
                  key={i}
                  points={`${polar(100, 84, 16, a0 + 22.5)} ${polar(100, 84, 40, a0)} ${polar(100, 84, 40, a1)}`}
                  fill={dim ? "#d5e0ee" : "#f7fbff"}
                  opacity={0.55 + polish * 0.25}
                />
              );
            })}
            {Array.from({ length: 8 }).map((_, i) => (
              <polygon
                key={`s${i}`}
                points={`${polar(100, 84, 16, i * 45 + 22.5)} ${polar(100, 84, 16, (i + 1) * 45 + 22.5)} ${polar(100, 84, 28, (i + 1) * 45)}`}
                fill="#ffffff"
                opacity={0.28 + polish * 0.25}
              />
            ))}
            <polygon points={table} fill="url(#gTable)" opacity={0.8 + polish * 0.2} />
            <circle
              cx="92"
              cy="76"
              r="4.5"
              fill="#ffffff"
              opacity={0.2 + polish * 0.55}
              filter="url(#sparkle)"
            />
            <circle
              cx="112"
              cy="90"
              r="2.2"
              fill="#ffffff"
              opacity={0.15 + polish * 0.5}
            />
          </g>

          <g style={{ opacity: frame.fragments }}>
            {shards.map((s, i) => (
              <polygon
                key={i}
                points={`${100 + s.x * frame.fragments},${84 + s.y * frame.fragments} ${
                  100 + s.x * frame.fragments + s.w
                },${84 + s.y * frame.fragments + 2} ${
                  100 + s.x * frame.fragments + 1
                },${84 + s.y * frame.fragments + s.h}`}
                fill="#d5dce6"
                stroke="#f5f3ee"
                strokeWidth="0.3"
                opacity={Math.sin(frame.fragments * Math.PI)}
              />
            ))}
          </g>
        </svg>

        <div
          className="fallback-sweep"
          style={{
            opacity: frame.sweep * 0.75,
            transform: `translateX(${lerp(-130, 130, frame.sweep)}%) rotate(18deg)`,
          }}
        />
      </div>
    </div>
  );
}
