"use client";

import { copyOpacity } from "@/lib/journey";
import { useJourney } from "@/store/useJourney";

function Fade({
  opacity,
  className,
  children,
}: {
  opacity: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        opacity,
        transform: `translateY(${(1 - opacity) * 8}px)`,
        pointerEvents: "none",
      }}
      aria-hidden={opacity < 0.08}
    >
      {children}
    </div>
  );
}

export function Overlay() {
  const progress = useJourney((s) => s.progress);
  const hero = copyOpacity(progress, "hero");
  const rough = copyOpacity(progress, "rough");
  const cut = copyOpacity(progress, "cut");
  const polish = copyOpacity(progress, "polish");
  const set = copyOpacity(progress, "set");
  const finale = copyOpacity(progress, "finale");
  const cta = copyOpacity(progress, "cta");
  const hint = copyOpacity(progress, "scrollHint");

  return (
    <div className="overlay">
      <header className="brand-lockup">
        <span className="brand-mark" aria-hidden>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path
              d="M12 2.4 20.4 9.2 12 21.6 3.6 9.2 12 2.4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.15"
            />
            <path d="M3.6 9.2h16.8M8.2 9.2 12 2.4l3.8 6.8M8.2 9.2 12 21.6 15.8 9.2" fill="none" stroke="currentColor" strokeWidth="1.15" />
          </svg>
        </span>
        <span className="brand-name">Aurel</span>
        <span className="brand-rule" />
        <span className="brand-sub">Maison</span>
      </header>

      <div className="copy-stack">
        <Fade opacity={hero} className="copy copy-hero">
          <p className="eyebrow">The Journey of a Diamond</p>
        </Fade>

        <Fade opacity={rough} className="copy">
          <p className="kicker">01 / Rough</p>
          <h2>
            Before brilliance,
            <br />
            there is potential.
          </h2>
        </Fade>

        <Fade opacity={cut} className="copy">
          <p className="kicker">02 / Cut</p>
          <h2>Precision creates brilliance.</h2>
        </Fade>

        <Fade opacity={polish} className="copy">
          <p className="kicker">03 / Polish</p>
          <h2>Every facet, perfected.</h2>
        </Fade>

        <Fade opacity={set} className="copy">
          <p className="kicker">04 / Set</p>
          <h2>
            Where craftsmanship
            <br />
            meets brilliance.
          </h2>
        </Fade>

        <Fade opacity={finale} className="copy copy-finale">
          <p className="kicker">05 / Become Timeless</p>
          <h2>Crafted to last beyond a lifetime.</h2>
        </Fade>
      </div>

      <Fade opacity={hint} className="scroll-hint">
        <span>Scroll to reveal</span>
        <span className="chevron" aria-hidden />
      </Fade>

      <Fade opacity={cta} className="cta-wrap">
        <a className="cta" href="#collection">
          Discover the collection
          <span aria-hidden> →</span>
        </a>
      </Fade>
    </div>
  );
}
