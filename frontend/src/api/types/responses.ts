/**
 * API response types - single source of truth for response payloads
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

export interface GetMapViewportResponse {
  messages: NearbyMessage[];
  chests: NearbyChest[];
  lootItems: NearbyLootItem[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  discovered: number;
  chestsFound: number;
}

export interface SearchUser {
  id: string;
  username: string;
}

export interface GetNearbyMessagesResponse {
  messages: NearbyMessage[];
}

export interface CreateMessageResponse {
  message: { id: string };
}

export interface GetMessageResponse {
  message: unknown;
  unlocked: boolean;
}

export interface GetNearbyChestsResponse {
  chests: NearbyChest[];
}

export interface CreateChestResponse {
  chest: { id: string };
}

export interface GetLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

export interface SeedNearbyResponse {
  ok: boolean;
  messages: number;
  chests: number;
}

export interface UpdateMessageResponse {
  message: unknown;
}

export interface SearchUsersResponse {
  users: SearchUser[];
}

export interface CreatedMessageItem {
  id: string;
  type: "text" | "voice" | "image" | "video";
  content: string;
  mediaUrl?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  visibility: "public" | "private";
  allowedUserIds: string[];
  category?: string;
  markerColor?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CreatedChestItem {
  id: string;
  content: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  xpReward: number;
  coinReward?: number;
  variant?: "normal" | "snake";
  createdBy?: string;
  createdAt: string;
}

export interface FoundChestItem {
  id: string;
  itemId: string;
  content: string;
  xpReward: number;
  finderOrdinal: number;
  foundAt: string;
}

export interface FoundLootItem {
  id: string;
  itemId: string;
  type: string;
  content: string;
  xpReward: number;
  coinReward: number;
  finderOrdinal: number;
  foundAt: string;
}

export interface FoundMessageItem {
  id: string;
  itemId: string;
  type: string;
  content: string;
  foundAt: string;
  latitude: number;
  longitude: number;
}

export interface GetMyItemsResponse {
  createdMessages: CreatedMessageItem[];
  createdChests: CreatedChestItem[];
  foundChests: FoundChestItem[];
  foundLoot: FoundLootItem[];
  foundMessages: FoundMessageItem[];
}
