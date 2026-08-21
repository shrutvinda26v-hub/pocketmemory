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
        transform: `translateY(${(1 - opacity) * 14}px)`,
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
  const intro = useJourney((s) => s.intro);
  const hero = copyOpacity(progress, "hero") * Math.min(1, intro);
  const anatomy = copyOpacity(progress, "anatomy");
  const assemble = copyOpacity(progress, "assemble");
  const encase = copyOpacity(progress, "encase");
  const seal = copyOpacity(progress, "seal");
  const cta = copyOpacity(progress, "cta");
  const hint = copyOpacity(progress, "scrollHint") * Math.min(1, intro);

  return (
    <div className="overlay overlay-desktop">
      <header className="brand-lockup">
        <span className="brand-mark" aria-hidden>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path
              d="M12 2.4 20.4 9.2 12 21.6 3.6 9.2 12 2.4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.15"
            />
          </svg>
        </span>
        <span className="brand-name">Aurel</span>
        <span className="brand-rule" />
        <span className="brand-sub">Maison</span>
      </header>

      <div className="copy-stack copy-desktop">
        <Fade opacity={hero} className="copy copy-hero">
          <p className="eyebrow">The Eternal Pavé</p>
          <h1>The finest diamond ring ever set.</h1>
        </Fade>

        <Fade opacity={anatomy} className="copy">
          <p className="kicker">02 / Anatomy</p>
          <h2>
            Four layers.
            <br />
            One masterpiece.
          </h2>
          <p className="lede">
            Stone, collet, pavé shoulders, and shank — revealed.
          </p>
        </Fade>

        <Fade opacity={assemble} className="copy">
          <p className="kicker">03 / Assemble</p>
          <h2>Returned to form.</h2>
        </Fade>

        <Fade opacity={encase} className="copy">
          <p className="kicker">04 / Encase</p>
          <h2>A home worthy of it.</h2>
        </Fade>

        <Fade opacity={seal} className="copy copy-finale">
          <p className="kicker">05 / Seal</p>
          <h2>Closed. Kept. Timeless.</h2>
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
