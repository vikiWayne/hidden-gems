/**
 * Configurable item types and their properties.
 * Edit this file to change behavior, rewards, penalties, and icons.
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

export type ChestVariant = "normal" | "snake";

export interface PenaltyConfig {
  /** XP amount to drop when user opens bomb or snake */
  xpDrop: number;
  /** Coins amount to drop when user opens bomb or snake */
  coinDrop: number;
}

export interface MapItemConfig {
  /** Display label */
  label: string;
  /** Icon key for frontend (e.g. 'diamond', 'bomb') */
  icon: string;
  /** Default XP reward (0 for penalty items) */
  xpReward: number;
  /** Default coin reward (0 for penalty items) */
  coinReward: number;
  /** If true, opening applies penalty (xpDrop, coinDrop) */
  isPenalty: boolean;
}

/** Penalty amounts when user opens bombs or snakes in chests */
export const PENALTY_CONFIG: PenaltyConfig = {
  xpDrop: 15,
  coinDrop: 10,
};

/** Configuration for each loot item type */
export const LOOT_ITEM_CONFIG: Record<LootItemType, MapItemConfig> = {
  avatar: {
    label: "Avatar",
    icon: "avatar",
    xpReward: 0,
    coinReward: 0,
    isPenalty: false,
  },
  diamond: {
    label: "Diamond",
    icon: "diamond",
    xpReward: 25,
    coinReward: 5,
    isPenalty: false,
  },
  cash_chest: {
    label: "Cash Chest",
    icon: "cash_chest",
    xpReward: 10,
    coinReward: 50,
    isPenalty: false,
  },
  loot_box: {
    label: "Loot Box",
    icon: "loot_box",
    xpReward: 30,
    coinReward: 20,
    isPenalty: false,
  },
  surprise: {
    label: "Surprise",
    icon: "surprise",
    xpReward: 20,
    coinReward: 15,
    isPenalty: false,
  },
  powerup: {
    label: "Powerup",
    icon: "powerup",
    xpReward: 15,
    coinReward: 10,
    isPenalty: false,
  },
  bomb: {
    label: "Bomb",
    icon: "bomb",
    xpReward: 0,
    coinReward: 0,
    isPenalty: true,
  },
  snake: {
    label: "Snake",
    icon: "snake",
    xpReward: 0,
    coinReward: 0,
    isPenalty: true,
  },
};

/** Geo constants - edit these for different radii */
export const GEO_CONFIG = {
  /** Nearby radius in meters (2 km) */
  NEARBY_RADIUS_M: 500,
  /** Unlock distance in meters */
  UNLOCK_DISTANCE_M: 20,
  /** Chest hunter radius in meters */
  CHEST_HUNTER_RADIUS_M: 1000,
};
