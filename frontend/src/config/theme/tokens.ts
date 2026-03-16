/**
 * Base design tokens - theme-agnostic.
 * Single source of truth for colors, spacing, radii.
 */

export const gameColors = {
  green: "#58cc02",
  greenDark: "#46a302",
  blue: "#1cb0f6",
  blueDark: "#1899d6",
  orange: "#ff9600",
  orangeDark: "#e68700",
  red: "#ff4b4b",
  redDark: "#e54343",
  purple: "#ce82ff",
  purpleDark: "#af6fdb",
  gold: "#ffc800",
  goldDark: "#e5b400",
  teal: "#14b8a6",
  tealDark: "#0d9488",
  pink: "#ec4899",
  pinkDark: "#db2777",
} as const;

export const spacing = {
  radiusGame: "1rem",
  radiusSm: "0.5rem",
  radiusMd: "0.75rem",
  radiusLg: "1.5rem",
  radiusXl: "1.5rem",
} as const;

/** Map marker colors - semantic names for marker states (far, near, unlocked, chest, own, grey for hidden/claimed) */
export const markerColors = {
  purple: gameColors.purple,
  orange: gameColors.orange,
  green: gameColors.green,
  gold: gameColors.gold,
  teal: gameColors.teal,
  blue: gameColors.blue,
  red: gameColors.red,
  pink: gameColors.pink,
  grey: "#6b7280",
} as const;
