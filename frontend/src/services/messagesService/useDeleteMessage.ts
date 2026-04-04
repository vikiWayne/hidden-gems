/**
 * Hook to delete a message
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMessage } from "./messages.service";
import {
  removeById,
  rollbackSnapshot,
  snapshotQueries,
} from "../optimisticUtils";
import type {
  GetMapViewportResponse,
  GetMyItemsResponse,
} from "@/api/types/responses";
import { queryKeys } from "../queryKeys";

export function useDeleteMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteMessage(id, userId),
    onMutate: async ({ id, userId }) => {
      const keys = [queryKeys.myItems(userId), ["messages"], ["map"]] as const;
      const snapshot = await snapshotQueries(queryClient, [...keys]);

      queryClient.setQueryData(queryKeys.myItems(userId), (prev: GetMyItemsResponse | undefined) =>
        prev
          ? {
              ...prev,
              createdMessages: removeById(prev.createdMessages, id) ?? prev.createdMessages,
            }
          : prev
      );

      queryClient.setQueriesData(
        { queryKey: ["map"] },
        (prev: GetMapViewportResponse | undefined) =>
          prev
            ? {
              ...prev,
              messages: removeById(prev.messages, id) ?? prev.messages,
            }
            : prev
      );

      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      rollbackSnapshot(queryClient, context?.snapshot);
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myItems(userId) });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["map"] });
    },
  });
}
