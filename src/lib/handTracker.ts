import type { InteractionPoint } from "./sceneTypes";

export type TrackingStatus =
  | "idle"
  | "requesting"
  | "loading"
  | "active"
  | "denied"
  | "unsupported"
  | "error";

type Landmark = { x: number; y: number; z: number };

type HandLandmarkerInstance = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => {
    landmarks?: Landmark[][];
  };
  close: () => void;
};

type HandLandmarkerCtor = {
  createFromOptions: (
    fileset: unknown,
    options: Record<string, unknown>,
  ) => Promise<HandLandmarkerInstance>;
};

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/** Index fingertip */
const INDEX_TIP = 8;
/** Palm approximation: wrist + MCP joints */
const PALM_IDS = [0, 5, 9, 13, 17] as const;

function palmCenter(landmarks: Landmark[]) {
  let x = 0;
  let y = 0;
  for (const id of PALM_IDS) {
    x += landmarks[id].x;
    y += landmarks[id].y;
  }
  const n = PALM_IDS.length;
  return { x: x / n, y: y / n };
}

export interface HandTrackingPoint extends InteractionPoint {
  palmX: number;
  palmY: number;
  vx: number;
  vy: number;
}

export class HandTracker {
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private landmarker: HandLandmarkerInstance | null = null;
  private raf = 0;
  private lastVideoTime = -1;
  private smoothedX = 0;
  private smoothedY = 0;
  private smoothedPalmX = 0;
  private smoothedPalmY = 0;
  private prevX = 0;
  private prevY = 0;
  private hasSample = false;
  private running = false;

  status: TrackingStatus = "idle";
  point: HandTrackingPoint = {
    x: 0,
    y: 0,
    palmX: 0,
    palmY: 0,
    vx: 0,
    vy: 0,
    active: false,
    source: "none",
    strength: 0,
  };

  onStatus?: (status: TrackingStatus) => void;

  private setStatus(status: TrackingStatus) {
    this.status = status;
    this.onStatus?.(status);
  }

  /** Soft probe only — never use this to block getUserMedia. */
  static async hasCamera(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return false;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((d) => d.kind === "videoinput");
    } catch {
      return false;
    }
  }

  async start() {
    if (this.running || this.status === "requesting" || this.status === "loading") return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.setStatus("unsupported");
      return;
    }

    this.setStatus("requesting");
    try {
      // Always request permission — don't gate on enumerateDevices
      // (many browsers hide cameras until the user grants access).
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });
      this.stream = stream;

      const video = document.createElement("video");
      video.setAttribute("playsinline", "true");
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      video.srcObject = stream;
      await video.play();
      this.video = video;

      this.setStatus("loading");
      this.landmarker = await this.createLandmarker();

      this.running = true;
      this.setStatus("active");
      this.loop();
    } catch (err) {
      this.cleanupMedia();
      const name = err instanceof Error ? err.name : "";
      const message = err instanceof Error ? err.message : String(err);

      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        this.setStatus("denied");
      } else if (
        name === "NotFoundError" ||
        name === "DevicesNotFoundError" ||
        /requested device not found/i.test(message)
      ) {
        this.setStatus("unsupported");
      } else {
        console.warn("Hand tracking failed", err);
        this.setStatus("error");
      }
    }
  }

  private async createLandmarker(): Promise<HandLandmarkerInstance> {
    const vision = await import("@mediapipe/tasks-vision");
    const { FilesetResolver, HandLandmarker } = vision as {
      FilesetResolver: { forVisionTasks: (path: string) => Promise<unknown> };
      HandLandmarker: HandLandmarkerCtor;
    };
    const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);

    const base = {
      baseOptions: {
        modelAssetPath: MODEL_URL,
      },
      runningMode: "VIDEO" as const,
      numHands: 1,
      minHandDetectionConfidence: 0.6,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    };

    try {
      return await HandLandmarker.createFromOptions(fileset, {
        ...base,
        baseOptions: { ...base.baseOptions, delegate: "GPU" },
      });
    } catch {
      // CPU fallback for devices without WebGL / GPU delegate support
      return await HandLandmarker.createFromOptions(fileset, {
        ...base,
        baseOptions: { ...base.baseOptions, delegate: "CPU" },
      });
    }
  }

  stop() {
    this.cleanupMedia();
    this.hasSample = false;
    this.point = {
      x: 0,
      y: 0,
      palmX: 0,
      palmY: 0,
      vx: 0,
      vy: 0,
      active: false,
      source: "none",
      strength: 0,
    };
    if (
      this.status === "active" ||
      this.status === "requesting" ||
      this.status === "loading"
    ) {
      this.setStatus("idle");
    }
  }

  private cleanupMedia() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.landmarker?.close();
    this.landmarker = null;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
    this.lastVideoTime = -1;
  }

  private loop = () => {
    if (!this.running || !this.video || !this.landmarker) return;
    const now = performance.now();

    if (this.video.currentTime !== this.lastVideoTime && this.video.readyState >= 2) {
      this.lastVideoTime = this.video.currentTime;
      try {
        const result = this.landmarker.detectForVideo(this.video, now);
        const landmarks = result.landmarks?.[0];
        if (landmarks?.[INDEX_TIP]) {
          const tip = landmarks[INDEX_TIP];
          const palm = palmCenter(landmarks);

          // Mirrored X — selfie webcam is typically mirrored
          const targetX = (1 - tip.x) * window.innerWidth;
          const targetY = tip.y * window.innerHeight;
          const targetPalmX = (1 - palm.x) * window.innerWidth;
          const targetPalmY = palm.y * window.innerHeight;

          if (!this.hasSample) {
            this.smoothedX = targetX;
            this.smoothedY = targetY;
            this.smoothedPalmX = targetPalmX;
            this.smoothedPalmY = targetPalmY;
            this.prevX = targetX;
            this.prevY = targetY;
            this.hasSample = true;
          } else {
            this.smoothedX += (targetX - this.smoothedX) * 0.12;
            this.smoothedY += (targetY - this.smoothedY) * 0.12;
            this.smoothedPalmX += (targetPalmX - this.smoothedPalmX) * 0.1;
            this.smoothedPalmY += (targetPalmY - this.smoothedPalmY) * 0.1;
          }

          const vx = this.smoothedX - this.prevX;
          const vy = this.smoothedY - this.prevY;
          this.prevX = this.smoothedX;
          this.prevY = this.smoothedY;

          // Movement boosts strength slightly for more lively glow
          const motion = Math.min(1, Math.hypot(vx, vy) / 28);

          this.point = {
            x: this.smoothedX,
            y: this.smoothedY,
            palmX: this.smoothedPalmX,
            palmY: this.smoothedPalmY,
            vx,
            vy,
            active: true,
            source: "hand",
            strength: 0.85 + motion * 0.15,
          };
        } else {
          this.point = {
            ...this.point,
            active: false,
            strength: Math.max(0, this.point.strength - 0.06),
            vx: 0,
            vy: 0,
          };
        }
      } catch (err) {
        console.warn("Hand detect frame failed", err);
      }
    }

    this.raf = requestAnimationFrame(this.loop);
  };
}
