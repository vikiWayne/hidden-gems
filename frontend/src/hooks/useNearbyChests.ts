import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useGameStore } from "@/store/useGameStore";
import { api } from "@/api/client";
import { POLL_INTERVAL_MS } from "./useLocation";
import { useAuthStore } from "@/store/useAuthStore";

export function useNearbyChests() {
  const { userLocation } = useAppStore();
  const { setNearbyChests } = useGameStore();
  const { userId } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchChests = useCallback(async () => {
    if (!userLocation || !userId) return;

    try {
      const { chests } = await api.getNearbyChests({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        userId,
      });
      setNearbyChests(chests);
    } catch {
      setNearbyChests([]);
    }
  }, [userLocation, userId, setNearbyChests]);

  useEffect(() => {
    if (!userLocation) return;

    fetchChests();
    intervalRef.current = setInterval(fetchChests, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userLocation, fetchChests]);
}
