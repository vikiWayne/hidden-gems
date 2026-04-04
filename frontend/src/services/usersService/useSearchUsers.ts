/**
 * Hook to search users
 */

import { useGETRequest, type QueryOptions } from "@/hooks/useGETRequest";
import { queryKeys } from "../queryKeys";
import { searchUsers } from "./users.service";
import type { APIResponseHandler } from "@/api/types/common";
import type { SearchUsersResponse } from "./types/response";

export const useSearchUsers = (
  query: string,
  enabled = true,
  handler?: APIResponseHandler<SearchUsersResponse>,
  queryOptions?: QueryOptions<SearchUsersResponse>,
) => {
  return useGETRequest({
    queryKey: queryKeys.searchUsers(query),
    queryFn: () => searchUsers({ q: query, limit: 10 }),
    queryOptions: { ...queryOptions, staleTime: 30 * 1000, enabled: enabled && query.length > 0 },
    handler,
  });
};
