export interface GetMapViewportParams {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  userId?: string;
  userLat?: number;
  userLng?: number;
  filter?: "all" | "messages" | "chests" | "loot";
}
