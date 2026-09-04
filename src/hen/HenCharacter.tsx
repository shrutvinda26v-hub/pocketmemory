import { RefObject, useEffect, useRef, useState } from "react";
import { HenPose, defaultPose, lerpPose } from "./pose";
import "./hen.css";

type Mood = "none" | "email" | "password" | "login" | "success" | "visible";

type Props = {
  targetRef: RefObject<HenPose>;
  mood: Mood;
};

function Eye({
  happy,
  shut,
  pupilRef,
}: {
  happy: boolean;
  shut: boolean;
  pupilRef: RefObject<SVGGElement | null>;
}) {
  if (happy) {
    return <path d="M-42 8 Q0 -28 42 8" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />;
  }
  if (shut) {
    return <path d="M-42 6 Q0 34 42 6" fill="none" stroke="#1c1917" strokeWidth="10" strokeLinecap="round" />;
  }
  return (
    <g>
      <circle r="48" fill="#fff" stroke="#1c1917" strokeWidth="6" />
      <g ref={pupilRef}>
        <circle r="18" fill="#1c1917" />
      </g>
    </g>
  );
}

export default function HenCharacter({ targetRef, mood }: Props) {
  const live = useRef<HenPose>(defaultPose());
  const rootRef = useRef<SVGGElement>(null);
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
        }, 120);
      }, 2200 + Math.random() * 2800);
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
      lerpPose(p, target, 0.18, 0.1);

      if (rootRef.current) {
        rootRef.current.style.transform = `translate(${p.leanX * 0.25}px, ${p.leanY * 0.2}px)`;
      }

      const px = p.lookX * 14;
      const py = p.lookY * 10;
      if (pupilL.current) pupilL.current.style.transform = `translate(${px}px, ${py}px)`;
      if (pupilR.current) pupilR.current.style.transform = `translate(${px}px, ${py}px)`;

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetRef]);

  const eyesShut = mood === "password" || blink;
  const eyesHappy = mood === "success";

  return (
    <svg className="hen-svg" data-mood={mood} viewBox="0 0 400 430" role="img" aria-label="Hen watching the login form">
      <g ref={rootRef} className="hen-root">
        <circle cx="200" cy="248" r="148" fill="#fff8f1" stroke="#1c1917" strokeWidth="7" />
        <circle cx="164" cy="100" r="24" fill="#d94a3d" stroke="#1c1917" strokeWidth="6" />
        <circle cx="200" cy="80" r="30" fill="#e05648" stroke="#1c1917" strokeWidth="6" />
        <circle cx="236" cy="100" r="24" fill="#d94a3d" stroke="#1c1917" strokeWidth="6" />
        <g transform="translate(138 224)">
          <Eye happy={eyesHappy} shut={eyesShut} pupilRef={pupilL} />
        </g>
        <g transform="translate(262 224)">
          <Eye happy={eyesHappy} shut={eyesShut} pupilRef={pupilR} />
        </g>
        <path d="M186 274 L200 304 L214 274 Z" fill="#e8892d" stroke="#1c1917" strokeWidth="5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
