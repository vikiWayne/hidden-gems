/**
 * Chests service response types
 */

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

export interface GetNearbyChestsResponse {
  chests: NearbyChest[];
}

export interface CreateChestResponse {
  chest: { id: string };
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
