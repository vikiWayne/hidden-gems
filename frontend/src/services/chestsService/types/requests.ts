/**
 * Chests service request types
 */

export interface GetNearbyChestsParams {
  lat: number;
  lng: number;
  userId?: string;
}

export interface CreateChestRequest {
  content: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  xpReward?: number;
  createdBy?: string;
}
