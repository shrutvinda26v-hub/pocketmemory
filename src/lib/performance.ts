export type DeviceTier = "high" | "medium" | "low";

export function detectDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "medium";

  const ua = navigator.userAgent;
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  if (isMobile || cores <= 4 || memory <= 2) return "low";
  if (cores <= 6 || memory <= 4 || window.innerWidth < 1100) return "medium";
  return "high";
}

export function getParticleBudget(tier: DeviceTier): number {
  switch (tier) {
    case "high":
      return 280;
    case "medium":
      return 160;
    default:
      return 90;
  }
}

export function getButterflyCount(tier: DeviceTier): number {
  switch (tier) {
    case "high":
      return 14;
    case "medium":
      return 10;
    default:
      return 7;
  }
}

export function cappedDpr(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, 1.75);
}
