"use client";

import { useCallback, useEffect, useRef, useState, useEffectEvent } from "react";
import { HandTracker, type TrackingStatus } from "@/lib/handTracker";
import { SceneEngine } from "@/lib/sceneEngine";
import type { InteractionPoint } from "@/lib/sceneTypes";
import { UIOverlay } from "./UIOverlay";

function isTouchPrimaryDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

export function LivingTreeExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const interactionRef = useRef<InteractionPoint>({
    x: 0,
    y: 0,
    active: false,
    source: "none",
    strength: 0,
  });
  const touchActiveRef = useRef(false);
  const autoStartRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [awakened, setAwakened] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>("idle");
  const [handDetected, setHandDetected] = useState(false);
  const [isTouchPrimary] = useState(() => isTouchPrimaryDevice());

  const onFirstAwaken = useEffectEvent(() => {
    setAwakened(true);
  });

  const toggleCamera = useCallback(async () => {
    const tracker = trackerRef.current;
    if (!tracker) return;
    if (tracker.status === "active" || tracker.status === "requesting") {
      tracker.stop();
      setTrackingStatus("idle");
      setHandDetected(false);
    } else {
      await tracker.start();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new SceneEngine(canvas);
    engineRef.current = engine;
    engine.onFirstAwaken = onFirstAwaken;

    let disposed = false;
    engine.init().then(() => {
      if (!disposed) {
        setReady(true);
        if (!isTouchPrimary && !autoStartRef.current) {
          autoStartRef.current = true;
          window.setTimeout(() => {
            if (!disposed) void toggleCamera();
          }, 2200);
        }
      }
    });

    const tracker = new HandTracker();
    trackerRef.current = tracker;
    tracker.onStatus = (status) => setTrackingStatus(status);

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    let lastDetected: boolean | null = null;
    const syncLoop = () => {
      const trackerPoint = tracker.point;
      let next = interactionRef.current;

      if (tracker.status === "active" && trackerPoint.active) {
        next = trackerPoint;
        if (lastDetected !== true) {
          lastDetected = true;
          setHandDetected(true);
        }
      } else if (tracker.status === "active") {
        if (lastDetected !== false) {
          lastDetected = false;
          setHandDetected(false);
        }
        if (!touchActiveRef.current && next.source === "hand") {
          next = { ...next, active: false, strength: Math.max(0, next.strength - 0.04) };
        }
      }

      interactionRef.current = next;
      engine.setInteraction(next);
      raf = requestAnimationFrame(syncLoop);
    };
    let raf = requestAnimationFrame(syncLoop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      tracker.stop();
      engine.destroy();
      engineRef.current = null;
      trackerRef.current = null;
    };
  }, [isTouchPrimary, toggleCamera]);

  useEffect(() => {
    const engine = () => engineRef.current;

    const onPointerMove = (e: PointerEvent) => {
      if (touchActiveRef.current) return;
      const tracker = trackerRef.current;
      if (tracker?.status === "active" && tracker.point.active) {
        return;
      }

      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      engine()?.setParallaxTarget(nx, ny);

      if (!tracker || tracker.status !== "active") {
        interactionRef.current = {
          x: e.clientX,
          y: e.clientY,
          active: true,
          source: "mouse",
          strength: 0.85,
        };
      }
    };

    const onPointerLeave = () => {
      if (interactionRef.current.source === "mouse") {
        interactionRef.current = {
          ...interactionRef.current,
          active: false,
          strength: 0,
        };
      }
      engine()?.setParallaxTarget(0, 0);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touchActiveRef.current = true;
      interactionRef.current = {
        x: t.clientX,
        y: t.clientY,
        active: true,
        source: "touch",
        strength: 1,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      interactionRef.current = {
        x: t.clientX,
        y: t.clientY,
        active: true,
        source: "touch",
        strength: 1,
      };
      const nx = (t.clientX / window.innerWidth) * 2 - 1;
      const ny = (t.clientY / window.innerHeight) * 2 - 1;
      engine()?.setParallaxTarget(nx * 0.4, ny * 0.4);
    };

    const onTouchEnd = () => {
      touchActiveRef.current = false;
      if (interactionRef.current.source === "touch") {
        interactionRef.current = {
          ...interactionRef.current,
          active: false,
          strength: 0.2,
        };
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#000814]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-label="Interactive living tree scene"
      />
      <UIOverlay
        ready={ready}
        awakened={awakened}
        trackingStatus={trackingStatus}
        handDetected={handDetected}
        isTouchPrimary={isTouchPrimary}
        onToggleCamera={() => void toggleCamera()}
      />
    </div>
  );
}
