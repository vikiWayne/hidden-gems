import { useEffect } from "react";
import { useMapConfigQuery } from "@/services/mapConfigService";
import { useRuntimeConfigStore } from "@/store/useRuntimeConfigStore";

export function useSyncMapConfig() {
  const { data } = useMapConfigQuery();
  const setMapConfig = useRuntimeConfigStore((s) => s.setMapConfig); // what is it ?

  useEffect(() => {
    if (!data?.data) return;
    setMapConfig({
      geo: data?.data.geo,
      penalty: data?.data.penalty,
    });
  }, [data, setMapConfig]);
}
