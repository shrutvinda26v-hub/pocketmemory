import { RefObject, useEffect, useId, useRef } from "react";
import { HenPose, defaultPose, lerpPose } from "./pose";
import "./hen.css";

type Props = {
  targetRef: RefObject<HenPose>;
};

export default function HenCharacter({ targetRef }: Props) {
  const live = useRef<HenPose>(defaultPose());
  const ids = useId().replace(/:/g, "");
  const clipL = `eyeL-${ids}`;
  const clipR = `eyeR-${ids}`;
  const rootRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const pupilL = useRef<SVGGElement>(null);
  const pupilR = useRef<SVGGElement>(null);
  const lidL = useRef<SVGRectElement>(null);
  const lidR = useRef<SVGRectElement>(null);
  const browL = useRef<SVGPathElement>(null);
  const browR = useRef<SVGPathElement>(null);
  const beakTop = useRef<SVGGElement>(null);
  const beakBot = useRef<SVGGElement>(null);
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
      lerpPose(p, target, 0.16, 0.1);

      if (rootRef.current) {
        rootRef.current.style.transform = `translate(${p.leanX}px, ${p.leanY}px)`;
      }
      if (bodyRef.current) {
        const puff = 1 + p.puff * 0.06;
        const breathe = 1 + p.breathe * 0.018;
        bodyRef.current.style.transform = `scale(${puff}, ${breathe})`;
      }
      if (headRef.current) {
        const sx = 1 - Math.abs(p.headTurn) * 0.28;
        headRef.current.style.transform = `translate(${p.headTurn * -30}px, ${p.happy * -8}px) rotate(${p.headTilt}deg) scale(${sx}, 1)`;
      }
      const widen = 1 + p.eyeWiden * 0.18 - p.squint * 0.12;
      const px = p.lookX * (11 + p.eyeWiden * 4);
      const py = p.lookY * (8 + p.eyeWiden * 2);
      if (pupilL.current) pupilL.current.style.transform = `translate(${px}px, ${py}px) scale(${widen})`;
      if (pupilR.current) pupilR.current.style.transform = `translate(${px}px, ${py}px) scale(${widen})`;
      if (lidL.current) lidL.current.setAttribute("height", String((1 - p.eyeOpenL) * 52 + p.squint * 10));
      if (lidR.current) lidR.current.setAttribute("height", String((1 - p.eyeOpenR) * 52 + p.squint * 10));
      if (browL.current) {
        browL.current.style.transform = `translate(0px, ${-p.browL * 8 + p.squint * 4}px) rotate(${-p.browL * 12}deg)`;
      }
      if (browR.current) {
        browR.current.style.transform = `translate(0px, ${-p.browR * 8 + p.squint * 4}px) rotate(${p.browR * 12}deg)`;
      }
      if (beakTop.current) beakTop.current.style.transform = `rotate(${-p.beak * 9}deg)`;
      if (beakBot.current) beakBot.current.style.transform = `rotate(${p.beak * 14}deg)`;
      if (wingL.current) wingL.current.style.transform = `rotate(${-12 - p.wingL}deg)`;
      if (wingR.current) wingR.current.style.transform = `rotate(${12 + p.wingR}deg)`;

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetRef]);

  return (
    <svg className="hen-svg" viewBox="0 0 480 640" role="img" aria-label="Henrietta the hen, reacting to the login form">
      <defs>
        <clipPath id={clipL}>
          <ellipse cx="0" cy="0" rx="28" ry="26" />
        </clipPath>
        <clipPath id={clipR}>
          <ellipse cx="0" cy="0" rx="28" ry="26" />
        </clipPath>
      </defs>

      <g ref={rootRef} className="hen-root">
        <ellipse cx="240" cy="590" rx="118" ry="22" fill="rgba(26,6,31,0.16)" />

        <g className="hen-wing-anchor" transform="translate(128 438)">
          <g ref={wingL} className="hen-wing">
            <ellipse cx="0" cy="0" rx="54" ry="28" fill="#FFD23F" stroke="#1A061F" strokeWidth="6" />
            <ellipse cx="-10" cy="0" rx="18" ry="10" fill="#FFE371" />
          </g>
        </g>

        <g transform="translate(240 430)">
          <g ref={bodyRef} className="hen-body">
            <ellipse cx="0" cy="0" rx="118" ry="108" fill="#FFD23F" stroke="#1A061F" strokeWidth="7" />
            <path
              d="M-96,-18 C-90,-78 90,-78 96,-18 C88,42 52,78 0,86 C-52,78 -88,42 -96,-18Z"
              fill="#C6FF00"
              stroke="#1A061F"
              strokeWidth="7"
            />
            <path d="M-70,-8 C-40,-38 40,-38 70,-8" fill="none" stroke="#FF2D95" strokeWidth="10" strokeLinecap="round" />
            <path d="M-62,62 H62" fill="none" stroke="#FF2D95" strokeWidth="10" strokeLinecap="round" />
            <circle cx="-28" cy="8" r="10" fill="#FFE14D" stroke="#1A061F" strokeWidth="4" />
            <path d="M-28,8 l6,-14 6,14 -16,-6 20,0Z" fill="#FF2D95" />
            <ellipse cx="0" cy="28" rx="46" ry="10" fill="none" stroke="#FFD24D" strokeWidth="7" />
            <circle cx="-40" cy="28" r="7" fill="#FFD24D" stroke="#1A061F" strokeWidth="3" />
            <circle cx="40" cy="28" r="7" fill="#FFD24D" stroke="#1A061F" strokeWidth="3" />
          </g>
        </g>

        <g className="hen-wing-anchor" transform="translate(352 438)">
          <g ref={wingR} className="hen-wing">
            <ellipse cx="0" cy="0" rx="54" ry="28" fill="#FFC62E" stroke="#1A061F" strokeWidth="6" />
            <ellipse cx="10" cy="0" rx="18" ry="10" fill="#FFE371" />
          </g>
        </g>

        <g transform="translate(240 188)">
          <g ref={headRef} className="hen-head">
            <path d="M-18,-108 C-28,-158 -6,-176 6,-132 C18,-176 44,-164 28,-112Z" fill="#FF2D55" stroke="#1A061F" strokeWidth="6" />
            <path d="M8,-104 C18,-158 48,-168 42,-112 C62,-150 86,-132 58,-98Z" fill="#FF3B63" stroke="#1A061F" strokeWidth="6" />
            <path d="M-46,-88 C-70,-132 -40,-146 -22,-100 C-12,-136 12,-128 2,-92Z" fill="#E81E48" stroke="#1A061F" strokeWidth="6" />

            <ellipse cx="0" cy="-8" rx="108" ry="100" fill="#FFD23F" stroke="#1A061F" strokeWidth="7" />
            <ellipse cx="-36" cy="28" rx="22" ry="12" fill="#FF8AA8" opacity="0.85" />
            <ellipse cx="44" cy="28" rx="22" ry="12" fill="#FF8AA8" opacity="0.85" />

            <rect x="-78" y="-86" width="52" height="18" rx="9" fill="#FF2D95" stroke="#1A061F" strokeWidth="4" />
            <rect x="26" y="-86" width="52" height="18" rx="9" fill="#FF2D95" stroke="#1A061F" strokeWidth="4" />
            <path d="M-26,-77 H26" stroke="#1A061F" strokeWidth="4" />

            <g transform="translate(-38,-18)">
              <ellipse cx="0" cy="0" rx="28" ry="26" fill="#FFFDF7" stroke="#1A061F" strokeWidth="5" />
              <g ref={pupilL}>
                <circle cx="0" cy="2" r="13" fill="#1A061F" />
                <circle cx="-4" cy="-2" r="4.5" fill="#fff" />
                <circle cx="5" cy="6" r="2" fill="#fff" opacity="0.7" />
              </g>
              <g clipPath={`url(#${clipL})`}>
                <rect ref={lidL} x="-30" y="-28" width="60" height="0" fill="#FFD23F" />
              </g>
            </g>

            <g transform="translate(40,-18)">
              <ellipse cx="0" cy="0" rx="28" ry="26" fill="#FFFDF7" stroke="#1A061F" strokeWidth="5" />
              <g ref={pupilR}>
                <circle cx="0" cy="2" r="13" fill="#1A061F" />
                <circle cx="-4" cy="-2" r="4.5" fill="#fff" />
                <circle cx="5" cy="6" r="2" fill="#fff" opacity="0.7" />
              </g>
              <g clipPath={`url(#${clipR})`}>
                <rect ref={lidR} x="-30" y="-28" width="60" height="0" fill="#FFD23F" />
              </g>
            </g>

            <path
              ref={browL}
              d="M-64,-50 Q-38,-62 -16,-50"
              fill="none"
              stroke="#1A061F"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              ref={browR}
              d="M16,-50 Q40,-62 66,-50"
              fill="none"
              stroke="#1A061F"
              strokeWidth="7"
              strokeLinecap="round"
            />

            <g transform="translate(4 22)">
              <g ref={beakTop}>
                <ellipse cx="0" cy="2" rx="28" ry="14" fill="#FF8A1A" stroke="#1A061F" strokeWidth="5" />
                <ellipse cx="-8" cy="0" rx="6" ry="3" fill="#FFB347" />
              </g>
              <g ref={beakBot}>
                <ellipse cx="0" cy="14" rx="20" ry="9" fill="#E56E10" stroke="#1A061F" strokeWidth="5" />
              </g>
              <path d="M-8,26 C-16,44 -4,50 2,34" fill="#E81E48" stroke="#1A061F" strokeWidth="4" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
