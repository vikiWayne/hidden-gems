/**
 * Chests service - API calls
 */

import { requests } from "@/api";
import type { GetNearbyChestsParams, CreateChestRequest } from "./types/requests";

export const getNearbyChests = (params: GetNearbyChestsParams) => {
  return requests.get("/chests/nearby", { params });
};

export const createChest = (data: CreateChestRequest) => {
  return requests.post("/chests", data);
};

export const deleteChest = (id: string, userId: string) => {
  return requests.delete(`/chests/${id}`, { params: { userId } });
};

export const claimChest = (id: string, userId: string) => {
  return requests.post(`/chests/${id}/claim`, { userId });
};
