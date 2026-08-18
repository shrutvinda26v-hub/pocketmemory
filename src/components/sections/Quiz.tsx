"use client";

import { useMemo, useState } from "react";
import { QUIZ, SHADES } from "@/lib/shades";
import { useCart } from "@/lib/cart";

const KEYS = Object.keys(QUIZ);

export function QuizSection() {
  const [pick, setPick] = useState<string>("main");
  const { add } = useCart();
  const result = QUIZ[pick];
  const shade = useMemo(() => SHADES.find((s) => s.id === result.shadeId)!, [result]);

  return (
    <section id="quiz" className="relative min-h-screen overflow-hidden">
      <img
        src="/images/dressing-room.png"
        alt="Extravagant Indian dressing room"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#12010c]/55" />
      <div className="halftone" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-28 md:grid-cols-2">
        <div>
          <p className="kicker text-[#f6d56b]">06 — WHAT’S YOUR BADDIE TYPE?</p>
          <h2 className="display-lg mt-3">WHO ARE YOU TODAY?</h2>
          <p className="italic-line mt-4 text-2xl text-white/85">
            Moods change. The lipstick keeps up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {KEYS.map((k) => (
              <button
                key={k}
                type="button"
                className={`quiz-choice ${pick === k ? "active" : ""}`}
                onClick={() => setPick(k)}
              >
                {QUIZ[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="mirror-ring mx-auto h-[70vw] max-h-[620px] w-[70vw] max-w-[620px] overflow-hidden">
            <img
              src={shade.character}
              alt={shade.name}
              className="h-full w-full object-cover object-top"
              key={shade.id + pick}
            />
          </div>
          <div className="mt-8 border border-white/20 bg-black/50 p-5 backdrop-blur-md">
            <p className="kicker text-[#f6d56b]">YOUR BADDIE SHADE</p>
            <h3 className="font-display mt-2 text-4xl md:text-5xl">YOU’RE A {shade.name} GIRL.</h3>
            <p className="italic-line mt-3 text-xl">{result.line}</p>
            <p className="mt-2 text-white/70">{shade.vibe}</p>
            <button type="button" className="cta mt-6" onClick={() => add(shade.id)}>
              SHOP YOUR SHADE →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
