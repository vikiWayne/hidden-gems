import type { APISuccessResponse } from "@/api/types/common";

export type MapConfigResponse = APISuccessResponse<{
  penalty: { xpDrop: number; coinDrop: number };
  lootItems: Record<
    string,
    {
      label: string;
      icon: string;
      xpReward: number;
      coinReward: number;
      isPenalty: boolean;
    }
  >;
  geo: {
    NEARBY_RADIUS_M: number;
    UNLOCK_DISTANCE_M: number;
    CHEST_HUNTER_RADIUS_M: number;
  };
}>;
