import { RefObject, useEffect, useRef } from "react";
import { HenPose, defaultPose, lerpPose } from "./pose";
import "./hen.css";

type Props = {
  targetRef: RefObject<HenPose>;
};

function setShown(node: SVGGElement | null, shown: boolean) {
  if (!node) return;
  node.style.display = shown ? "block" : "none";
}

export default function HenCharacter({ targetRef }: Props) {
  const live = useRef<HenPose>(defaultPose());
  const rootRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const neckRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const browLRef = useRef<SVGGElement>(null);
  const browRRef = useRef<SVGGElement>(null);
  const pupilL = useRef<SVGGElement>(null);
  const pupilR = useRef<SVGGElement>(null);
  const openL = useRef<SVGGElement>(null);
  const openR = useRef<SVGGElement>(null);
  const shutL = useRef<SVGGElement>(null);
  const shutR = useRef<SVGGElement>(null);
  const happyL = useRef<SVGGElement>(null);
  const happyR = useRef<SVGGElement>(null);
  const lidL = useRef<SVGRectElement>(null);
  const lidR = useRef<SVGRectElement>(null);
  const beakRef = useRef<SVGGElement>(null);
  const blushL = useRef<SVGEllipseElement>(null);
  const blushR = useRef<SVGEllipseElement>(null);
  const wingLRef = useRef<SVGGElement>(null);
  const wingRRef = useRef<SVGGElement>(null);
  const sparkleL = useRef<SVGCircleElement>(null);
  const sparkleR = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const target = targetRef.current;
      if (!target) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const p = live.current;
      lerpPose(p, target, 0.22, 0.14);

      if (rootRef.current) {
        rootRef.current.style.transform = `translate(${p.leanX * 0.55}px, ${p.leanY * 0.35 + p.bounce}px)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `scale(${1 + p.puff * 0.05}, ${1 + p.breathe * 0.02 + p.puff * 0.03})`;
      }
      if (neckRef.current) {
        neckRef.current.style.transform = `scale(1, ${1 + p.neck * 0.22}) translate(0, ${p.neck * -6}px)`;
      }
      if (headRef.current) {
        headRef.current.style.transform = `translate(${p.headTurn * -28}px, ${p.neck * -10}px) rotate(${p.headTilt}deg)`;
      }
      if (browLRef.current) {
        browLRef.current.style.transform = `translateY(${-p.browL * 14}px) rotate(${-p.browL * 16}deg)`;
      }
      if (browRRef.current) {
        browRRef.current.style.transform = `translateY(${-p.browR * 14}px) rotate(${p.browR * 16}deg)`;
      }

      const widen = 1 + p.eyeWiden * 0.18 - p.squint * 0.16;
      const px = p.lookX * 16;
      const py = p.lookY * 12;
      if (pupilL.current) pupilL.current.style.transform = `translate(${px}px, ${py}px) scale(${widen})`;
      if (pupilR.current) pupilR.current.style.transform = `translate(${px}px, ${py}px) scale(${widen})`;

      const happy = p.happy > 0.55;
      const leftShut = !happy && p.eyeOpenL < 0.14;
      const rightShut = !happy && p.eyeOpenR < 0.14;
      setShown(openL.current, !happy && !leftShut);
      setShown(openR.current, !happy && !rightShut);
      setShown(shutL.current, leftShut);
      setShown(shutR.current, rightShut);
      setShown(happyL.current, happy);
      setShown(happyR.current, happy);
      if (lidL.current) lidL.current.setAttribute("height", String((1 - p.eyeOpenL) * 92));
      if (lidR.current) lidR.current.setAttribute("height", String((1 - p.eyeOpenR) * 92));

      if (beakRef.current) {
        beakRef.current.style.transform = `scale(1, ${1 + p.beak * 0.45}) translate(0, ${p.smile * -2}px)`;
      }
      if (blushL.current) blushL.current.style.opacity = String(p.blush);
      if (blushR.current) blushR.current.style.opacity = String(p.blush);
      if (wingLRef.current) {
        wingLRef.current.style.transform = `rotate(${-12 - p.wingL - p.wingCover * 38}deg) translate(${p.wingCover * 18}px, ${p.wingCover * -22}px)`;
      }
      if (wingRRef.current) {
        wingRRef.current.style.transform = `rotate(${10 + p.wingR}deg)`;
      }
      if (sparkleL.current) sparkleL.current.style.opacity = String(p.sparkle);
      if (sparkleR.current) sparkleR.current.style.opacity = String(p.sparkle);

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetRef]);

  return (
    <svg className="hen-svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Hen reacting to the login form">
      <g ref={rootRef} className="hen-root">
        <g ref={bodyRef} className="hen-body">
          <ellipse cx="200" cy="455" rx="78" ry="36" fill="#fff8f1" stroke="#1c1917" strokeWidth="6" />
        </g>

        <g className="hen-wing-anchor hen-wing-r" transform="translate(268 390)">
          <g ref={wingRRef}>
            <path d="M0 10 C28 -18 52 -6 46 22 C28 38 6 28 0 10 Z" fill="#fff8f1" stroke="#1c1917" strokeWidth="6" strokeLinejoin="round" />
          </g>
        </g>

        <g ref={neckRef} className="hen-neck">
          <path d="M176 360 L224 360 L216 410 L184 410 Z" fill="#fff8f1" stroke="#1c1917" strokeWidth="6" strokeLinejoin="round" />
        </g>

        <g transform="translate(200 248)" className="hen-head-anchor">
          <g ref={headRef} className="hen-head">
            <circle cx="-36" cy="-148" r="24" fill="#d94a3d" stroke="#1c1917" strokeWidth="6" />
            <circle cx="0" cy="-168" r="30" fill="#e05648" stroke="#1c1917" strokeWidth="6" />
            <circle cx="36" cy="-148" r="24" fill="#d94a3d" stroke="#1c1917" strokeWidth="6" />
            <circle r="148" fill="#fff8f1" stroke="#1c1917" strokeWidth="7" />

            <ellipse ref={blushL} cx="-72" cy="28" rx="22" ry="12" fill="#f3b6a8" opacity="0" />
            <ellipse ref={blushR} cx="72" cy="28" rx="22" ry="12" fill="#f3b6a8" opacity="0" />

            <g ref={browLRef} className="hen-brow" transform="translate(-62 -62)">
              <path d="M-28 0 Q0 -10 28 2" fill="none" stroke="#1c1917" strokeWidth="7" strokeLinecap="round" />
            </g>
            <g ref={browRRef} className="hen-brow" transform="translate(62 -62)">
              <path d="M-28 2 Q0 -10 28 0" fill="none" stroke="#1c1917" strokeWidth="7" strokeLinecap="round" />
            </g>

            <g transform="translate(-62 -24)">
              <g ref={openL}>
                <circle r="48" fill="#fff" stroke="#1c1917" strokeWidth="6" />
                <g ref={pupilL}>
                  <circle r="18" fill="#1c1917" />
                  <circle ref={sparkleL} cx="10" cy="-6" r="5" fill="#fff" opacity="0" />
                </g>
                <rect ref={lidL} x="-48" y="-48" width="96" height="0" fill="#fff8f1" />
              </g>
              <g ref={shutL} style={{ display: "none" }}>
                <path d="M-42 6 Q0 34 42 6" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />
              </g>
              <g ref={happyL} style={{ display: "none" }}>
                <path d="M-42 8 Q0 -28 42 8" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(62 -24)">
              <g ref={openR}>
                <circle r="48" fill="#fff" stroke="#1c1917" strokeWidth="6" />
                <g ref={pupilR}>
                  <circle r="18" fill="#1c1917" />
                  <circle ref={sparkleR} cx="10" cy="-6" r="5" fill="#fff" opacity="0" />
                </g>
                <rect ref={lidR} x="-48" y="-48" width="96" height="0" fill="#fff8f1" />
              </g>
              <g ref={shutR} style={{ display: "none" }}>
                <path d="M-42 6 Q0 34 42 6" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />
              </g>
              <g ref={happyR} style={{ display: "none" }}>
                <path d="M-42 8 Q0 -28 42 8" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />
              </g>
            </g>

            <g ref={beakRef} className="hen-beak">
              <path d="M-14 26 L0 56 L14 26 Z" fill="#e8892d" stroke="#1c1917" strokeWidth="5" strokeLinejoin="round" />
            </g>

            <g className="hen-wing-anchor hen-wing-l" transform="translate(-90 70)">
              <g ref={wingLRef}>
                <path d="M0 8 C-34 -16 -58 6 -40 32 C-18 42 -4 26 0 8 Z" fill="#fff8f1" stroke="#1c1917" strokeWidth="6" strokeLinejoin="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
