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
      const filtered = chests;
      return {
        nearbyChests: chests,
        chestHunterMode:
          filtered.filter(c => !state.claimedChestIds?.includes(c.id)).length > 0 &&
          (filtered.filter(c => !state.claimedChestIds?.includes(c.id))[0]?.distance ?? Infinity) <= CHEST_HUNTER_RADIUS_M,
      };
    }),
  setNearbyLootItems: (items) => set({ nearbyLootItems: items }),
  claimChest: (id) =>
    set((s) => ({
      claimedChestIds: [...(s.claimedChestIds || []), id],
    })),
}));
