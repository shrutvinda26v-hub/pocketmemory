import { RefObject, useEffect, useRef } from "react";
import { HenPose, defaultPose, lerpPose } from "./pose";
import "./hen.css";

type Props = {
  targetRef: RefObject<HenPose>;
  mood: "none" | "email" | "password" | "login" | "success" | "visible";
};

export default function HenCharacter({ targetRef, mood }: Props) {
  const live = useRef<HenPose>(defaultPose());
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const pupilL = useRef<SVGGElement>(null);
  const pupilR = useRef<SVGGElement>(null);
  const openL = useRef<SVGGElement>(null);
  const openR = useRef<SVGGElement>(null);
  const shutL = useRef<SVGGElement>(null);
  const shutR = useRef<SVGGElement>(null);
  const happyL = useRef<SVGPathElement>(null);
  const happyR = useRef<SVGPathElement>(null);
  const browL = useRef<SVGPathElement>(null);
  const browR = useRef<SVGPathElement>(null);
  const beak = useRef<SVGGElement>(null);
  const wingL = useRef<SVGGElement>(null);
  const wingR = useRef<SVGGElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const target = targetRef.current;
      if (!target) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const p = live.current;
      lerpPose(p, target, 0.2, 0.12);

      if (rootRef.current) {
        rootRef.current.style.transform = `translate(${p.leanX}px, ${p.leanY}px)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `scale(${1 + p.puff * 0.05}, ${1 + p.breathe * 0.02})`;
      }
      if (headRef.current) {
        headRef.current.style.transform = `translate(${p.headTurn * -22}px, ${p.happy * -10}px) rotate(${p.headTilt}deg)`;
      }

      const px = p.lookX * 26;
      const py = p.lookY * 16;
      const pupilScale = 1 + p.eyeWiden * 0.22 - p.squint * 0.2;
      if (pupilL.current) pupilL.current.style.transform = `translate(${px}px, ${py}px) scale(${pupilScale})`;
      if (pupilR.current) pupilR.current.style.transform = `translate(${px}px, ${py}px) scale(${pupilScale})`;

      const openLAmt = Math.max(0, p.eyeOpenL * (1 - p.happy));
      const openRAmt = Math.max(0, p.eyeOpenR * (1 - p.happy));
      if (openL.current) openL.current.setAttribute("opacity", String(openLAmt));
      if (openR.current) openR.current.setAttribute("opacity", String(openRAmt));
      if (shutL.current) shutL.current.setAttribute("opacity", String((1 - p.eyeOpenL) * (1 - p.happy)));
      if (shutR.current) shutR.current.setAttribute("opacity", String((1 - p.eyeOpenR) * (1 - p.happy)));
      if (happyL.current) happyL.current.setAttribute("opacity", String(p.happy));
      if (happyR.current) happyR.current.setAttribute("opacity", String(p.happy));
      if (svgRef.current) {
        svgRef.current.dataset.peek = p.eyeOpenR > 0.55 && p.eyeOpenL < 0.4 ? "1" : "0";
      }

      if (browL.current) {
        browL.current.style.transform = `translate(0px, ${-p.browL * 14 + p.squint * 8}px) rotate(${-p.browL * 18 + p.squint * 8}deg)`;
      }
      if (browR.current) {
        browR.current.style.transform = `translate(0px, ${-p.browR * 14 + p.squint * 8}px) rotate(${p.browR * 18 - p.squint * 8}deg)`;
      }
      if (beak.current) beak.current.style.transform = `scale(${1 + p.beak * 0.08}, ${1 + p.beak * 0.22})`;
      if (wingL.current) wingL.current.style.transform = `rotate(${-18 - p.wingL}deg)`;
      if (wingR.current) wingR.current.style.transform = `rotate(${18 + p.wingR}deg)`;

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetRef]);

  return (
    <svg
      ref={svgRef}
      className="hen-svg"
      data-mood={mood}
      viewBox="0 0 420 520"
      role="img"
      aria-label="Henrietta the hen, reacting to the login form"
    >
      <g ref={rootRef} className="hen-root">
        <ellipse cx="210" cy="478" rx="92" ry="16" fill="rgba(26,6,31,0.18)" />

        <g transform="translate(112 372)">
          <g ref={wingL} className="hen-wing">
            <ellipse cx="0" cy="0" rx="46" ry="22" fill="#FFD54A" stroke="#1A061F" strokeWidth="8" />
          </g>
        </g>
        <g transform="translate(308 372)">
          <g ref={wingR} className="hen-wing">
            <ellipse cx="0" cy="0" rx="46" ry="22" fill="#FFD54A" stroke="#1A061F" strokeWidth="8" />
          </g>
        </g>

        <g transform="translate(210 378)">
          <g ref={bodyRef} className="hen-body">
            <ellipse cx="0" cy="0" rx="96" ry="78" fill="#FFD54A" stroke="#1A061F" strokeWidth="8" />
            <ellipse cx="0" cy="10" rx="58" ry="42" fill="#C6FF00" stroke="#1A061F" strokeWidth="6" />
          </g>
        </g>

        <g transform="translate(210 214)">
          <g ref={headRef} className="hen-head">
            <ellipse cx="-28" cy="-132" rx="22" ry="34" fill="#FF3B5C" stroke="#1A061F" strokeWidth="8" />
            <ellipse cx="0" cy="-146" rx="26" ry="40" fill="#FF4D6D" stroke="#1A061F" strokeWidth="8" />
            <ellipse cx="30" cy="-130" rx="22" ry="32" fill="#FF3B5C" stroke="#1A061F" strokeWidth="8" />

            <circle cx="0" cy="8" r="128" fill="#FFD54A" stroke="#1A061F" strokeWidth="8" />

            <circle cx="-52" cy="56" r="20" fill="#FF9BB8" />
            <circle cx="56" cy="56" r="20" fill="#FF9BB8" />

            <g className="eye" transform="translate(-58,4)">
              <g ref={openL} className="eye-open">
                <circle cx="0" cy="0" r="44" fill="#FFFDF7" stroke="#1A061F" strokeWidth="8" />
                <g ref={pupilL}>
                  <circle cx="0" cy="4" r="20" fill="#1A061F" />
                  <circle cx="-7" cy="-4" r="7" fill="#fff" />
                </g>
              </g>
              <g ref={shutL} className="eye-shut" opacity="0">
                <path d="M-30,4 Q0,26 30,4" fill="none" stroke="#1A061F" strokeWidth="12" strokeLinecap="round" />
              </g>
              <path
                ref={happyL}
                className="eye-happy"
                d="M-28,8 Q0,-18 28,8"
                fill="none"
                stroke="#1A061F"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0"
              />
            </g>

            <g className="eye" transform="translate(58,4)">
              <g ref={openR} className="eye-open eye-open-r">
                <circle cx="0" cy="0" r="44" fill="#FFFDF7" stroke="#1A061F" strokeWidth="8" />
                <g ref={pupilR}>
                  <circle cx="0" cy="4" r="20" fill="#1A061F" />
                  <circle cx="-7" cy="-4" r="7" fill="#fff" />
                </g>
              </g>
              <g ref={shutR} className="eye-shut eye-shut-r" opacity="0">
                <path d="M-30,4 Q0,26 30,4" fill="none" stroke="#1A061F" strokeWidth="12" strokeLinecap="round" />
              </g>
              <path
                ref={happyR}
                className="eye-happy"
                d="M-28,8 Q0,-18 28,8"
                fill="none"
                stroke="#1A061F"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0"
              />
            </g>

            <path
              ref={browL}
              className="hen-brow hen-brow-l"
              d="M-108,-62 Q-58,-88 -16,-62"
              fill="none"
              stroke="#1A061F"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              ref={browR}
              className="hen-brow hen-brow-r"
              d="M16,-62 Q62,-88 108,-62"
              fill="none"
              stroke="#1A061F"
              strokeWidth="14"
              strokeLinecap="round"
            />

            <g ref={beak} className="hen-beak">
              <path d="M-32,78 L0,124 L32,78 Z" fill="#FF8C1A" stroke="#1A061F" strokeWidth="8" strokeLinejoin="round" />
              <path d="M-6,124 Q-20,148 -2,152 Q10,132 8,124" fill="#FF3B5C" stroke="#1A061F" strokeWidth="6" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
