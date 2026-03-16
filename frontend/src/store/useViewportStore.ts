import { create } from "zustand";
import type { NearbyMessage } from "@/types";
import type { NearbyChest, NearbyLootItem } from "@/api/client";

export interface ViewportBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface ViewportState {
  viewportBounds: ViewportBounds | null;
  viewportMessages: NearbyMessage[];
  viewportChests: NearbyChest[];
  viewportLootItems: NearbyLootItem[];
  isLoading: boolean;
  setViewportBounds: (bounds: ViewportBounds | null) => void;
  setViewportData: (data: {
    messages: NearbyMessage[];
    chests: NearbyChest[];
    lootItems: NearbyLootItem[];
  }) => void;
  setViewportLoading: (loading: boolean) => void;
}

const BOUNDS_EPSILON = 1e-5;

function boundsEqual(
  a: ViewportBounds | null,
  b: ViewportBounds | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.minLat - b.minLat) < BOUNDS_EPSILON &&
    Math.abs(a.maxLat - b.maxLat) < BOUNDS_EPSILON &&
    Math.abs(a.minLng - b.minLng) < BOUNDS_EPSILON &&
    Math.abs(a.maxLng - b.maxLng) < BOUNDS_EPSILON
  );
}

export const useViewportStore = create<ViewportState>((set, get) => ({
  viewportBounds: null,
  viewportMessages: [],
  viewportChests: [],
  viewportLootItems: [],
  isLoading: false,
  setViewportBounds: (bounds) => {
    if (boundsEqual(get().viewportBounds, bounds)) return;
    set({ viewportBounds: bounds });
  },
  setViewportData: ({ messages, chests, lootItems }) =>
    set({ viewportMessages: messages, viewportChests: chests, viewportLootItems: lootItems }),
  setViewportLoading: (loading) => set({ isLoading: loading }),
}));
