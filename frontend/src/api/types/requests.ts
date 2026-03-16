/**
 * API request types - single source of truth for request payloads
 */

import type { MessageType, MessageVisibility, MarkerColor } from "@/types";

export interface GetNearbyMessagesParams {
  lat: number;
  lng: number;
  alt?: number;
  userId?: string;
}

export interface CreateMessageRequest {
  type?: MessageType;
  content: string;
  mediaUrl?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  visibility: MessageVisibility;
  allowedUserIds?: string[];
  category?: string;
  createdBy?: string;
  markerColor?: MarkerColor;
}

export interface GetMessageParams {
  id: string;
  lat: number;
  lng: number;
  userId?: string;
}

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

export interface UpdateMessageRequest {
  content?: string;
  visibility?: MessageVisibility;
  allowedUserIds?: string[];
  category?: string;
  markerColor?: import("@/types").MarkerColor;
}

export interface SeedNearbyRequest {
  lat: number;
  lng: number;
}

export interface SearchUsersParams {
  q: string;
  limit?: number;
}

export interface GetMapViewportParams {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  userId?: string;
  userLat?: number;
  userLng?: number;
}

export interface GetMapNearbyParams {
  lat: number;
  lng: number;
  userId?: string;
}
