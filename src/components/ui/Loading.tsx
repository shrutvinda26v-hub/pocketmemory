"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useJourney } from "@/store/useJourney";

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const setReady = useJourney((s) => s.setReady);
  const setIntro = useJourney((s) => s.setIntro);
  const [show, setShow] = useState(true);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = veilRef.current;
    const intro = { v: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setReady(true),
      });
      if (node) {
        tl.to(node, { opacity: 0, duration: 0.45, delay: 0.12, onComplete: () => setShow(false) });
      }
      tl.to(
        intro,
        {
          v: 1,
          duration: 1,
          ease: "power3.out",
          onUpdate: () => setIntro(intro.v),
        },
        0.2
      );
    }, node ?? undefined);
    return () => ctx.revert();
  }, [setIntro, setReady]);

  return (
    <>
      {children}
      {show && (
        <div className="boot-veil" ref={veilRef} aria-hidden>
          <div className="boot-inner">
            <p className="boot-name">Aurel</p>
            <span className="boot-line" />
          </div>
        </div>
      )}
    </>
  );
}
