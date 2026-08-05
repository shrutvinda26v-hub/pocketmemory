import type { Season } from "@/store/useExperienceStore";

export interface SeasonPalette {
  leaf: string;
  leafSecondary: string;
  lightIntensity: number;
  lightColor: string;
  ambientIntensity: number;
  sunPosition: [number, number, number];
  /** Scene clear / fog / paper wash */
  fogColor: string;
  /** CSS page background */
  bg: string;
  /** Paper wall tint */
  paper: string;
  particleColor: string;
  windStrength: number;
  blossomEnabled: boolean;
  fireflyEnabled: boolean;
  snowEnabled: boolean;
  rainEnabled: boolean;
  sunVisible: boolean;
}

export const SEASON_CONFIG: Record<Season, SeasonPalette> = {
  // Soft drizzle — cool grey-green, gentle light
  rain: {
    leaf: "#4A7A52",
    leafSecondary: "#6B9A68",
    lightIntensity: 0.85,
    lightColor: "#D8E0E6",
    ambientIntensity: 0.58,
    sunPosition: [2, 5, 3],
    fogColor: "#D8E0E4",
    bg: "#DCE4E8",
    paper: "#E2E8EC",
    particleColor: "#A8C0D0",
    windStrength: 0.35,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: false,
    rainEnabled: true,
    sunVisible: false,
  },
  summer: {
    leaf: "#3F6B38",
    leafSecondary: "#5A8A48",
    lightIntensity: 1.55,
    lightColor: "#FFF4D8",
    ambientIntensity: 0.55,
    sunPosition: [6, 9, 2],
    fogColor: "#F5EEDC",
    bg: "#F7F0E0",
    paper: "#F8F2E4",
    particleColor: "#A8C686",
    windStrength: 0.45,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: false,
    rainEnabled: false,
    sunVisible: true,
  },
  autumn: {
    leaf: "#B85A2E",
    leafSecondary: "#C8903A",
    lightIntensity: 1.05,
    lightColor: "#FFE4C4",
    ambientIntensity: 0.45,
    sunPosition: [3, 4, 2],
    fogColor: "#EBDCC8",
    bg: "#EFE0CC",
    paper: "#F2E4D0",
    particleColor: "#C4893A",
    windStrength: 0.9,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: false,
    rainEnabled: false,
    sunVisible: false,
  },
  winter: {
    // Snow-dusted white canopy (winter only)
    leaf: "#FFFFFF",
    leafSecondary: "#F2F5F8",
    lightIntensity: 1.1,
    lightColor: "#E8EEF5",
    ambientIntensity: 0.62,
    sunPosition: [2, 5, 4],
    fogColor: "#D8E0E8",
    bg: "#DCE4EC",
    paper: "#E2E8F0",
    particleColor: "#FFFFFF",
    windStrength: 0.3,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: true,
    rainEnabled: false,
    sunVisible: false,
  },
};

export function goldenHourBoost(progress: number) {
  const t = Math.max(0, (progress - 0.88) / 0.12);
  return {
    intensity: 1 + t * 0.25,
    colorShift: t,
    fireflies: t > 0.3,
    lanterns: t > 0.2,
  };
}
