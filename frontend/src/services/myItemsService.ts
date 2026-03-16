/**
 * My Items service - created + found items
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "./queryKeys";

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
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myItems(userId) });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useDeleteChestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      api.deleteChest(id, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myItems(userId) });
      queryClient.invalidateQueries({ queryKey: ["chests"] });
    },
  });
}
