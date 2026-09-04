import { RefObject, useEffect, useRef, useState } from "react";
import { HenPose, defaultPose, lerpPose } from "./pose";
import "./hen.css";

type Mood = "none" | "email" | "password" | "login" | "success" | "visible";

type Props = {
  targetRef: RefObject<HenPose>;
  mood: Mood;
};

const SCLERA = "#FAE599";
const HEAD = "#FBF8F4";
const INK = "#1A061F";

function OverlayEye({
  cx,
  cy,
  r,
  happy,
  shut,
  pupilRef,
}: {
  cx: number;
  cy: number;
  r: number;
  happy: boolean;
  shut: boolean;
  pupilRef: RefObject<SVGGElement | null>;
}) {
  if (happy) {
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <circle r={r + 4} fill={HEAD} />
        <path d={`M${-r * 0.72} 4 Q0 ${-r * 0.42} ${r * 0.72} 4`} fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" />
      </g>
    );
  }
  if (shut) {
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <circle r={r + 4} fill={HEAD} />
        <path d={`M${-r * 0.78} 2 Q0 ${r * 0.55} ${r * 0.78} 2`} fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill={SCLERA} />
      <circle r={r} fill="none" stroke={INK} strokeWidth="8" />
      <g ref={pupilRef}>
        <circle cy="3" r={r * 0.42} fill={INK} />
        <circle cx={-r * 0.14} cy={-r * 0.08} r={r * 0.12} fill="#fff" />
      </g>
    </g>
  );
}

export default function HenCharacter({ targetRef, mood }: Props) {
  const live = useRef<HenPose>(defaultPose());
  const rootRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const pupilL = useRef<SVGGElement>(null);
  const pupilR = useRef<SVGGElement>(null);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (mood === "password" || mood === "success") {
      setBlink(false);
      return;
    }
    let blinkOff = 0;
    let next = 0;
    const loop = () => {
      next = window.setTimeout(() => {
        setBlink(true);
        blinkOff = window.setTimeout(() => {
          setBlink(false);
          loop();
        }, 140);
      }, 1800 + Math.random() * 3200);
    };
    loop();
    return () => {
      window.clearTimeout(next);
      window.clearTimeout(blinkOff);
    };
  }, [mood]);

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
        rootRef.current.style.transform = `translate(${p.leanX}px, ${p.leanY}px) rotate(${p.headTilt * 0.35}deg)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `scale(${1 + p.puff * 0.03}, ${1 + p.breathe * 0.018})`;
      }

      const px = p.lookX * 8;
      const py = p.lookY * 6;
      const pupilScale = 1 + p.eyeWiden * 0.12 - p.squint * 0.14;
      if (pupilL.current) pupilL.current.style.transform = `translate(${px}px, ${py}px) scale(${pupilScale})`;
      if (pupilR.current) pupilR.current.style.transform = `translate(${px}px, ${py}px) scale(${pupilScale})`;

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetRef]);

  const eyesShut = mood === "password" || blink;
  const eyesHappy = mood === "success";

  return (
    <svg
      className="hen-svg"
      data-mood={mood}
      viewBox="0 0 455 529"
      role="img"
      aria-label="Henrietta the hen, reacting to the login form"
    >
      <g ref={rootRef} className="hen-root">
        <g ref={bodyRef} className="hen-body">
          <image href="/hen-kawaii.png" width="455" height="529" />
          <OverlayEye cx={173} cy={111} r={32} happy={eyesHappy} shut={eyesShut} pupilRef={pupilL} />
          <OverlayEye cx={236} cy={124} r={34} happy={eyesHappy} shut={eyesShut} pupilRef={pupilR} />
        </g>
      </g>
    </svg>
  );
}
