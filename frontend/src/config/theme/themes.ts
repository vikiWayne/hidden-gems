/**
 * Theme-specific surface colors.
 * Each theme overrides bg, text, and border tokens.
 */

export type ThemeKey = "light" | "dark" | "chest-hunter";

export interface ThemeSurface {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textMuted: string;
  border: string;
}

export const themes: Record<ThemeKey, ThemeSurface> = {
  light: {
    bgPrimary: "#f0f9ff",
    bgSecondary: "#e0f2fe",
    textPrimary: "#0c4a6e",
    textMuted: "#0369a1",
    border: "#bae6fd",
  },
  dark: {
    bgPrimary: "#131f24",
    bgSecondary: "#232d33",
    textPrimary: "#eeeeee",
    textMuted: "#afafaf",
    border: "#37464f",
  },
  "chest-hunter": {
    bgPrimary: "#2c1e14",
    bgSecondary: "#3d2b1d",
    textPrimary: "#f2e6d9",
    textMuted: "#c9b3a3",
    border: "#5c4033",
  },
} as const;
