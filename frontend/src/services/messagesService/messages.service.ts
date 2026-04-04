/**
 * Messages service - API calls
 */

import { requests } from "@/api";
import type {
  GetNearbyMessagesParams,
  CreateMessageRequest,
  UpdateMessageRequest,
  GetMessageParams,
} from "./types/requests";

export const getNearbyMessages = (params: GetNearbyMessagesParams) => {
  return requests.get("/messages/nearby", { params });
};

export const createMessage = (data: CreateMessageRequest) => {
  return requests.post("/messages", data);
};

export const getMessage = (params: GetMessageParams) => {
  return requests.get(`/messages/${params.id}`, { params });
};

export const updateMessage = (id: string, data: UpdateMessageRequest) => {
  return requests.patch(`/messages/${id}`, data);
};

export const deleteMessage = (id: string, userId: string) => {
  return requests.delete(`/messages/${id}`, { params: { userId } });
};
