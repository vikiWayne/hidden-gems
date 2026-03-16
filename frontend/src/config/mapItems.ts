/**
 * Map item types and icon configuration.
 * Edit this file to add/change item types and icons.
 * Config can also be fetched from /api/map/config for server-driven config.
 */

export type LootItemType =
  | "avatar"
  | "diamond"
  | "cash_chest"
  | "loot_box"
  | "surprise"
  | "powerup"
  | "bomb"
  | "snake";

export type MapMarkerIcon =
  | "user"
  | "envelope-unopened"
  | "envelope-opened"
  | "locked"
  | "chest"
  | "chest-opened"
  | "stack"
  | LootItemType;

export interface LootItemIconConfig {
  /** SVG path or icon key for createGameIcon */
  icon: string;
  /** Default marker color */
  color: "purple" | "orange" | "green" | "gold" | "teal" | "blue" | "red" | "pink";
}

/** Icon mapping for loot item types - edit to customize */
export const LOOT_ITEM_ICONS: Record<LootItemType, LootItemIconConfig> = {
  avatar: { icon: "avatar", color: "blue" },
  diamond: { icon: "diamond", color: "gold" },
  cash_chest: { icon: "cash_chest", color: "green" },
  loot_box: { icon: "loot_box", color: "purple" },
  surprise: { icon: "surprise", color: "pink" },
  powerup: { icon: "powerup", color: "orange" },
  bomb: { icon: "bomb", color: "red" },
  snake: { icon: "snake", color: "red" },
};

/** Penalty config - can be overridden by API /api/map/config */
export const DEFAULT_PENALTY_CONFIG = {
  xpDrop: 15,
  coinDrop: 10,
};
