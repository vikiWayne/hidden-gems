import { useGETRequest } from "@/hooks";
import { queryKeys } from "../queryKeys";
import { getMapConfig } from "./map.service";
import type { APIResponseHandler } from "@/api/types/common";
import type { MapConfigResponse } from "./types/response";

export const useGetMapConfig = (
  handler?: APIResponseHandler<MapConfigResponse>,
) => {
  return useGETRequest<MapConfigResponse>({
    queryKey: queryKeys.mapConfig,
    queryFn: getMapConfig,
    queryOptions: { staleTime: 5 * 60 * 1000 },
    handler,
  });
};
