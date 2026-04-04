/**
 * Hook to update a message
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMessage } from "./messages.service";
import type { UpdateMessageRequest } from "./types/requests";
import {
  replaceById,
  rollbackSnapshot,
  snapshotQueries,
} from "../optimisticUtils";
import type {
  GetMapViewportResponse,
  GetMyItemsResponse,
} from "@/api/types/responses";

export function useUpdateMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageRequest }) =>
      updateMessage(id, data),
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
