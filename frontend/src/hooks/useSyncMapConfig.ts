import { useEffect } from "react";
import { useMapConfigQuery } from "@/services/mapConfigService";
import { useRuntimeConfigStore } from "@/store/useRuntimeConfigStore";

export function useSyncMapConfig() {
  const { data } = useMapConfigQuery();
  const setMapConfig = useRuntimeConfigStore((s) => s.setMapConfig);

  useEffect(() => {
    if (!data) return;
    setMapConfig({
      geo: data.geo,
      penalty: data.penalty,
    });
  }, [data, setMapConfig]);
}

