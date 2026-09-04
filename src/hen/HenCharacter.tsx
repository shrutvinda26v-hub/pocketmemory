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
  const wattleRef = useRef<SVGGElement>(null);
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
      if (lidL.current) lidL.current.setAttribute("height", String(p.eyeOpenL > 0.82 ? 0 : (1 - p.eyeOpenL) * 92));
      if (lidR.current) lidR.current.setAttribute("height", String(p.eyeOpenR > 0.82 ? 0 : (1 - p.eyeOpenR) * 92));

      if (beakRef.current) {
        beakRef.current.style.transform = `scale(1, ${1 + p.beak * 0.45}) translate(0, ${p.smile * -2}px)`;
      }
      if (wattleRef.current) {
        wattleRef.current.style.transform = `translate(0, ${p.beak * 6}px) rotate(${p.headTilt * 0.08}deg)`;
      }
      if (blushL.current) blushL.current.style.opacity = String(0.22 + p.blush * 0.78);
      if (blushR.current) blushR.current.style.opacity = String(0.22 + p.blush * 0.78);
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
    <svg className="hen-svg" viewBox="32 12 336 408" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Hen reacting to the login form">
      <g ref={rootRef} className="hen-root">
        <g ref={bodyRef} className="hen-body">
          <ellipse cx="200" cy="448" rx="92" ry="44" fill="#fff8f1" stroke="#1c1917" strokeWidth="6" />
          <ellipse cx="200" cy="458" rx="54" ry="22" fill="#f6d5c8" opacity="0.7" />
        </g>

        <g transform="translate(286 402)">
          <ellipse cx="18" cy="10" rx="16" ry="28" fill="#fff8f1" stroke="#1c1917" strokeWidth="5" transform="rotate(28)" />
          <ellipse cx="36" cy="0" rx="14" ry="24" fill="#fff8f1" stroke="#1c1917" strokeWidth="5" transform="rotate(48)" />
          <ellipse cx="48" cy="-12" rx="12" ry="20" fill="#fff8f1" stroke="#1c1917" strokeWidth="5" transform="rotate(64)" />
        </g>

        <g className="hen-wing-anchor hen-wing-r" transform="translate(268 378)">
          <g ref={wingRRef}>
            <path d="M0 12 C30 -16 58 -4 50 24 C36 40 12 32 0 12 Z" fill="#fff8f1" stroke="#1c1917" strokeWidth="6" strokeLinejoin="round" />
            <path d="M18 4 C28 -8 40 2 34 16" fill="none" stroke="#e8c8b8" strokeWidth="4" strokeLinecap="round" />
            <path d="M10 14 C20 4 32 12 26 24" fill="none" stroke="#e8c8b8" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>

        <g ref={neckRef} className="hen-neck">
          <path d="M168 352 C176 352 224 352 232 352 L222 418 C214 428 186 428 178 418 Z" fill="#fff8f1" stroke="#1c1917" strokeWidth="6" strokeLinejoin="round" />
          <path d="M188 390 Q200 402 212 390" fill="none" stroke="#f0cfc4" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g transform="translate(200 236)" className="hen-head-anchor">
          <g ref={headRef} className="hen-head">
            <circle cx="-40" cy="-150" r="26" fill="#d94a3d" stroke="#1c1917" strokeWidth="6" />
            <circle cx="0" cy="-174" r="34" fill="#e05648" stroke="#1c1917" strokeWidth="6" />
            <circle cx="40" cy="-150" r="26" fill="#d94a3d" stroke="#1c1917" strokeWidth="6" />
            <circle r="152" fill="#fff8f1" stroke="#1c1917" strokeWidth="7" />
            <path d="M-70 -70 Q-90 -20 -78 30" fill="none" stroke="#f0d3c6" strokeWidth="5" strokeLinecap="round" />
            <path d="M70 -70 Q90 -20 78 30" fill="none" stroke="#f0d3c6" strokeWidth="5" strokeLinecap="round" />

            <ellipse ref={blushL} cx="-78" cy="36" rx="26" ry="14" fill="#f3b6a8" opacity="0.22" />
            <ellipse ref={blushR} cx="78" cy="36" rx="26" ry="14" fill="#f3b6a8" opacity="0.22" />

            <g ref={browLRef} className="hen-brow" transform="translate(-64 -96)">
              <path d="M-32 0 Q0 -14 32 0" fill="none" stroke="#1c1917" strokeWidth="8" strokeLinecap="round" />
            </g>
            <g ref={browRRef} className="hen-brow" transform="translate(64 -96)">
              <path d="M-32 0 Q0 -14 32 0" fill="none" stroke="#1c1917" strokeWidth="8" strokeLinecap="round" />
            </g>

            <g transform="translate(-64 -22)">
              <g ref={openL}>
                <circle r="50" fill="#fffef8" stroke="#1c1917" strokeWidth="6" />
                <g ref={pupilL}>
                  <circle r="20" fill="#1c1917" />
                  <circle cx="-6" cy="-5" r="6" fill="#fff" />
                  <circle ref={sparkleL} cx="9" cy="-7" r="4" fill="#fff" opacity="0" />
                </g>
                <rect ref={lidL} x="-50" y="-50" width="100" height="0" fill="#fff8f1" />
              </g>
              <g ref={shutL} style={{ display: "none" }}>
                <path d="M-44 6 Q0 36 44 6" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />
              </g>
              <g ref={happyL} style={{ display: "none" }}>
                <path d="M-44 8 Q0 -30 44 8" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(64 -22)">
              <g ref={openR}>
                <circle r="50" fill="#fffef8" stroke="#1c1917" strokeWidth="6" />
                <g ref={pupilR}>
                  <circle r="20" fill="#1c1917" />
                  <circle cx="-6" cy="-5" r="6" fill="#fff" />
                  <circle ref={sparkleR} cx="9" cy="-7" r="4" fill="#fff" opacity="0" />
                </g>
                <rect ref={lidR} x="-50" y="-50" width="100" height="0" fill="#fff8f1" />
              </g>
              <g ref={shutR} style={{ display: "none" }}>
                <path d="M-44 6 Q0 36 44 6" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />
              </g>
              <g ref={happyR} style={{ display: "none" }}>
                <path d="M-44 8 Q0 -30 44 8" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />
              </g>
            </g>

            <g ref={beakRef} className="hen-beak">
              <path d="M-16 28 L0 62 L16 28 Z" fill="#e8892d" stroke="#1c1917" strokeWidth="5" strokeLinejoin="round" />
              <path d="M-10 32 Q0 42 10 32" fill="#f4b45a" />
              <circle cx="-4" cy="38" r="2.2" fill="#1c1917" />
              <circle cx="4" cy="38" r="2.2" fill="#1c1917" />
            </g>

            <g ref={wattleRef} className="hen-wattle">
              <ellipse cx="-8" cy="64" rx="10" ry="14" fill="#d94a3d" stroke="#1c1917" strokeWidth="4" />
              <ellipse cx="8" cy="64" rx="10" ry="14" fill="#e05648" stroke="#1c1917" strokeWidth="4" />
            </g>

            <g className="hen-wing-anchor hen-wing-l" transform="translate(-96 78)">
              <g ref={wingLRef}>
                <path d="M0 8 C-36 -18 -64 8 -44 36 C-20 46 -4 28 0 8 Z" fill="#fff8f1" stroke="#1c1917" strokeWidth="6" strokeLinejoin="round" />
                <path d="M-18 6 C-30 -4 -42 8 -32 18" fill="none" stroke="#e8c8b8" strokeWidth="4" strokeLinecap="round" />
                <path d="M-12 18 C-24 8 -36 18 -26 28" fill="none" stroke="#e8c8b8" strokeWidth="4" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
