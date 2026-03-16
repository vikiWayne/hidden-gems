/**
 * Leaderboard service - TanStack Query hooks
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "./queryKeys";

export function useLeaderboardQuery() {
  return useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: () => api.getLeaderboard(),
    staleTime: 60 * 1000,
  });
}
