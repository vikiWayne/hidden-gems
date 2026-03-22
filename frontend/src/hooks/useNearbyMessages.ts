import { api } from "@/api/client";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallback, useEffect, useRef } from "react";
import {
  NEAR_DISTANCE_M,
  POLL_INTERVAL_MS,
  UNLOCK_DISTANCE_M,
} from "./useLocation";

export function useNearbyMessages() {
  const {
    userLocation,
    setNearbyMessages,
    setSelectedMessage,
    setProximityState,
    selectedMessage,
  } = useAppStore();
  const { userId } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNearby = useCallback(async () => {
    if (!userLocation || !userId) return;

    try {
      const { messages } = await api.getNearbyMessages({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        alt: userLocation.altitude,
        userId,
      });
      setNearbyMessages(messages);

      const closest = messages[0];
      if (!closest) {
        setSelectedMessage(null);
        setProximityState("far");
        return;
      }

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
    } catch {
      setNearbyMessages([]);
    }
  }, [
    userLocation,
    userId,
    setNearbyMessages,
    setSelectedMessage,
    setProximityState,
  ]);

  useEffect(() => {
    if (!userLocation) return;

    fetchNearby();
    intervalRef.current = setInterval(fetchNearby, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userLocation, fetchNearby]);

  return { selectedMessage };
}
