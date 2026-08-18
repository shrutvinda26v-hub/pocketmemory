"use client";

import Link from "next/link";
import { Scene } from "@/hooks/usePinnedScene";
import { Floaters, LipstickTube } from "@/components/ui/LipstickTube";

export function HeroSection() {
  return (
    <Scene id="hero" height="620vh" className="bg-[#1a0214]">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#ff2d8b,transparent_42%),radial-gradient(circle_at_80%_10%,#2a4bff,transparent_40%),radial-gradient(circle_at_70%_80%,#ff6b00,transparent_45%),linear-gradient(#5a0030,#12010c)]" />
        <div className="paisley" />
        <div className="halftone" />
        <Floaters />

        <div className="hero-cam absolute inset-0">
          <img
            src="/images/hero-baddie.png"
            alt="A stylized BADDIE caricature lounging on a giant glossy lipstick"
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          />
          <img
            src="/images/hero-wink.png"
            alt=""
            className="wink-layer absolute inset-0 h-full w-full object-cover object-[center_18%]"
          />
          <div className="hero-glasses" aria-hidden>
            <svg viewBox="0 0 220 70" className="h-16 w-56 md:h-24 md:w-80">
              <defs>
                <linearGradient id="lens" x1="0" x2="1">
                  <stop offset="0" stopColor="#2a1208" />
                  <stop offset="1" stopColor="#6b3a18" />
                </linearGradient>
              </defs>
              <rect x="8" y="16" width="90" height="42" rx="16" fill="url(#lens)" stroke="#e6c35c" strokeWidth="6" />
              <rect x="122" y="16" width="90" height="42" rx="16" fill="url(#lens)" stroke="#e6c35c" strokeWidth="6" />
              <path d="M98 34h24" stroke="#e6c35c" strokeWidth="6" />
            </svg>
          </div>
          <div className="hero-pickup">
            <LipstickTube color="#FF2D8B" name="BADDIE" className="paused" />
          </div>
        </div>

        <div className="hero-copy absolute inset-0 z-10 flex flex-col justify-between px-6 py-24 md:px-14">
          <p className="kicker text-[#f6d56b]">ONE WOMAN · MANY MOODS · ONE BADDIE</p>
          <div>
            <h1 className="display-xl">
              BADDIES
              <br />
              DON’T WEAR
              <br />
              <span className="gold-outline">ONE SHADE.</span>
            </h1>
            <p className="scroll-hint mt-8 kicker text-white/80">SCROLL TO MEET YOUR SHADE ↓</p>
          </div>
        </div>
        <div className="lip-wipe" />
      </div>
    </Scene>
  );
}

export function RedSection() {
  return (
    <Scene id="red" height="560vh">
      <div className="relative h-full w-full bg-[#6a0718]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#ff4d6d55,transparent_40%),linear-gradient(#9b1028,#4a0310)]" />
        <div className="paisley opacity-30" />
        <Floaters variant="red" />

        <img
          src="/images/red-baddie-sit.png"
          alt="The Red Baddie seated"
          className="absolute left-[8%] top-[8%] h-[84%] w-auto max-w-[54%] object-contain transition-opacity duration-700"
          style={{ opacity: "calc(1 - var(--p) * 1.6)" }}
        />
        <img
          src="/images/red-baddie.png"
          alt="The Red Baddie standing"
          className="char-shift absolute left-[6%] top-[4%] h-[92%] w-auto max-w-[58%] object-contain"
          style={{ opacity: "calc(clamp(0, (var(--p) - 0.18) * 4, 1) * (1 - clamp(0, (var(--p) - 0.7) * 4, 1)))" }}
        />
        <img
          src="/images/red-baddie-kiss.png"
          alt="The Red Baddie smirking"
          className="absolute left-[10%] top-[6%] h-[88%] w-auto max-w-[56%] object-contain"
          style={{ opacity: "calc(clamp(0, (var(--p) - 0.62) * 5, 1))" }}
        />

        <div className="absolute right-6 top-[22%] z-10 max-w-md md:right-16">
          <p className="kicker text-[#f6d56b]">01 — THE RED BADDIE</p>
          <h2 className="display-lg mt-3">
            FOR WOMEN
            <br />
            WHO DON’T
            <br />
            ENTER ROOMS
            <br />
            QUIETLY.
          </h2>
          <div className="mt-6 italic-line text-2xl">RUBY RUSH</div>
          <p className="mt-1 text-sm tracking-[0.18em] text-white/70">HIGHLY PIGMENTED · SATIN FINISH</p>
          <Link href="/shop#ruby-rush" className="cta mt-8">
            WEAR THE ATTITUDE →
          </Link>
        </div>

        <div className="red-lip-move absolute bottom-[12%] right-[22%] z-10">
          <LipstickTube color="#C41E3A" name="RUBY RUSH" className="paused" />
        </div>
        <div className="red-mirror" aria-hidden />
        <div className="kiss-wipe">
          <img src="/images/kiss-mark.png" alt="" />
        </div>
      </div>
    </Scene>
  );
}

export function PinkSection() {
  return (
    <Scene id="pink" height="540vh">
      <div className="relative h-full w-full bg-[#ff4da6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#fff5,transparent_30%),linear-gradient(#ff79c1,#d11278)]" />
        <div className="paisley" />
        <Floaters variant="pink" />

        <img
          src="/images/pink-baddie.png"
          alt="The Pink Baddie on a lipstick throne"
          className="absolute left-[-4%] top-0 h-full w-[62%] object-cover object-top"
          style={{ transform: "scale(calc(1 + var(--p) * 0.08)) rotate(calc(var(--p) * -4deg))" }}
        />
        <img
          src="/images/pink-baddie-selfie.png"
          alt=""
          className="absolute left-[-4%] top-0 h-full w-[62%] object-cover object-top"
          style={{ opacity: "calc(clamp(0, (var(--p) - 0.38) * 4, 1))" }}
        />

        <div className="absolute right-6 top-[18%] z-10 max-w-lg text-right md:right-16">
          <p className="kicker">02 — THE PINK BADDIE</p>
          <h2 className="display-lg mt-3">
            SWEET?
            <br />
            <span className="gold-outline">NEVER.</span>
          </h2>
          <p className="italic-line mt-4 text-3xl">PINK WITH AN ATTITUDE.</p>
          <div className="mt-6 font-display text-4xl tracking-wide">PINK PUNCH</div>
          <Link href="/shop#pink-punch" className="cta mt-8">
            WEAR THE ATTITUDE →
          </Link>
        </div>

        <div className="heart-burst">
          <div className="heart3d" />
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#ffc1de]"
              style={{
                left: `${20 + ((i * 37) % 60)}%`,
                top: `${18 + ((i * 19) % 55)}%`,
                width: 8 + (i % 6) * 6,
                height: 8 + (i % 6) * 6,
                opacity: 0.8,
                transform: `translateY(calc(var(--p) * -${40 + i * 6}px))`,
              }}
            />
          ))}
        </div>
      </div>
    </Scene>
  );
}

export function NariSection() {
  return (
    <Scene id="nari" height="560vh">
      <div className="freeze relative h-full w-full bg-[#ff7a18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#ffe56666,transparent_40%),linear-gradient(#ff9a3c,#d44512)]" />
        <div className="paisley opacity-40" />
        <Floaters variant="orange" />

        <img
          src="/images/nari-baddie.png"
          alt="Nari Baddie dancing in saffron couture"
          className="absolute left-1/2 top-[4%] h-[90%] w-auto max-w-[72%] -translate-x-1/2 object-contain"
          style={{
            transform:
              "translateX(-50%) rotate(calc(var(--p) * 28deg)) scale(calc(0.92 + var(--p) * 0.16))",
          }}
        />

        <div className="absolute left-6 top-[16%] z-10 max-w-md md:left-14">
          <p className="kicker text-[#3a0a00]">03 — NARI BADDIE</p>
          <h2 className="display-lg text-[#2a0700]">
            NARI,
            <br />
            BUT MAKE
            <br />
            IT LOUD.
          </h2>
          <div className="mt-5 font-display text-4xl tracking-wide">MIRCHI</div>
          <p className="mt-1 text-sm tracking-[0.2em] text-[#3a0a00]/70">SAFFRON SATIN · WARM PIGMENT</p>
          <Link href="/shop#mirchi" className="cta mt-8 text-[#2a0700] border-[#2a0700]">
            WEAR THE ATTITUDE →
          </Link>
        </div>
        <div className="pattern-bomb" />
      </div>
    </Scene>
  );
}
