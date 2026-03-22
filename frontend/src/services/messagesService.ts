/**
 * Messages service - TanStack Query mutations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type {
  CreateMessageRequest,
  UpdateMessageRequest,
} from "@/api/types/requests";
import type { NearbyMessage } from "@/types";
import {
  prependItem,
  replaceById,
  rollbackSnapshot,
  snapshotQueries,
} from "./optimisticUtils";
import type {
  GetMapViewportResponse,
  GetMyItemsResponse,
} from "@/api/types/responses";

export function useCreateMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMessageRequest) => api.createMessage(data),
    onMutate: async (data) => {
      const tempId = `temp-message-${Date.now()}`;
      const optimisticMessage: NearbyMessage = {
        id: tempId,
        type: data.type ?? "text",
        content: data.content,
        mediaUrl: data.mediaUrl,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
        },
        visibility: data.visibility,
        allowedUserIds: data.allowedUserIds ?? [],
        category: data.category,
        createdBy: data.createdBy,
        createdAt: new Date().toISOString(),
        distance: 0,
        isOwn: true,
        markerColor: data.markerColor,
      };

      const snapshot = await snapshotQueries(queryClient, [
        ["messages"],
        ["map"],
        ["users", "me", "items"],
      ]);

      queryClient.setQueriesData(
        { queryKey: ["map"] },
        (prev: GetMapViewportResponse | undefined) =>
          prev
            ? {
                ...prev,
                messages: prependItem(prev.messages, optimisticMessage),
              }
            : prev,
      );

      queryClient.setQueriesData(
        { queryKey: ["users", "me", "items"] },
        (prev: GetMyItemsResponse | undefined) =>
          prev
            ? {
                ...prev,
                createdMessages: prependItem(prev.createdMessages, {
                  id: tempId,
                  type: optimisticMessage.type ?? "text",
                  content: optimisticMessage.content,
                  mediaUrl: optimisticMessage.mediaUrl,
                  latitude: optimisticMessage.location.latitude,
                  longitude: optimisticMessage.location.longitude,
                  altitude: optimisticMessage.location.altitude,
                  visibility: optimisticMessage.visibility,
                  allowedUserIds: optimisticMessage.allowedUserIds ?? [],
                  category: optimisticMessage.category,
                  markerColor: optimisticMessage.markerColor,
                  createdBy: optimisticMessage.createdBy,
                  createdAt: optimisticMessage.createdAt,
                }),
              }
            : prev,
      );

      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      rollbackSnapshot(queryClient, context?.snapshot);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["map"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me", "items"] });
    },
  });
}

export function useUpdateMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageRequest }) =>
      api.updateMessage(id, data),
    onMutate: async ({ id, data }) => {
      const snapshot = await snapshotQueries(queryClient, [
        ["messages"],
        ["map"],
        ["users", "me", "items"],
      ]);

      queryClient.setQueriesData(
        { queryKey: ["map"] },
        (prev: GetMapViewportResponse | undefined) =>
          prev
            ? {
                ...prev,
                messages:
                  replaceById(prev.messages, id, (message) => ({
                    ...message,
                    content: data.content ?? message.content,
                    visibility: data.visibility ?? message.visibility,
                    allowedUserIds:
                      data.allowedUserIds ?? message.allowedUserIds,
                    category: data.category ?? message.category,
                    markerColor: data.markerColor ?? message.markerColor,
                  })) ?? prev.messages,
              }
            : prev,
      );

      queryClient.setQueriesData(
        { queryKey: ["users", "me", "items"] },
        (prev: GetMyItemsResponse | undefined) =>
          prev
            ? {
                ...prev,
                createdMessages:
                  replaceById(prev.createdMessages, id, (message) => ({
                    ...message,
                    content: data.content ?? message.content,
                    visibility: data.visibility ?? message.visibility,
                    allowedUserIds:
                      data.allowedUserIds ?? message.allowedUserIds,
                    category: data.category ?? message.category,
                    markerColor: data.markerColor ?? message.markerColor,
                  })) ?? prev.createdMessages,
              }
            : prev,
      );

      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      rollbackSnapshot(queryClient, context?.snapshot);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["map"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me", "items"] });
    },
  });
}
