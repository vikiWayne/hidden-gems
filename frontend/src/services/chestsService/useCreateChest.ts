/**
 * Hook to create a chest
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createChest } from "./chests.service";
import type { CreateChestRequest } from "./types/requests";
import { prependItem, rollbackSnapshot, snapshotQueries } from "../optimisticUtils";
import type { GetMapViewportResponse, GetMyItemsResponse } from "@/api/types/responses";

export function useCreateChestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChestRequest) => createChest(data),
    onMutate: async (data) => {
      const snapshot = await snapshotQueries(queryClient, [
        ["chests"],
        ["map"],
        ["users", "me", "items"],
      ]);
      const tempId = `temp-chest-${Date.now()}`;
      const createdAt = new Date().toISOString();

      queryClient.setQueriesData(
        { queryKey: ["map"] },
        (prev: GetMapViewportResponse | undefined) =>
          prev
            ? {
              ...prev,
              chests: prependItem(prev.chests, {
                id: tempId,
                content: data.content,
                location: {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  altitude: data.altitude,
                },
                distance: 0,
                xpReward: data.xpReward ?? 25,
                createdBy: data.createdBy,
                createdAt,
                isOwn: true,
              }),
            }
            : prev
      );

      queryClient.setQueriesData(
        { queryKey: ["users", "me", "items"] },
        (prev: GetMyItemsResponse | undefined) =>
          prev
            ? {
              ...prev,
              createdChests: prependItem(prev.createdChests, {
                id: tempId,
                content: data.content,
                latitude: data.latitude,
                longitude: data.longitude,
                altitude: data.altitude,
                xpReward: data.xpReward ?? 25,
                createdBy: data.createdBy,
                createdAt,
              }),
            }
            : prev
      );

      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      rollbackSnapshot(queryClient, context?.snapshot);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chests"] });
      queryClient.invalidateQueries({ queryKey: ["map"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me", "items"] });
    },
  });
}
