/**
 * My Items service response types
 */

import type { CreatedMessageItem } from "@/services/messagesService/types/response";
import type {
  CreatedChestItem,
  FoundChestItem,
} from "@/services/chestsService/types/response";

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
