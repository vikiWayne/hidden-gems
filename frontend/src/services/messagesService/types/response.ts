/**
 * Messages service response types
 */

import type { NearbyMessage } from "@/types";

export interface GetNearbyMessagesResponse {
  messages: NearbyMessage[];
}

export interface CreateMessageResponse {
  message: { id: string };
}

export interface GetMessageResponse {
  message: unknown;
  unlocked: boolean;
}

export interface UpdateMessageResponse {
  message: unknown;
}

export interface CreatedMessageItem {
  id: string;
  type: "text" | "voice" | "image" | "video";
  content: string;
  mediaUrl?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  visibility: "public" | "private";
  allowedUserIds: string[];
  category?: string;
  markerColor?: string;
  createdBy?: string;
  createdAt: string;
}
