"use client";

import { SHADES, inr } from "@/lib/shades";
import { useCart } from "@/lib/cart";
import { LipstickTube } from "@/components/ui/LipstickTube";

export default function ShopPage() {
  const { add } = useCart();

  return (
    <main className="relative min-h-screen bg-[#14010e] pb-24 pt-28">
      <div className="paisley" />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <p className="kicker text-[#f6d56b]">THE COLLECTION</p>
        <h1 className="display-lg mt-3">SHOP ALL LIPSTICKS</h1>
        <p className="italic-line mt-4 max-w-2xl text-2xl text-white/75">
          Ten shades. Ten women. Pick a mood and wear it like you mean it.
        </p>

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {SHADES.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="grid items-center gap-6 border border-white/10 bg-black/30 p-5 md:grid-cols-[160px_1fr]"
            >
              <div className="flex justify-center">
                <LipstickTube color={s.hex} name={s.name.split(" ")[0]} />
              </div>
              <div>
                <p className="kicker text-[#f6d56b]">
                  {s.number} — {s.personality.toUpperCase()}
                </p>
                <h2 className="font-display mt-1 text-4xl">{s.name}</h2>
                <p className="italic-line mt-2 text-xl">{s.vibe}</p>
                <p className="mt-2 text-sm tracking-wide text-white/60">{s.finish}</p>
                <p className="mt-3 text-white/80">{s.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="font-poster text-3xl">{inr(s.price)}</span>
                  <button type="button" className="cta solid" onClick={() => add(s.id)}>
                    ADD TO BAG →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
