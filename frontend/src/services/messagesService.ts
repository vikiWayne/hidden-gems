/**
 * Messages service - TanStack Query mutations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { CreateMessageRequest, UpdateMessageRequest } from "@/api/types/requests";

export function useCreateMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMessageRequest) => api.createMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me", "items"] });
    },
  });
}

export function useUpdateMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageRequest }) =>
      api.updateMessage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me", "items"] });
    },
  });
}
