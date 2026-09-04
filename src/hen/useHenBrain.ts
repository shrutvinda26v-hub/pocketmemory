import { useEffect, useRef } from "react";
import { ExprId, IDLE_POOL, RAPID_CHAIN, applyExpr } from "./expressions";
import { HenPose, clamp1, defaultPose } from "./pose";

export type FocusField = "none" | "email" | "password" | "login";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickWeighted(pool: typeof IDLE_POOL, banned: string[]) {
  const eligible = pool.filter((item) => !banned.includes(item.id));
  const list = eligible.length ? eligible : pool;
  const total = list.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of list) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return list[0];
}

function unusualEmail(email: string) {
  if (email.length < 4) return false;
  if (email.length > 32) return true;
  if (/^[0-9]+@/.test(email)) return true;
  if (/\.\.|@@|^\.|@\./.test(email)) return true;
  if (!email.includes("@") && email.length > 10) return true;
  return false;
}

function validishEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

type Beat = {
  id: ExprId;
  until: number;
  intensity: number;
};

export function useHenBrain(input: {
  focus: FocusField;
  email: string;
  passwordVisible: boolean;
  typingEmail: boolean;
  typingPassword: boolean;
  submitting: boolean;
  celebrating: boolean;
  pointerRef: { current: { x: number; y: number } | null };
  lastActivityRef: { current: number };
}) {
  const targetRef = useRef<HenPose>(defaultPose());
  const beatRef = useRef<Beat>({ id: "happy", until: 0, intensity: 1 });
  const recentRef = useRef<ExprId[]>([]);
  const lastTypedAt = useRef(0);
  const passwordSince = useRef(0);
  const realizedPassword = useRef(false);
  const peekUntil = useRef(0);
  const peekBothUntil = useRef(0);
  const caughtUntil = useRef(0);
  const sawNothingUntil = useRef(0);
  const lastPeekAt = useRef(0);
  const rapidUntil = useRef(0);
  const rapidStep = useRef(0);
  const shockUntil = useRef(0);
  const lastFocus = useRef<FocusField>("none");
  const bootAt = useRef(0);
  const inputRef = useRef(input);
  inputRef.current = input;

  const prevEmail = useRef(input.email);
  if (input.email !== prevEmail.current) {
    prevEmail.current = input.email;
    lastTypedAt.current = performance.now();
  }

  useEffect(() => {
    const prev = lastFocus.current;
    lastFocus.current = input.focus;
    if (input.focus === "password") {
      passwordSince.current = performance.now();
      realizedPassword.current = false;
      const id = window.setTimeout(() => {
        realizedPassword.current = true;
      }, 320);
      return () => window.clearTimeout(id);
    }
    if (prev === "password") {
      sawNothingUntil.current = performance.now() + rand(900, 1600);
    }
    realizedPassword.current = false;
  }, [input.focus]);

  useEffect(() => {
    let blinkTimer = 0;
    let idleTimer = 0;
    let peekTimer = 0;

    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        const current = inputRef.current;
        if (current.focus !== "password" && !current.submitting && !current.celebrating) {
          const tnow = performance.now();
          if (bootAt.current && tnow - bootAt.current < 3000) {
            scheduleBlink();
            return;
          }
          beatRef.current = {
            id: Math.random() < 0.18 ? "rapidBlink" : "slowBlink",
            until: performance.now() + rand(90, 170),
            intensity: 1,
          };
        }
        scheduleBlink();
      }, rand(1600, 4200));
    };

    const scheduleIdle = () => {
      idleTimer = window.setTimeout(() => {
        const current = inputRef.current;
        const now = performance.now();
        if (current.focus === "none" && !current.submitting && !current.celebrating && beatRef.current.until < now) {
          if (bootAt.current && now - bootAt.current < 3200) {
            scheduleIdle();
            return;
          }
          if (Math.random() < 0.045) {
            rapidUntil.current = now + 1400;
            rapidStep.current = 0;
          } else {
            const idleMs = now - current.lastActivityRef.current;
            let pool = IDLE_POOL;
            if (idleMs < 5000) {
              pool = IDLE_POOL.filter((item) => item.id !== "bored" && item.id !== "sleepy");
            }
            const next = pickWeighted(pool, recentRef.current);
            beatRef.current = {
              id: next.id,
              until: now + rand(next.min, next.max) * rand(0.85, 1.2),
              intensity: rand(0.7, 1.12),
            };
            recentRef.current = [...recentRef.current, next.id].slice(-4);
          }
        }
        scheduleIdle();
      }, rand(380, 1100));
    };

    const schedulePeek = () => {
      peekTimer = window.setTimeout(() => {
        const current = inputRef.current;
        const now = performance.now();
        if (current.focus === "password" && !current.passwordVisible && realizedPassword.current) {
          const typingLong = now - passwordSince.current > 3800;
          peekUntil.current = now + rand(420, 780);
          lastPeekAt.current = now;
          if (Math.random() < (typingLong ? 0.35 : 0.22)) {
            peekBothUntil.current = now + rand(160, 280);
          }
        }
        schedulePeek();
      }, rand(1100, 2400));
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
      const breathe = Math.sin(now / 640) * 0.5 + 0.5;
      const idleMs = now - current.lastActivityRef.current;
      const pointer = current.pointerRef.current;

      Object.assign(t, defaultPose());
      t.breathe = breathe;
      t.leanY = Math.sin(now / 640) * 2.4;
      t.headTilt = Math.sin(now / 1800) * 2;
      t.beak = 0.08 + breathe * 0.04;
      t.smile = 0.18;
      t.wingL = Math.sin(now / 900) * 2;
      t.wingR = Math.sin(now / 820 + 1) * 2;
      t.bounce = Math.sin(now / 420) * 1.2;

      if (pointer && current.focus === "none") {
        t.lookX = pointer.x * 0.38;
        t.lookY = pointer.y * 0.28;
      }

      const overHen = Boolean(pointer && pointer.x < -0.05);
      if (overHen && peekUntil.current + 900 > now && peekUntil.current <= now && caughtUntil.current < now) {
        caughtUntil.current = now + rand(520, 900);
      }

      if (!bootAt.current) bootAt.current = now;
      const intro = now - bootAt.current;
      const inIntro = intro < 2800 && current.focus === "none" && !current.celebrating && !current.submitting;

      if (current.submitting || current.celebrating) {
        applyExpr(t, "proudOfYou", 1, now);
      } else if (inIntro) {
        if (intro < 480) {
          applyExpr(t, "sleepy", 1, now);
          t.headTurn = -0.95;
          t.eyeOpenL = 0;
          t.eyeOpenR = 0;
          t.wingCover = 0.55;
          t.leanY = 16;
          t.beak = 0.15 + Math.sin(now / 180) * 0.12;
        } else if (intro < 920) {
          applyExpr(t, "peek", 1, now);
          t.headTurn = -0.35;
          t.lookX = 0;
          t.lookY = -0.08;
          t.eyeOpenL = 0;
          t.eyeOpenR = 1;
          t.eyeWiden = 0.35;
          t.blush = 0.15;
        } else if (intro < 1680) {
          applyExpr(t, "woo", 1, now);
          t.lookX = 0;
          t.lookY = -0.12;
          t.headTurn = 0;
          t.leanX = 0;
          t.bounce = intro < 1100 ? -10 : 14 * Math.abs(Math.sin((intro - 1100) / 70));
          t.puff = 0.45;
          t.wingL = 16;
          t.wingR = 16;
          t.beak = 1;
          t.smile = 0;
        } else {
          applyExpr(t, "excited", 1, now);
          t.lookX = 0;
          t.lookY = -0.1;
          t.smile = 0.85;
          t.beak = 0.2;
          t.wingL = 18 + Math.sin(now / 80) * 10;
          t.wingR = 18 + Math.cos(now / 80) * 10;
          t.bounce = 8 * Math.abs(Math.sin(now / 100));
        }
      } else if (current.focus === "login") {
        applyExpr(t, "excited", 0.9, now);
        t.lookX = 0.85;
        t.lookY = 0.15;
        t.neck = 0.35;
      } else if (current.focus === "password" && current.passwordVisible) {
        applyExpr(t, "shocked", 0.8, now);
        t.lookX = 0.92;
        t.lookY = 0.1;
        t.headTurn = 0.2;
        t.blush = 0.55;
      } else if (current.focus === "password") {
        if (!realizedPassword.current) {
          applyExpr(t, "private", 1, now);
        } else {
          if (lastPeekAt.current === 0 && now - passwordSince.current > 1300) {
            peekUntil.current = now + 620;
            lastPeekAt.current = now;
          }
          if (caughtUntil.current > now) {
            applyExpr(t, "caught", 1, now);
          } else if (peekBothUntil.current > now) {
            applyExpr(t, "peekBoth", 1, now);
          } else if (peekUntil.current > now) {
            applyExpr(t, "peek", 1, now);
          } else if (now - passwordSince.current > 5000 && current.typingPassword) {
            applyExpr(t, "tempted", 1, now);
          } else {
            applyExpr(t, "innocent", 1, now);
            t.headTilt += Math.sin(now / 240) * 2;
          }
        }
      } else if (sawNothingUntil.current > now) {
        applyExpr(t, "sawNothing", 1, now);
      } else if (current.focus === "email") {
        const typedAgo = now - lastTypedAt.current;
        const paused = typedAgo > 780;
        if (!current.email.includes("@")) {
          shockUntil.current = 0;
        } else if (current.email.includes("@") && shockUntil.current === 0) {
          shockUntil.current = now + 280;
        }
        if (shockUntil.current > now && current.email.includes("@") && typedAgo < 400) {
          applyExpr(t, "woo", 1, now);
          t.lookX = 0.8;
        } else if (paused && validishEmail(current.email) && typedAgo > 1400) {
          applyExpr(t, "knows", 1, now);
          t.lookX = typedAgo > 2000 ? 0.2 : 0;
          t.headTurn = typedAgo > 2200 ? 0.18 : 0;
        } else if (paused && unusualEmail(current.email) && typedAgo > 1400) {
          applyExpr(t, "judging", 1, now);
        } else {
          applyExpr(t, "woo", 1, now);
          t.lookX = 0.55 + clamp1(current.email.length / 22) * 0.35;
          t.beak = 1;
          t.smile = 0;
          t.eyeWiden = 1;
        }
      } else if (rapidUntil.current > now) {
        const step = Math.min(RAPID_CHAIN.length - 1, Math.floor((1400 - (rapidUntil.current - now)) / 280));
        rapidStep.current = step;
        applyExpr(t, RAPID_CHAIN[step], 1, now);
      } else if (idleMs > 9000 && current.focus === "none") {
        applyExpr(t, idleMs > 14000 ? "sleepy" : "bored", 1, now);
        if (pointer && Math.abs(pointer.x) + Math.abs(pointer.y) > 0.15 && idleMs > 200) {
          applyExpr(t, "curious", 0.7, now);
          t.lookX = pointer.x * 0.6;
        }
      } else if (idleMs > 7000 && current.focus === "none") {
        applyExpr(t, "suspicious", 0.85, now);
      } else if (beatRef.current.until > now) {
        applyExpr(t, beatRef.current.id, beatRef.current.intensity, now);
        if (pointer && beatRef.current.id !== "slowBlink" && beatRef.current.id !== "rapidBlink") {
          t.lookX += pointer.x * 0.18;
          t.lookY += pointer.y * 0.12;
        }
      } else {
        applyExpr(t, "happy", 0.85, now);
        if (pointer) {
          t.lookX = pointer.x * 0.42;
          t.lookY = pointer.y * 0.3;
        }
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
