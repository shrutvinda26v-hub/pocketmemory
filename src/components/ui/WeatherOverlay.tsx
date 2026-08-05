"use client";

import { useMemo } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** DOM weather — always visible on top of the canvas */
export function WeatherOverlay() {
  const season = useExperienceStore((s) => s.season);

  // Soft drizzle — sparse, slow, short streaks
  const rainDrops = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${seeded(i) * 100}%`,
        delay: `${seeded(i + 3) * -6}s`,
        duration: `${2.4 + seeded(i + 7) * 2.2}s`,
        height: `${8 + seeded(i + 11) * 10}px`,
        opacity: 0.22 + seeded(i + 13) * 0.28,
      })),
    []
  );

  // Light snow — keeps the tree readable
  const snowFlakes = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        left: `${seeded(i + 20) * 100}%`,
        delay: `${seeded(i + 23) * -10}s`,
        duration: `${7 + seeded(i + 27) * 6}s`,
        size: `${2.5 + seeded(i + 29) * 4}px`,
        opacity: 0.4 + seeded(i + 31) * 0.35,
        drift: `${-24 + seeded(i + 33) * 48}px`,
      })),
    []
  );

  // Leaf-shaped autumn bits with midrib feel
  const autumnBits = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${seeded(i + 40) * 100}%`,
        delay: `${seeded(i + 43) * -12}s`,
        duration: `${7 + seeded(i + 47) * 7}s`,
        w: `${12 + seeded(i + 49) * 10}px`,
        h: `${18 + seeded(i + 50) * 14}px`,
        color:
          seeded(i + 51) > 0.66
            ? "#C4782A"
            : seeded(i + 51) > 0.4
              ? "#B04A28"
              : seeded(i + 51) > 0.2
                ? "#D4A04A"
                : "#8B3A22",
        spin: `${180 + seeded(i + 53) * 280}deg`,
        sway: `${20 + seeded(i + 55) * 40}px`,
      })),
    []
  );

  return (
    <div className="weather-overlay" data-season={season} aria-hidden>
      {season === "rain" && (
        <div className="weather-rain">
          {rainDrops.map((d, i) => (
            <span
              key={`r-${i}`}
              className="rain-drop"
              style={{
                left: d.left,
                animationDelay: d.delay,
                animationDuration: d.duration,
                height: d.height,
                opacity: d.opacity,
              }}
            />
          ))}
          <div className="rain-mist" />
        </div>
      )}

      {season === "winter" && (
        <div className="weather-snow">
          {snowFlakes.map((f, i) => (
            <span
              key={`s-${i}`}
              className="snow-flake"
              style={{
                left: f.left,
                width: f.size,
                height: f.size,
                opacity: f.opacity,
                animationDelay: f.delay,
                animationDuration: f.duration,
                ["--drift" as string]: f.drift,
              }}
            />
          ))}
        </div>
      )}

      {season === "summer" && (
        <div className="weather-summer">
          <div className="summer-sun-disk" />
          <div className="summer-rays" />
          <div className="summer-haze" />
        </div>
      )}

      {season === "autumn" && (
        <div className="weather-autumn">
          {autumnBits.map((l, i) => (
            <span
              key={`a-${i}`}
              className="autumn-leaf"
              style={{
                left: l.left,
                width: l.w,
                height: l.h,
                background: l.color,
                animationDelay: l.delay,
                animationDuration: l.duration,
                ["--spin" as string]: l.spin,
                ["--sway" as string]: l.sway,
              }}
            />
          ))}
          <div className="autumn-wash" />
        </div>
      )}

      <div className="season-badge">
        {season === "rain" && "Soft drizzle"}
        {season === "summer" && "Summer sun"}
        {season === "autumn" && "Autumn leaves"}
        {season === "winter" && "Winter snow"}
      </div>
    </div>
  );
}
