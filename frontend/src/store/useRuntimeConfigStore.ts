import { create } from "zustand";
import { DEFAULT_PENALTY_CONFIG } from "@/config/mapItems";

export interface GeoRuntimeConfig {
  NEARBY_RADIUS_M: number;
  UNLOCK_DISTANCE_M: number;
  CHEST_HUNTER_RADIUS_M: number;
}

interface RuntimeConfigState {
  geo: GeoRuntimeConfig;
  penalty: {
    xpDrop: number;
    coinDrop: number;
  };
  setMapConfig: (config: {
    geo: GeoRuntimeConfig;
    penalty: { xpDrop: number; coinDrop: number };
  }) => void;
}

const DEFAULT_GEO: GeoRuntimeConfig = {
  NEARBY_RADIUS_M: 2000,
  UNLOCK_DISTANCE_M: 100,
  CHEST_HUNTER_RADIUS_M: 200,
};

export const useRuntimeConfigStore = create<RuntimeConfigState>((set) => ({
  geo: DEFAULT_GEO,
  penalty: DEFAULT_PENALTY_CONFIG,
  setMapConfig: (config) =>
    set({
      geo: {
        NEARBY_RADIUS_M: Number(config.geo.NEARBY_RADIUS_M) || DEFAULT_GEO.NEARBY_RADIUS_M,
        UNLOCK_DISTANCE_M: Number(config.geo.UNLOCK_DISTANCE_M) || DEFAULT_GEO.UNLOCK_DISTANCE_M,
        CHEST_HUNTER_RADIUS_M:
          Number(config.geo.CHEST_HUNTER_RADIUS_M) || DEFAULT_GEO.CHEST_HUNTER_RADIUS_M,
      },
      penalty: {
        xpDrop: Number(config.penalty.xpDrop) || DEFAULT_PENALTY_CONFIG.xpDrop,
        coinDrop: Number(config.penalty.coinDrop) || DEFAULT_PENALTY_CONFIG.coinDrop,
      },
    }),
}));

