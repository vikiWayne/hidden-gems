/**
 * Messages service request types
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

export interface UpdateMessageRequest {
  content?: string;
  visibility?: MessageVisibility;
  allowedUserIds?: string[];
  category?: string;
  markerColor?: MarkerColor;
}
