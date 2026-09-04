import { RefObject, useEffect, useRef, useState } from "react";
import { HenPose, defaultPose, lerpPose } from "./pose";
import "./hen.css";

type Mood = "none" | "email" | "password" | "login" | "success" | "visible";

type Props = {
  targetRef: RefObject<HenPose>;
  mood: Mood;
};

function browTransform(mood: Mood, side: "l" | "r") {
  if (mood === "email") {
    return side === "l" ? "translate(-64 -118) rotate(-22)" : "translate(64 -110) rotate(14)";
  }
  if (mood === "password") {
    return side === "l" ? "translate(-64 -96) rotate(8)" : "translate(64 -96) rotate(-8)";
  }
  if (mood === "visible" || mood === "login") {
    return side === "l" ? "translate(-64 -120) rotate(-16)" : "translate(64 -120) rotate(16)";
  }
  return side === "l" ? "translate(-64 -108)" : "translate(64 -108)";
}

export default function HenCharacter({ targetRef, mood }: Props) {
  const live = useRef<HenPose>(defaultPose());
  const rootRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const pupilL = useRef<SVGGElement>(null);
  const pupilR = useRef<SVGGElement>(null);
  const beak = useRef<SVGGElement>(null);
  const wingL = useRef<SVGGElement>(null);
  const wingR = useRef<SVGGElement>(null);
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
        rootRef.current.style.transform = `translate(${p.leanX}px, ${p.leanY}px)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `scale(${1 + p.puff * 0.05}, ${1 + p.breathe * 0.02})`;
      }
      if (headRef.current) {
        headRef.current.style.transform = `translate(${p.headTurn * -18}px, ${p.happy * -10}px) rotate(${p.headTilt}deg)`;
      }

      const px = p.lookX * 26;
      const py = p.lookY * 16;
      const pupilScale = 1 + p.eyeWiden * 0.22 - p.squint * 0.2;
      if (pupilL.current) pupilL.current.style.transform = `translate(${px}px, ${py}px) scale(${pupilScale})`;
      if (pupilR.current) pupilR.current.style.transform = `translate(${px}px, ${py}px) scale(${pupilScale})`;
      if (beak.current) beak.current.style.transform = `scale(${1 + p.beak * 0.08}, ${1 + p.beak * 0.22})`;
      if (wingL.current) wingL.current.style.transform = `rotate(${-18 - p.wingL}deg)`;
      if (wingR.current) wingR.current.style.transform = `rotate(${18 + p.wingR}deg)`;

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetRef]);

  const eyesShut = mood === "password" || blink;
  const eyesHappy = mood === "success";

  return (
    <svg className="hen-svg" data-mood={mood} viewBox="0 0 420 520" role="img" aria-label="Henrietta the hen, reacting to the login form">
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
            <circle cx="-52" cy="58" r="20" fill="#FF9BB8" />
            <circle cx="56" cy="58" r="20" fill="#FF9BB8" />

            <g transform="translate(-58, 8)">
              {eyesHappy ? (
                <path d="M-28,8 Q0,-18 28,8" fill="none" stroke="#1A061F" strokeWidth="12" strokeLinecap="round" />
              ) : eyesShut ? (
                <path d="M-32,6 Q0,28 32,6" fill="none" stroke="#1A061F" strokeWidth="14" strokeLinecap="round" />
              ) : (
                <g>
                  <circle cx="0" cy="0" r="44" fill="#FFFDF7" stroke="#1A061F" strokeWidth="8" />
                  <g ref={pupilL}>
                    <circle cx="0" cy="4" r="20" fill="#1A061F" />
                    <circle cx="-7" cy="-4" r="7" fill="#fff" />
                  </g>
                </g>
              )}
            </g>

            <g transform="translate(58, 8)">
              {eyesHappy ? (
                <path d="M-28,8 Q0,-18 28,8" fill="none" stroke="#1A061F" strokeWidth="12" strokeLinecap="round" />
              ) : eyesShut ? (
                <path d="M-32,6 Q0,28 32,6" fill="none" stroke="#1A061F" strokeWidth="14" strokeLinecap="round" />
              ) : (
                <g>
                  <circle cx="0" cy="0" r="44" fill="#FFFDF7" stroke="#1A061F" strokeWidth="8" />
                  <g ref={pupilR}>
                    <circle cx="0" cy="4" r="20" fill="#1A061F" />
                    <circle cx="-7" cy="-4" r="7" fill="#fff" />
                  </g>
                </g>
              )}
            </g>

            <g transform={browTransform(mood, "l")}>
              <path d="M-38 0 Q0 -18 38 0" fill="none" stroke="#1A061F" strokeWidth="14" strokeLinecap="round" />
            </g>
            <g transform={browTransform(mood, "r")}>
              <path d="M-38 0 Q0 -18 38 0" fill="none" stroke="#1A061F" strokeWidth="14" strokeLinecap="round" />
            </g>

            <g ref={beak} className="hen-beak">
              <path d="M-32,82 L0,128 L32,82 Z" fill="#FF8C1A" stroke="#1A061F" strokeWidth="8" strokeLinejoin="round" />
              <path d="M-6,128 Q-20,152 -2,156 Q10,136 8,128" fill="#FF3B5C" stroke="#1A061F" strokeWidth="6" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
