/**
 * My Items service - created + found items
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "./queryKeys";
import {
  removeById,
  rollbackSnapshot,
  snapshotQueries,
} from "./optimisticUtils";
import type { GetMapViewportResponse, GetMyItemsResponse } from "@/api/types/responses";

export function useMyItemsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.myItems(userId ?? ""),
    queryFn: () => api.getMyItems(userId!),
    enabled: !!userId,
  });
}

export function useDeleteMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      api.deleteMessage(id, userId),
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

export function useDeleteChestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      api.deleteChest(id, userId),
    onMutate: async ({ id, userId }) => {
      const keys = [queryKeys.myItems(userId), ["chests"], ["map"]] as const;
      const snapshot = await snapshotQueries(queryClient, [...keys]);

      queryClient.setQueryData(queryKeys.myItems(userId), (prev: GetMyItemsResponse | undefined) =>
        prev
          ? {
            ...prev,
            createdChests: removeById(prev.createdChests, id) ?? prev.createdChests,
          }
          : prev
      );

      queryClient.setQueriesData(
        { queryKey: ["map"] },
        (prev: GetMapViewportResponse | undefined) =>
          prev
            ? {
              ...prev,
              chests: removeById(prev.chests, id) ?? prev.chests,
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
      queryClient.invalidateQueries({ queryKey: ["chests"] });
      queryClient.invalidateQueries({ queryKey: ["map"] });
    },
  });
}
