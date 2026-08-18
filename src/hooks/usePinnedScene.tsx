"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function usePinnedScene(
  wrap: RefObject<HTMLElement | null>,
  pin: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const wrapEl = wrap.current;
    const pinEl = pin.current;
    if (!wrapEl || !pinEl) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: wrapEl,
        pin: pinEl,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.15,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          pinEl.style.setProperty("--p", self.progress.toFixed(4));
          const beat = Math.min(7, Math.floor(self.progress * 8));
          if (pinEl.dataset.beat !== String(beat)) {
            pinEl.dataset.beat = String(beat);
          }
        },
      });
      return () => st.kill();
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      pinEl.style.setProperty("--p", "0.45");
      pinEl.dataset.beat = "4";
    });

    return () => mm.revert();
  }, [wrap, pin]);
}

export function Scene({
  id,
  height = "540vh",
  className = "",
  children,
}: {
  id?: string;
  height?: string;
  className?: string;
  children: ReactNode;
}) {
  const wrap = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  usePinnedScene(wrap, pin);

  return (
    <section ref={wrap} id={id} className={`relative ${className}`} style={{ height }}>
      <div
        ref={pin}
        className="scene-pin"
        data-beat="0"
        style={{ "--p": 0 } as CSSProperties}
      >
        {children}
      </div>
    </section>
  );
}
