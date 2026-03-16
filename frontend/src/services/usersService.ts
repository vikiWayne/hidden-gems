/**
 * Users service - TanStack Query hooks for user search
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "./queryKeys";

export function useSearchUsersQuery(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.searchUsers(query),
    queryFn: () => api.searchUsers({ q: query, limit: 10 }),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000,
  });
}
