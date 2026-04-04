/**
 * Hook to delete a chest
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChest } from "./chests.service";
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

export function useDeleteChestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteChest(id, userId),
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
