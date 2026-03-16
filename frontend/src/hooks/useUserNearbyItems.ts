import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useGameStore } from "@/store/useGameStore";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/api/client";
import { UNLOCK_DISTANCE_M, NEAR_DISTANCE_M, POLL_INTERVAL_MS } from "./useLocation";

/**
 * Fetches items near the user's current position. Drives proximity, theme (chest hunter),
 * and nearby list. UI stays stable when user pans the map - only user location changes update this.
 */
export function useUserNearbyItems() {
  const { userLocation, setNearbyMessages, setSelectedMessage, setProximityState } =
    useAppStore();
  const { setNearbyChests, setNearbyLootItems } = useGameStore();
  const { userId } = useUserStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNearby = useCallback(async () => {
    if (!userLocation) return;

    try {
      const { messages, chests, lootItems } = await api.getMapNearby({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        userId,
      });
 // todo - check this items are already sorted by distance, if not sort them
      setNearbyMessages(messages);
      setNearbyChests(chests);
      setNearbyLootItems(lootItems);

      const closest = messages[0];
      if (!closest) {
        setSelectedMessage(null);
        setProximityState("far");
      } else {
        const dist = closest.distance ?? Infinity;
        if (dist <= UNLOCK_DISTANCE_M) {
          setProximityState("unlocked");
          setSelectedMessage(closest);
        } else if (dist <= NEAR_DISTANCE_M) {
          setProximityState("near");
          setSelectedMessage(closest);
        } else {
          setProximityState("far");
          setSelectedMessage(closest);
        }
      }
    } catch {
      setNearbyMessages([]);
      setNearbyChests([]);
      setNearbyLootItems([]);
      setSelectedMessage(null);
      setProximityState("far");
    }
  }, [
    userLocation,
    userId,
    setNearbyMessages,
    setNearbyChests,
    setNearbyLootItems,
    setSelectedMessage,
    setProximityState,
  ]);

  useEffect(() => {
    if (!userLocation) return;

    fetchNearby();
    intervalRef.current = setInterval(fetchNearby, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userLocation, fetchNearby]);
}
