/**
 * API response types - shared across multiple services
 * Entity-specific response types are defined in service-specific /types/response.ts files
 */

import type { NearbyMessage } from "@/types";

export interface NearbyChest {
  id: string;
  content: string;
  location: { latitude: number; longitude: number; altitude?: number };
  distance: number;
  xpReward: number;
  coinReward?: number;
  variant?: "normal" | "snake";
  createdBy?: string;
  createdAt: string;
  isOwn?: boolean;
}

export type LootItemType =
  | "avatar"
  | "diamond"
  | "cash_chest"
  | "loot_box"
  | "surprise"
  | "powerup"
  | "bomb"
  | "snake";

export interface NearbyLootItem {
  id: string;
  type: LootItemType;
  content: string;
  location: { latitude: number; longitude: number; altitude?: number };
  distance: number;
  xpReward: number;
  coinReward: number;
  isPenalty?: boolean;
  createdBy?: string;
  createdAt: string;
  isOwn?: boolean;
}

/**
 * Combined map viewport response - used for optimistic updates across messages/chests/loot services
 */
export interface GetMapViewportResponse {
  messages: NearbyMessage[];
  chests: NearbyChest[];
  lootItems: NearbyLootItem[];
}

/**
 * My items response - combines created and found items from multiple services
 * Used by mutation handlers for optimistic updates
 */
export interface GetMyItemsResponse {
  createdMessages: any; // CreatedMessageItem from messagesService
  createdChests: any; // CreatedChestItem from chestsService
  foundChests: any; // FoundChestItem from chestsService
  foundLoot: any; // FoundLootItem from myItemsService
  foundMessages: any; // FoundMessageItem from myItemsService
}

export interface SeedNearbyResponse {
  ok: boolean;
  messages: number;
  chests: number;
}
