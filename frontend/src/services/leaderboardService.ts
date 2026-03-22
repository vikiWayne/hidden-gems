import { api } from "@/api/client";
import { useGETRequest, type QueryOptions } from "@/hooks/useGETRequest";
import { queryKeys } from "./queryKeys";
import type { LeaderBoardResponse } from "@/api/types/responses";
import type { APIResponseHandler } from "@/api/types/common";

export function useGetLeaderboard(
  handler?: APIResponseHandler<LeaderBoardResponse>,
  queryOptions?: QueryOptions<LeaderBoardResponse>,
) {
  return useGETRequest({
    queryKey: queryKeys.leaderboard,
    queryFn: api.getLeaderboard,
    queryOptions: { ...queryOptions, staleTime: 60 * 1000 },
    handler,
  });
}
