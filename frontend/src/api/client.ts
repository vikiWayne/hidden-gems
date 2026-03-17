/**
 * API client - typed, validated API functions using axios
 */

import { apiClient } from "./axios";
import type {
  GetNearbyMessagesParams,
  CreateMessageRequest,
  GetMessageParams,
  GetNearbyChestsParams,
  CreateChestRequest,
  UpdateMessageRequest,
  SeedNearbyRequest,
  SearchUsersParams,
  GetMapViewportParams,
  GetMapNearbyParams,
} from "./types/requests";
import type { GetMyItemsResponse } from "./types/responses";
import {
  getNearbyMessagesResponseSchema,
  createMessageResponseSchema,
  getNearbyChestsResponseSchema,
  createChestResponseSchema,
  getLeaderboardResponseSchema,
  seedNearbyResponseSchema,
  searchUsersResponseSchema,
  getMapViewportResponseSchema,
} from "./validators";

export type {
  NearbyChest,
  NearbyLootItem,
  LeaderboardEntry,
  SearchUser,
} from "./types/responses";

function buildQuery(params: Record<string, string | number | undefined>): string {
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
      })}`
    );
    return getNearbyMessagesResponseSchema.parse(data);
  },

  createMessage: async (body: CreateMessageRequest) => {
    const { data } = await apiClient.post("/messages", body);
    return createMessageResponseSchema.parse(data);
  },

  getMessage: async (params: GetMessageParams) => {
    const { data } = await apiClient.get(
      `/messages/${params.id}${buildQuery({
        lat: params.lat,
        lng: params.lng,
        userId: params.userId,
      })}`
    );
    return data as { message: unknown; unlocked: boolean };
  },

  getNearbyChests: async (params: GetNearbyChestsParams) => {
    const { data } = await apiClient.get(
      `/chests/nearby${buildQuery({
        lat: params.lat,
        lng: params.lng,
        userId: params.userId,
      })}`
    );
    return getNearbyChestsResponseSchema.parse(data);
  },

  createChest: async (body: CreateChestRequest) => {
    const { data } = await apiClient.post("/chests", body);
    return createChestResponseSchema.parse(data);
  },

  getLeaderboard: async () => {
    const { data } = await apiClient.get("/leaderboard");
    return getLeaderboardResponseSchema.parse(data);
  },

  seedNearby: async (body: SeedNearbyRequest) => {
    const { data } = await apiClient.post("/seed", body);
    return seedNearbyResponseSchema.parse(data);
  },

  updateMessage: async (id: string, body: UpdateMessageRequest) => {
    const { data } = await apiClient.patch(`/messages/${id}`, body);
    return data as { message: unknown };
  },

  deleteMessage: async (id: string, userId: string) => {
    await apiClient.delete(`/messages/${id}${buildQuery({ userId })}`);
  },

  deleteChest: async (id: string, userId: string) => {
    await apiClient.delete(`/chests/${id}${buildQuery({ userId })}`);
  },

  claimChest: async (id: string, userId: string) => {
    const { data } = await apiClient.post(`/chests/${id}/claim`, { userId });
    return data as { ok: boolean; finderOrdinal: number };
  },

  getMyItems: async (userId: string) => {
    const { data } = await apiClient.get(`/users/me/items${buildQuery({ userId })}`);
    return data as GetMyItemsResponse;
  },

  searchUsers: async (params: SearchUsersParams) => {
    const { data } = await apiClient.get(
      `/users/search${buildQuery({
        q: params.q,
        limit: params.limit ?? 5,
      })}`
    );
    return searchUsersResponseSchema.parse(data);
  },

  getMapNearby: async (params: GetMapNearbyParams) => {
    const { data } = await apiClient.get(
      `/map/nearby${buildQuery({
        lat: params.lat,
        lng: params.lng,
        userId: params.userId,
        filter: params.filter,
      })}`
    );
    return getMapViewportResponseSchema.parse(data);
  },

  getMapViewport: async (params: GetMapViewportParams) => {
    const { data } = await apiClient.get(
      `/map/viewport${buildQuery({
        minLat: params.minLat,
        maxLat: params.maxLat,
        minLng: params.minLng,
        maxLng: params.maxLng,
        userId: params.userId,
        userLat: params.userLat,
        userLng: params.userLng,
        filter: params.filter,
      })}`
    );
    return getMapViewportResponseSchema.parse(data);
  },

  getMapConfig: async () => {
    const { data } = await apiClient.get("/map/config");
    return data as {
      penalty: { xpDrop: number; coinDrop: number };
      lootItems: Record<string, { label: string; icon: string; xpReward: number; coinReward: number; isPenalty: boolean }>;
      geo: { NEARBY_RADIUS_M: number; UNLOCK_DISTANCE_M: number; CHEST_HUNTER_RADIUS_M: number };
    };
  },
};
