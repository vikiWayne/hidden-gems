/**
 * Injects theme CSS variables onto the document root.
 * Call when theme changes (light/dark/chest-hunter).
 */

import { gameColors } from "./tokens";
import { spacing } from "./tokens";
import { themes, type ThemeKey } from "./themes";

export function themeToCssVars(themeKey: ThemeKey): Record<string, string> {
  const surface = themes[themeKey];
  const vars: Record<string, string> = {};

  // Game colors (shared across themes)
  vars["color-game-green"] = gameColors.green;
  vars["color-game-green-dark"] = gameColors.greenDark;
  vars["color-game-blue"] = gameColors.blue;
  vars["color-game-blue-dark"] = gameColors.blueDark;
  vars["color-game-orange"] = gameColors.orange;
  vars["color-game-orange-dark"] = gameColors.orangeDark;
  vars["color-game-red"] = gameColors.red;
  vars["color-game-red-dark"] = gameColors.redDark;
  vars["color-game-purple"] = gameColors.purple;
  vars["color-game-purple-dark"] = gameColors.purpleDark;
  vars["color-game-gold"] = gameColors.gold;
  vars["color-game-gold-dark"] = gameColors.goldDark;

  // Surface colors (theme-specific)
  vars["color-bg-primary"] = surface.bgPrimary;
  vars["color-bg-secondary"] = surface.bgSecondary;
  vars["color-text-primary"] = surface.textPrimary;
  vars["color-text-muted"] = surface.textMuted;
  vars["color-border"] = surface.border;

  // Spacing / radii
  vars["radius-game"] = spacing.radiusGame;
  vars["radius-sm"] = spacing.radiusSm;
  vars["radius-md"] = spacing.radiusMd;
  vars["radius-lg"] = spacing.radiusLg;

  return vars;
}

export function injectTheme(themeKey: ThemeKey, target: HTMLElement = document.documentElement): void {
  const vars = themeToCssVars(themeKey);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(`--${name}`, value);
  }
}
