import { create } from "zustand";
import type { NearbyChest, NearbyLootItem } from "@/api/client";

const CHEST_HUNTER_RADIUS_M = 200;

interface GameState {
  nearbyChests: NearbyChest[];
  nearbyLootItems: NearbyLootItem[];
  chestHunterMode: boolean;
  claimedChestIds: string[];
  setNearbyChests: (chests: NearbyChest[]) => void;
  setNearbyLootItems: (items: NearbyLootItem[]) => void;
  claimChest: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  nearbyChests: [],
  nearbyLootItems: [],
  chestHunterMode: false,
  claimedChestIds: [],
  setNearbyChests: (chests) =>
    set((state) => {
      const filtered = chests.filter(
        (c) => !state.claimedChestIds.includes(c.id),
      );
      return {
        nearbyChests: filtered,
        chestHunterMode:
          filtered.length > 0 &&
          (filtered[0]?.distance ?? Infinity) <= CHEST_HUNTER_RADIUS_M,
      };
    }),
  setNearbyLootItems: (items) => set({ nearbyLootItems: items }),
  claimChest: (id) =>
    set((s) => ({
      claimedChestIds: [...s.claimedChestIds, id],
      nearbyChests: s.nearbyChests.filter((c) => c.id !== id),
    })),
}));
