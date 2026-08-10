import type { InteractionPoint } from "./sceneTypes";

export type TrackingStatus = "idle" | "requesting" | "active" | "denied" | "unsupported" | "error";

type HandLandmarkerInstance = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => {
    landmarks?: Array<Array<{ x: number; y: number; z: number }>>;
  };
  close: () => void;
};

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export class HandTracker {
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private landmarker: HandLandmarkerInstance | null = null;
  private raf = 0;
  private lastVideoTime = -1;
  private smoothedX = 0;
  private smoothedY = 0;
  private hasSample = false;
  private running = false;

  status: TrackingStatus = "idle";
  point: InteractionPoint = {
    x: 0,
    y: 0,
    active: false,
    source: "none",
    strength: 0,
  };

  onStatus?: (status: TrackingStatus) => void;

  private setStatus(status: TrackingStatus) {
    this.status = status;
    this.onStatus?.(status);
  }

  async start() {
    if (this.running) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.setStatus("unsupported");
      return;
    }

    this.setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      this.stream = stream;

      const video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      video.srcObject = stream;
      await video.play();
      this.video = video;

      const vision = await import("@mediapipe/tasks-vision");
      const { FilesetResolver, HandLandmarker } = vision;
      const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
      this.landmarker = (await HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      })) as unknown as HandLandmarkerInstance;

      this.running = true;
      this.setStatus("active");
      this.loop();
    } catch (err) {
      console.error("Hand tracking failed", err);
      const name = err instanceof Error ? err.name : "";
      this.setStatus(name === "NotAllowedError" ? "denied" : "error");
      this.stop();
    }
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.landmarker?.close();
    this.landmarker = null;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.video = null;
    this.hasSample = false;
    this.point = { x: 0, y: 0, active: false, source: "none", strength: 0 };
    if (this.status === "active" || this.status === "requesting") {
      this.setStatus("idle");
    }
  }

  private loop = () => {
    if (!this.running || !this.video || !this.landmarker) return;
    const now = performance.now();
    if (this.video.currentTime !== this.lastVideoTime && this.video.readyState >= 2) {
      this.lastVideoTime = this.video.currentTime;
      const result = this.landmarker.detectForVideo(this.video, now);
      const landmarks = result.landmarks?.[0];
      if (landmarks?.[8]) {
        // Mirrored X for selfie camera feel
        const targetX = (1 - landmarks[8].x) * window.innerWidth;
        const targetY = landmarks[8].y * window.innerHeight;
        if (!this.hasSample) {
          this.smoothedX = targetX;
          this.smoothedY = targetY;
          this.hasSample = true;
        } else {
          this.smoothedX += (targetX - this.smoothedX) * 0.12;
          this.smoothedY += (targetY - this.smoothedY) * 0.12;
        }
        this.point = {
          x: this.smoothedX,
          y: this.smoothedY,
          active: true,
          source: "hand",
          strength: 1,
        };
      } else {
        this.point = {
          ...this.point,
          active: false,
          strength: Math.max(0, this.point.strength - 0.05),
        };
      }
    }
    this.raf = requestAnimationFrame(this.loop);
  };
}
