/**
 * Hook to fetch leaderboard data
 */

import { useGETRequest, type QueryOptions } from "@/hooks/useGETRequest";
import { queryKeys } from "../queryKeys";
import { getLeaderboard } from "./leaderboard.service";
import type { APIResponseHandler } from "@/api/types/common";
import type { LeaderBoardResponse } from "./types/response";

export const useGetLeaderboard = (
  handler?: APIResponseHandler<LeaderBoardResponse>,
  queryOptions?: QueryOptions<LeaderBoardResponse>,
) => {
  return useGETRequest({
    queryKey: queryKeys.leaderboard,
    queryFn: getLeaderboard,
    queryOptions: { ...queryOptions, staleTime: 60 * 1000 },
    handler,
  });
};
