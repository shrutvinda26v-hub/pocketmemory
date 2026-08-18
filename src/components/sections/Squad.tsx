"use client";

import Link from "next/link";
import { Scene } from "@/hooks/usePinnedScene";

export function SquadSection() {
  return (
    <Scene id="squad" height="480vh">
      <div className="relative h-full w-full bg-[#210016]">
        <img
          src="/images/baddie-squad.png"
          alt="The Baddie squad in one maximalist scene"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scale(calc(1.08 + var(--p) * 0.18))" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="halftone" />
        <div className="squad-type absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <p className="kicker mb-6 text-[#f6d56b]">07 — THE BADDIE SQUAD</p>
          <h2 className="display-xl">
            <span className="l1">ONE WOMAN.</span>
            <span className="l2 gold-outline">MANY MOODS.</span>
            <span className="l3">ONE BADDIE.</span>
          </h2>
        </div>
      </div>
    </Scene>
  );
}

export function FinaleSection() {
  return (
    <Scene id="finale" height="480vh">
      <div className="relative h-full w-full bg-[#4a0528]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,#ff2d8b66,transparent_42%),linear-gradient(#7a1038,#1a0210)]" />
        <div className="paisley" />
        <img
          src="/images/finale-baddie.png"
          alt="Hero Baddie walking toward a giant lipstick"
          className="walk-in absolute bottom-0 left-[8%] h-[92%] w-auto max-w-[50%] object-contain"
        />
        <div className="relative z-10 flex h-full flex-col items-end justify-center px-8 text-right md:px-16">
          <p className="kicker text-[#f6d56b]">08 — FIND YOUR SHADE</p>
          <h2 className="display-lg mt-3 max-w-3xl">
            READY TO
            <br />
            FIND YOUR
            <br />
            SHADE?
          </h2>
          <div className="mt-8 flex flex-col items-end gap-3">
            <Link href="/shop" className="cta solid">
              SHOP ALL LIPSTICKS →
            </Link>
            <Link href="/#quiz" className="cta">
              TAKE THE BADDIE QUIZ →
            </Link>
          </div>
        </div>
        <div className="logo-end absolute inset-0 z-20 grid place-items-center bg-[#12010c]">
          <div className="text-center">
            <div className="font-display text-[16vw] leading-none tracking-[0.14em]">BADDIE</div>
            <p className="italic-line mt-2 text-3xl text-[#f6d56b]">WEAR YOUR MOOD.</p>
          </div>
        </div>
      </div>
    </Scene>
  );
}
