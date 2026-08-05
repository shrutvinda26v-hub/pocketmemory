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
}

export const SEASON_CONFIG: Record<Season, SeasonPalette> = {
  spring: {
    leaf: "#6B9A52",
    leafSecondary: "#A8C478",
    lightIntensity: 1.15,
    lightColor: "#FFF5E8",
    ambientIntensity: 0.55,
    sunPosition: [4, 6, 2],
    fogColor: "#F6EBE4",
    bg: "#F7EDE6",
    paper: "#F8F0EA",
    particleColor: "#F2C4D0",
    windStrength: 0.7,
    blossomEnabled: true,
    fireflyEnabled: false,
    snowEnabled: false,
  },
  summer: {
    leaf: "#3F6B38",
    leafSecondary: "#5A8A48",
    lightIntensity: 1.3,
    lightColor: "#FFF8EE",
    ambientIntensity: 0.48,
    sunPosition: [5, 7, 3],
    fogColor: "#F3EEDF",
    bg: "#F5F0E4",
    paper: "#F6F1E6",
    particleColor: "#A8C686",
    windStrength: 0.55,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: false,
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
  },
  winter: {
    leaf: "#5A6A58",
    leafSecondary: "#7A8A76",
    lightIntensity: 0.85,
    lightColor: "#E8EEF5",
    ambientIntensity: 0.4,
    sunPosition: [2, 5, 4],
    fogColor: "#E4EAF0",
    bg: "#E6ECF2",
    paper: "#EAEFF4",
    particleColor: "#FFFFFF",
    windStrength: 0.35,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: true,
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
