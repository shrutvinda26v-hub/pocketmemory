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

  const rainDrops = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        left: `${seeded(i) * 100}%`,
        delay: `${seeded(i + 3) * -2.2}s`,
        duration: `${0.55 + seeded(i + 7) * 0.55}s`,
        height: `${14 + seeded(i + 11) * 22}px`,
        opacity: 0.35 + seeded(i + 13) * 0.45,
      })),
    []
  );

  const snowFlakes = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        left: `${seeded(i + 20) * 100}%`,
        delay: `${seeded(i + 23) * -8}s`,
        duration: `${4.5 + seeded(i + 27) * 5}s`,
        size: `${4 + seeded(i + 29) * 8}px`,
        opacity: 0.55 + seeded(i + 31) * 0.4,
        drift: `${-30 + seeded(i + 33) * 60}px`,
      })),
    []
  );

  const autumnBits = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${seeded(i + 40) * 100}%`,
        delay: `${seeded(i + 43) * -10}s`,
        duration: `${5 + seeded(i + 47) * 6}s`,
        size: `${10 + seeded(i + 49) * 14}px`,
        color:
          seeded(i + 51) > 0.55
            ? "#C8903A"
            : seeded(i + 51) > 0.3
              ? "#B85A2E"
              : "#D4A04A",
        rotate: `${seeded(i + 53) * 360}deg`,
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
              className="autumn-bit"
              style={{
                left: l.left,
                width: l.size,
                height: `calc(${l.size} * 0.65)`,
                background: l.color,
                animationDelay: l.delay,
                animationDuration: l.duration,
                ["--spin" as string]: l.rotate,
              }}
            />
          ))}
          <div className="autumn-wash" />
        </div>
      )}

      <div className="season-badge">
        {season === "rain" && "Rainy season"}
        {season === "summer" && "Summer sun"}
        {season === "autumn" && "Autumn leaves"}
        {season === "winter" && "Winter snow"}
      </div>
    </div>
  );
}
