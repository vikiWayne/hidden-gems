/**
 * Theme configuration - single source of truth for colors, spacing, themes.
 */

export { gameColors, markerColors, spacing } from "./tokens";
export { themes, type ThemeKey, type ThemeSurface } from "./themes";
export { injectTheme, themeToCssVars } from "./injectTheme";

import { gameColors } from "./tokens";
import { markerColors } from "./tokens";
import { themes, type ThemeKey } from "./themes";

/** Merged theme values for JS consumers (e.g. map markers, canvas). */
export interface ThemeColors {
  game: typeof gameColors;
  marker: typeof markerColors;
  surface: {
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    textMuted: string;
    border: string;
  };
}

export function getThemeColors(themeKey: ThemeKey): ThemeColors {
  const surface = themes[themeKey];
  return {
    game: gameColors,
    marker: markerColors,
    surface,
  };
}

/** Resolve initial theme from persisted store or system preference. Used before React mount. */
export function getInitialTheme(): ThemeKey {
  if (typeof window === "undefined") return "dark";
  try {
    const raw = localStorage.getItem("taptag-theme");
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { theme?: string; systemPreference?: "dark" | "light" } };
      const theme = parsed?.state?.theme;
      const systemPreference = parsed?.state?.systemPreference ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const resolved = theme === "system" ? systemPreference : theme;
      if (resolved === "dark" || resolved === "light") return resolved;
    }
  } catch {
    // ignore parse errors
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
