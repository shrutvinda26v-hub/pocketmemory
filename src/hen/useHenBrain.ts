import { useEffect, useRef } from "react";
import { HenPose, clamp1, defaultPose } from "./pose";

export type FocusField = "none" | "email" | "password" | "login";

type IdleMod = Partial<HenPose> & { until: number };

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function useHenBrain(input: {
  focus: FocusField;
  email: string;
  passwordVisible: boolean;
  typingEmail: boolean;
  typingPassword: boolean;
  submitting: boolean;
  pointerRef: { current: { x: number; y: number } | null };
}) {
  const targetRef = useRef<HenPose>(defaultPose());
  const idleRef = useRef<IdleMod>({ until: 0 });
  const peekUntil = useRef(0);
  const glanceUserUntil = useRef(0);
  const lastTypedAt = useRef(0);
  const realizedPassword = useRef(false);
  const inputRef = useRef(input);
  inputRef.current = input;

  const prevEmail = useRef(input.email);
  if (input.email !== prevEmail.current) {
    prevEmail.current = input.email;
    lastTypedAt.current = performance.now();
  }

  useEffect(() => {
    if (input.focus === "password") {
      realizedPassword.current = false;
      const id = window.setTimeout(() => {
        realizedPassword.current = true;
      }, 280);
      return () => window.clearTimeout(id);
    }
    realizedPassword.current = false;
  }, [input.focus]);

  useEffect(() => {
    let blinkTimer = 0;
    let idleTimer = 0;
    let peekTimer = 0;

    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        idleRef.current = {
          ...idleRef.current,
          eyeOpenL: 0,
          eyeOpenR: Math.random() < 0.15 ? 0.4 : 0,
          until: performance.now() + rand(90, 160),
        };
        scheduleBlink();
      }, rand(1800, 5200));
    };

    const scheduleIdle = () => {
      idleTimer = window.setTimeout(() => {
        if (inputRef.current.focus === "none" && !inputRef.current.submitting) {
          const now = performance.now();
          const action = pick([
            "lookLeft",
            "lookRight",
            "lookUser",
            "lookAway",
            "tilt",
            "brow",
            "puff",
            "beak",
            "lean",
            "wing",
            "curious",
          ]);
          const next: IdleMod = { until: now + rand(420, 1400) };
          if (action === "lookLeft") {
            next.lookX = rand(-0.85, -0.25);
            next.lookY = rand(-0.2, 0.2);
            next.headTilt = rand(-10, -2);
          } else if (action === "lookRight") {
            next.lookX = rand(0.25, 0.85);
            next.lookY = rand(-0.15, 0.25);
            next.headTilt = rand(2, 10);
          } else if (action === "lookUser") {
            next.lookX = rand(-0.08, 0.08);
            next.lookY = rand(-0.12, 0.05);
            next.eyeWiden = 0.12;
          } else if (action === "lookAway") {
            next.lookX = rand(-0.5, 0.5);
            next.lookY = rand(0.2, 0.55);
            next.headTilt = rand(-14, 14);
          } else if (action === "tilt") {
            next.headTilt = pick([-16, -11, 11, 16]);
            next.browL = rand(0.2, 0.7);
          } else if (action === "brow") {
            next.browL = rand(0.4, 1);
            next.browR = rand(-0.1, 0.35);
            next.squint = rand(0, 0.2);
          } else if (action === "puff") {
            next.puff = rand(0.25, 0.55);
            next.beak = rand(0.1, 0.35);
          } else if (action === "beak") {
            next.beak = rand(0.25, 0.7);
          } else if (action === "lean") {
            next.leanY = rand(4, 12);
            next.leanX = rand(-6, 6);
          } else if (action === "wing") {
            next.wingR = rand(8, 18);
            next.wingL = rand(-4, 6);
          } else {
            next.headTilt = rand(-12, 12);
            next.browL = 0.8;
            next.browR = 0.15;
            next.beak = 0.35;
            next.lookX = rand(-0.3, 0.3);
          }
          idleRef.current = next;
        }
        scheduleIdle();
      }, rand(700, 2800));
    };

    const schedulePeek = () => {
      peekTimer = window.setTimeout(() => {
        const current = inputRef.current;
        if (current.focus === "password" && !current.passwordVisible && Math.random() < 0.72) {
          peekUntil.current = performance.now() + rand(280, 720);
          if (Math.random() < 0.22) {
            window.setTimeout(() => {
              peekUntil.current = performance.now() + rand(220, 480);
            }, rand(500, 900));
          }
        }
        schedulePeek();
      }, rand(1800, 5200));
    };

    scheduleBlink();
    scheduleIdle();
    schedulePeek();
    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(idleTimer);
      window.clearTimeout(peekTimer);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const current = inputRef.current;
      const t = targetRef.current;
      const idle: IdleMod = idleRef.current.until > now ? idleRef.current : { until: 0 };
      const breathe = Math.sin(now / 640) * 0.5 + 0.5;

      t.lookX = 0;
      t.lookY = 0;
      t.headTilt = Math.sin(now / 1800) * 2.2;
      t.headTurn = 0;
      t.leanX = 0;
      t.leanY = Math.sin(now / 640) * 3;
      t.browL = 0;
      t.browR = 0;
      t.eyeOpenL = 1;
      t.eyeOpenR = 1;
      t.eyeWiden = 0;
      t.squint = 0;
      t.beak = 0.08 + breathe * 0.04;
      t.puff = breathe * 0.08;
      t.breathe = breathe;
      t.wingL = Math.sin(now / 900) * 2;
      t.wingR = Math.sin(now / 820 + 1) * 2;
      t.happy = 0;

      if (current.submitting) {
        t.happy = 1;
        t.eyeOpenL = 0;
        t.eyeOpenR = 0;
        t.beak = 1;
        t.headTilt = Math.sin(now / 90) * 10;
        t.leanY = -12;
        t.wingL = 22;
        t.wingR = 22;
        t.puff = 0.4;
      } else if (current.focus === "login") {
        t.lookX = 0.85;
        t.lookY = 0.2;
        t.headTilt = -8;
        t.eyeWiden = 0.35;
        t.browL = 0.7;
        t.browR = 0.7;
        t.leanX = 12;
        t.beak = 0.35;
      } else if (current.focus === "password" && current.passwordVisible) {
        t.lookX = 0.9;
        t.lookY = 0.15;
        t.leanX = 16;
        t.leanY = 8;
        t.eyeWiden = 0.55;
        t.browL = 0.95;
        t.browR = 0.15;
        t.beak = 0.6;
        t.headTilt = -10;
        t.eyeOpenL = 1;
        t.eyeOpenR = 1;
      } else if (current.focus === "password") {
        const peeking = peekUntil.current > now;
        if (!realizedPassword.current) {
          t.lookX = 0.9;
          t.lookY = 0.1;
          t.eyeWiden = 0.8;
          t.beak = 0.5;
          t.headTilt = -8;
          t.browL = 1;
          t.browR = 1;
          t.eyeOpenL = 1;
          t.eyeOpenR = 1;
        } else if (peeking) {
          t.headTilt = 12;
          t.eyeOpenL = 0;
          t.eyeOpenR = 1;
          t.lookX = 0.95;
          t.lookY = 0.1;
          t.browR = 1;
          t.browL = -0.2;
          t.beak = 0.2;
        } else {
          t.headTilt = 16;
          t.lookX = -1;
          t.lookY = 0;
          t.eyeOpenL = 0;
          t.eyeOpenR = 0;
          t.browL = 0.2;
          t.browR = 0.2;
          t.leanX = -8;
          t.beak = 0.05;
          if (current.typingPassword) {
            t.headTilt = 18;
          }
        }
      } else if (current.focus === "email") {
        const progress = clamp1(current.email.length / 22);
        const paused = now - lastTypedAt.current > 720;
        if (paused && now - lastTypedAt.current < 2400 && glanceUserUntil.current < now) {
          glanceUserUntil.current = now + rand(500, 900);
        }
        const glancing = glanceUserUntil.current > now && paused;
        t.lookX = glancing ? 0 : 0.55 + progress * 0.4;
        t.lookY = glancing ? -0.15 : 0.08;
        t.leanX = 12 + progress * 8;
        t.leanY = 6;
        t.eyeWiden = 0.45;
        t.browL = 1;
        t.browR = 0.35;
        t.headTilt = glancing ? 12 : current.typingEmail ? -10 : 6;
        t.squint = paused && !glancing ? 0.35 : 0;
        t.beak = glancing ? 0.45 : 0.2;
        t.eyeOpenL = 1;
        t.eyeOpenR = 1;
      } else {
        t.lookX += idle.lookX ?? (current.pointerRef.current ? current.pointerRef.current.x * 0.42 : 0);
        t.lookY += idle.lookY ?? (current.pointerRef.current ? current.pointerRef.current.y * 0.32 : 0);
        t.headTilt += idle.headTilt ?? 0;
        t.browL += idle.browL ?? 0;
        t.browR += idle.browR ?? 0;
        t.puff += idle.puff ?? 0;
        t.beak += idle.beak ?? 0;
        t.leanX += idle.leanX ?? 0;
        t.leanY += idle.leanY ?? 0;
        t.wingL += idle.wingL ?? 0;
        t.wingR += idle.wingR ?? 0;
        t.eyeWiden += idle.eyeWiden ?? 0;
        t.squint += idle.squint ?? 0;
        if (idle.eyeOpenL !== undefined) t.eyeOpenL = idle.eyeOpenL;
        if (idle.eyeOpenR !== undefined) t.eyeOpenR = idle.eyeOpenR;
      }

      t.lookX = clamp1(t.lookX);
      t.lookY = clamp1(t.lookY);
      t.eyeOpenL = Math.max(0, Math.min(1, t.eyeOpenL));
      t.eyeOpenR = Math.max(0, Math.min(1, t.eyeOpenR));

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return targetRef;
}
