/**
 * Chests service - TanStack Query mutations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { CreateChestRequest } from "@/api/types/requests";

export function useCreateChestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChestRequest) => api.createChest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chests"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me", "items"] });
    },
  });
}
