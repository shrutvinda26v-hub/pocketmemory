"use client";

import { getJourney } from "@/lib/journey";
import { lerp } from "@/lib/math";
import { useJourney } from "@/store/useJourney";

function PaveField({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="pave-field">
      {Array.from({ length: rows * cols }).map((_, i) => (
        <span key={i} className="pave-dot" />
      ))}
    </div>
  );
}

export function FallbackRing() {
  const progress = useJourney((s) => s.progress);
  const intro = useJourney((s) => s.intro);
  const frame = getJourney(progress, intro);
  const e = frame.explode;
  const enter = lerp(46, 0, intro);

  const spin = `rotateX(18deg) rotateY(${frame.spinY * (180 / Math.PI)}deg)`;
  const pack = frame.boxReveal;

  return (
    <div className="desk-stage" aria-hidden>
      <div
        className="desk-glow"
        style={{ opacity: 0.35 + frame.glow * 0.4 }}
      />

      <div
        className="jewel-scene"
        style={{
          transform: `translateY(${enter + lerp(0, 42, pack) + lerp(0, 18, frame.lidClose)}vh) scale(${lerp(1, 0.62, pack) * lerp(0.7, 1, intro)})`,
          opacity: lerp(0, 1, Math.min(1, intro * 1.4)),
        }}
      >
        <div className="jewel-spin" style={{ transform: spin }}>
          <div
            className="axis-line"
            style={{ opacity: e * 0.55 }}
          />

          <div
            className="piece piece-diamond"
            style={{ transform: `translate3d(0, ${-e * 210}px, 40px)` }}
          >
            <svg viewBox="0 0 120 120" className="diamond-svg">
              <defs>
                <radialGradient id="ice" cx="38%" cy="32%" r="70%">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="55%" stopColor="#e7eef8" />
                  <stop offset="100%" stopColor="#9eb0c8" />
                </radialGradient>
                <linearGradient id="facet" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="100%" stopColor="#a9bdd6" />
                </linearGradient>
              </defs>
              <polygon points="60,8 86,28 60,42 34,28" fill="#fff" opacity="0.9" />
              <polygon points="34,28 60,42 48,62 18,48" fill="url(#facet)" />
              <polygon points="86,28 102,48 72,62 60,42" fill="#c5d3e6" />
              <polygon points="18,48 48,62 60,92 28,78" fill="#dce6f3" />
              <polygon points="72,62 102,48 92,78 60,92" fill="#9eb1c8" />
              <polygon points="28,78 60,92 60,112" fill="#eef4ff" />
              <polygon points="92,78 60,92 60,112" fill="#b7c7db" />
              <polygon points="48,62 60,42 72,62 60,78" fill="url(#ice)" />
            </svg>
          </div>

          <div
            className="piece piece-setting"
            style={{ transform: `translate3d(0, ${-e * 92}px, 20px)` }}
          >
            <div className="collet">
              <span className="collet-well" />
            </div>
            <div className="pave-plate">
              <PaveField rows={4} cols={8} />
            </div>
          </div>

          <div
            className="piece piece-shoulders"
            style={{ transform: `translate3d(0, ${e * 28}px, 0)` }}
          >
            <div className="u-head">
              <div className="u-top" />
              <div className="u-arm u-arm-l">
                <PaveField rows={6} cols={3} />
              </div>
              <div className="u-arm u-arm-r">
                <PaveField rows={6} cols={3} />
              </div>
            </div>
            <div
              className="screws"
              style={{ opacity: 0.25 + e * 0.75 }}
            >
              <span
                className="screw"
                style={{ transform: `translate(${-e * 54}px, ${e * 8}px)` }}
              />
              <span
                className="screw"
                style={{ transform: `translate(${e * 54}px, ${e * 8}px)` }}
              />
            </div>
          </div>

          <div
            className="piece piece-band"
            style={{ transform: `translate3d(0, ${e * 168}px, -10px)` }}
          >
            <div className="band-ring">
              <span className="band-highlight" />
              <span className="band-seat" />
            </div>
          </div>
        </div>
      </div>

      <div
        className="jewel-box"
        style={{
          opacity: frame.boxReveal,
          transform: `translateY(${lerp(28, 8, frame.boxReveal)}vh) scale(${lerp(0.86, 1, frame.boxReveal)})`,
        }}
      >
        <div className="box-base">
          <div className="box-well" />
          <div className="box-trim" />
        </div>
        <div
          className="box-lid"
          style={{
            transform: `rotateX(${lerp(-118, 0, frame.lidClose)}deg)`,
          }}
        >
          <div className="lid-face">
            <span className="lid-plate">AUREL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
