import { useEffect } from "react";
import { useGetMapConfig } from "@/services/mapService";
import { useRuntimeConfigStore } from "@/store/useRuntimeConfigStore";

export function useSyncMapConfig() {
  const { data } = useGetMapConfig();
  const setMapConfig = useRuntimeConfigStore((s) => s.setMapConfig); // what is it ?

  useEffect(() => {
    if (!data?.data) return;
    setMapConfig({
      geo: data.data.geo,
      penalty: data.data.penalty,
    });
  }, [data, setMapConfig]);
}
