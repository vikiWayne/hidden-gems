import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export function useMapConfigQuery() {
  return useQuery({
    queryKey: ["map", "config"],
    queryFn: api.getMapConfig,
    staleTime: 5 * 60 * 1000,
  });
}

