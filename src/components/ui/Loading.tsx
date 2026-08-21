"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useJourney } from "@/store/useJourney";

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const setReady = useJourney((s) => s.setReady);
  const [show, setShow] = useState(true);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = veilRef.current;
    if (!node) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          setReady(true);
          setShow(false);
        },
      });
      tl.fromTo(
        ".boot-mark",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.15 }
      )
        .fromTo(
          ".boot-name",
          { opacity: 0, letterSpacing: "0.55em" },
          { opacity: 1, letterSpacing: "0.42em", duration: 1.1 },
          "<0.15"
        )
        .fromTo(".boot-line", { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, "-=0.4")
        .fromTo(".boot-sub", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3")
        .to(node, { opacity: 0, duration: 1.15, delay: 0.45 });
    }, node);
    return () => ctx.revert();
  }, [setReady]);

  return (
    <>
      {children}
      {show && (
        <div className="boot-veil" ref={veilRef} aria-hidden>
          <div className="boot-inner">
            <span className="boot-mark">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M12 2.4 20.4 9.2 12 21.6 3.6 9.2 12 2.4Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
            </span>
            <p className="boot-name">Aurel</p>
            <span className="boot-line" />
            <p className="boot-sub">The journey of a diamond</p>
          </div>
        </div>
      )}
    </>
  );
}
