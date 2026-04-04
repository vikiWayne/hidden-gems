/**
 * Hook to fetch my items (created and found)
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { getMyItems } from "./myItems.service";
import type { GetMyItemsResponse } from "./types/response";

export function useMyItemsQuery(userId: string | undefined) {
  return useQuery<GetMyItemsResponse>({
    queryKey: queryKeys.myItems(userId ?? ""),
    queryFn: () => getMyItems(userId!),
    enabled: !!userId,
  });
}
