import type { Season } from "@/store/useExperienceStore";

export interface SeasonPalette {
  leaf: string;
  leafSecondary: string;
  lightIntensity: number;
  lightColor: string;
  ambientIntensity: number;
  sunPosition: [number, number, number];
  fogColor: string;
  particleColor: string;
  windStrength: number;
  blossomEnabled: boolean;
  fireflyEnabled: boolean;
  snowEnabled: boolean;
}

export const SEASON_CONFIG: Record<Season, SeasonPalette> = {
  // Brighter seasonal leaf hues so canopy reads clearly against paper
  spring: {
    leaf: "#7BA05B",
    leafSecondary: "#C4D6A5",
    lightIntensity: 1.15,
    lightColor: "#FFF5E6",
    ambientIntensity: 0.55,
    sunPosition: [4, 6, 2],
    fogColor: "#F5F0E8",
    particleColor: "#F2C4D0",
    windStrength: 0.7,
    blossomEnabled: true,
    fireflyEnabled: false,
    snowEnabled: false,
  },
  summer: {
    leaf: "#4F7A45",
    leafSecondary: "#6B9A55",
    lightIntensity: 1.35,
    lightColor: "#FFF8EE",
    ambientIntensity: 0.5,
    sunPosition: [5, 7, 3],
    fogColor: "#F5F0E8",
    particleColor: "#A8C686",
    windStrength: 0.55,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: false,
  },
  autumn: {
    leaf: "#C46A3A",
    leafSecondary: "#D4A04A",
    lightIntensity: 1.05,
    lightColor: "#FFE4C4",
    ambientIntensity: 0.45,
    sunPosition: [3, 4, 2],
    fogColor: "#EDE4D6",
    particleColor: "#C4893A",
    windStrength: 0.9,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: false,
  },
  winter: {
    leaf: "#6B7A6A",
    leafSecondary: "#8A9A88",
    lightIntensity: 0.85,
    lightColor: "#E8EEF5",
    ambientIntensity: 0.4,
    sunPosition: [2, 5, 4],
    fogColor: "#E8E4DC",
    particleColor: "#FFFFFF",
    windStrength: 0.35,
    blossomEnabled: false,
    fireflyEnabled: false,
    snowEnabled: true,
  },
};

export function goldenHourBoost(progress: number) {
  // Final section warms the light
  const t = Math.max(0, (progress - 0.88) / 0.12);
  return {
    intensity: 1 + t * 0.25,
    colorShift: t,
    fireflies: t > 0.3,
    lanterns: t > 0.2,
  };
}
