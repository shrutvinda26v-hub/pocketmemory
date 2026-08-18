"use client";

import { useState } from "react";
import { SHADES, inr } from "@/lib/shades";
import { useCart } from "@/lib/cart";
import { LipstickTube } from "@/components/ui/LipstickTube";

export function UniverseSection() {
  const [active, setActive] = useState<string | null>(null);
  const { add } = useCart();
  const shade = SHADES.find((s) => s.id === active);

  return (
    <section
      id="shades"
      className="relative min-h-screen overflow-hidden py-28"
      style={{
        background: shade
          ? `radial-gradient(circle at 50% 40%, ${shade.hex}, ${shade.hexSoft} 70%)`
          : "radial-gradient(circle at 50% 0%, #3a0a28, #11010c 55%)",
        transition: "background 0.6s ease",
      }}
    >
      <div className="paisley" />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <p className="kicker text-[#f6d56b]">05 — THE SHADE UNIVERSE</p>
        <h2 className="display-lg mt-3">MEET YOUR MOOD.</h2>
        <p className="italic-line mt-4 max-w-xl text-2xl text-white/80">
          Every lipstick is a woman. Hover. She’ll introduce herself.
        </p>

        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-5">
          {SHADES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="shade-card group flex flex-col items-center"
              onMouseEnter={() => setActive(s.id)}
              onFocus={() => setActive(s.id)}
              onClick={() => setActive(s.id)}
            >
              <div style={{ animationDelay: `${i * 0.2}s` }}>
                <LipstickTube color={s.hex} name={s.name.split(" ")[0]} />
              </div>
              <div className="mt-4 text-center">
                <div className="font-display text-xl tracking-wide">{s.name}</div>
                <div className="text-[11px] tracking-[0.22em] text-white/60">{s.personality}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {shade && (
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] md:block">
          <img
            src={shade.character}
            alt={shade.name}
            className="h-full w-full object-cover object-top opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20" />
        </div>
      )}

      {shade && (
        <div className="relative z-20 mx-auto mt-10 max-w-6xl px-6">
          <div className="max-w-lg border border-[#f6d56b]/40 bg-black/35 p-6 backdrop-blur-md">
            <p className="kicker text-[#f6d56b]">
              {shade.number} — {shade.personality.toUpperCase()}
            </p>
            <h3 className="font-display mt-2 text-5xl">{shade.name}</h3>
            <p className="italic-line mt-3 text-2xl">{shade.vibe}</p>
            <p className="mt-3 text-sm tracking-wide text-white/70">{shade.finish}</p>
            <p className="mt-2 text-white/80">{shade.description}</p>
            <div className="mt-5 flex items-center gap-4">
              <span className="font-poster text-3xl">{inr(shade.price)}</span>
              <button type="button" className="cta solid pointer-events-auto" onClick={() => add(shade.id)}>
                ADD TO BAG →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
