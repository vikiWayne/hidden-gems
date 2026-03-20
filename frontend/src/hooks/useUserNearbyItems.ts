import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useGameStore } from "@/store/useGameStore";
import { useUserStore } from "@/store/useUserStore";
import { useRuntimeConfigStore } from "@/store/useRuntimeConfigStore";
import { api } from "@/api/client";

/**
 * Fetches items near the user's current position. Drives proximity, theme (chest hunter),
 * and nearby list. UI stays stable when user pans the map - only user location changes update this.
 */
export function useUserNearbyItems() {
  const { userLocation, setNearbyMessages, setSelectedMessage, setProximityState, mapFilter } =
    useAppStore();
  const { setNearbyChests, setNearbyLootItems } = useGameStore();
  const { userId } = useUserStore();
  const unlockDistance = useRuntimeConfigStore((s) => s.geo.UNLOCK_DISTANCE_M);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNearby = useCallback(async () => {
    if (!userLocation) return;

    try {
      const { messages, chests, lootItems } = await api.getMapNearby({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        userId,
        filter: mapFilter,
      });

      setNearbyMessages(messages);
      setNearbyChests(chests);
      setNearbyLootItems(lootItems);

      const store = useAppStore.getState();

      const unclaimedMessages = messages.filter(
        (m) => !store.claimedMessageIds.includes(m.id) && !store.openedMessageIds.includes(m.id)
      );

      // find the overall closest across unclaimed messages
      const closest = unclaimedMessages[0];
      if (!closest) {
        setSelectedMessage(null);
        setProximityState("far");
      } else {
        const dist = closest.distance ?? Infinity;
        if (dist <= unlockDistance) {
          setProximityState("unlocked");
          setSelectedMessage(closest);
        } else if (dist <= unlockDistance * 2) {
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
    mapFilter,
    setNearbyMessages,
    setNearbyChests,
    setNearbyLootItems,
    setSelectedMessage,
    setProximityState,
    unlockDistance,
  ]);

  useEffect(() => {
    if (!userLocation) return;

    fetchNearby();
    intervalRef.current = setInterval(fetchNearby, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userLocation, fetchNearby]);
}
