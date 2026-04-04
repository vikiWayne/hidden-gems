/**
 * API client - typed, validated API functions using axios
 */

import { apiClient } from "./axios";
// import type { APISuccessResponse } from "./types/common";
import type {
  GetNearbyMessagesParams,
  GetNearbyChestsParams,
  SeedNearbyRequest,
  GetMapNearbyParams,
} from "./types/requests";

import {
  getNearbyMessagesResponseSchema,
  getNearbyChestsResponseSchema,
  seedNearbyResponseSchema,
  getMapViewportResponseSchema,
} from "./validators";

export type { NearbyChest, NearbyLootItem } from "./types/responses";

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export const api = {
  getNearbyMessages: async (params: GetNearbyMessagesParams) => {
    const { data } = await apiClient.get(
      `/messages/nearby${buildQuery({
        lat: params.lat,
        lng: params.lng,
        alt: params.alt,
        userId: params.userId,
      })}`,
    );
    return getNearbyMessagesResponseSchema.parse(data);
  },

  getNearbyChests: async (params: GetNearbyChestsParams) => {
    const { data } = await apiClient.get(
      `/chests/nearby${buildQuery({
        lat: params.lat,
        lng: params.lng,
        userId: params.userId,
      })}`,
    );
    return getNearbyChestsResponseSchema.parse(data);
  },

  seedNearby: async (body: SeedNearbyRequest) => {
    const { data } = await apiClient.post("/seed", body);
    return seedNearbyResponseSchema.parse(data);
  },

  getMapNearby: async (params: GetMapNearbyParams) => {
    const { data } = await apiClient.get(
      `/map/nearby${buildQuery({
        lat: params.lat,
        lng: params.lng,
        userId: params.userId,
        filter: params.filter,
      })}`,
    );
    return getMapViewportResponseSchema.parse(data);
  },

  // Alias for backward compatibility
  getMapViewport: async (params: GetMapNearbyParams) => {
    return api.getMapNearby(params);
  },

  // getMapViewport: async (params: GetMapViewportParams) => {
  //   const { data } = await apiClient.get(
  //     `/map/viewport${buildQuery({
  //       minLat: params.minLat,
  //       maxLat: params.maxLat,
  //       minLng: params.minLng,
  //       maxLng: params.maxLng,
  //       userId: params.userId,
  //       userLat: params.userLat,
  //       userLng: params.userLng,
  //       filter: params.filter,
  //     })}`,
  //   );
  //   return getMapViewportResponseSchema.parse(data);
  // },

  // getMapConfig: async () => {
  //   const { data } = await apiClient.get("/map/config");
  //   return data as {
  //     status: "success";
  //     data: {
  //       penalty: { xpDrop: number; coinDrop: number };
  //       lootItems: Record<
  //         string,
  //         {
  //           label: string;
  //           icon: string;
  //           xpReward: number;
  //           coinReward: number;
  //           isPenalty: boolean;
  //         }
  //       >;
  //       geo: {
  //         NEARBY_RADIUS_M: number;
  //         UNLOCK_DISTANCE_M: number;
  //         CHEST_HUNTER_RADIUS_M: number;
  //       };
  //     };
  //   };
  // },

  // Auth API methods

  register: async (username: string, password: string, fullName: string) => {
    const { data } = await apiClient.post("/auth/register", {
      username,
      password,
      fullName,
    });
    return data as {
      userId: string;
      token: string;
      user: { userId: string; username: string; fullName: string };
    };
  },

  login: async (username: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", {
      username,
      password,
    });
    return data as {
      userId: string;
      token: string;
      user: { userId: string; username: string; fullName: string };
    };
  },

  getCurrentUser: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data as { userId: string; username: string; fullName: string };
  },

  checkUsernameAvailable: async (username: string) => {
    const { data } = await apiClient.get(
      `/auth/check-username?username=${encodeURIComponent(username)}`,
    );
    return data as { available: boolean };
  },
};
