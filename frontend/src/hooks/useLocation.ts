import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

const UNLOCK_DISTANCE_M = 100;
const NEAR_DISTANCE_M = 100;
const LOCKED_DISTANCE_M = 500;
const POLL_INTERVAL_MS = 10000;

export function useLocation() {
  const {
    setUserLocation,
    setLocationLoading,
    setLocationError,
    userLocation,
  } = useAppStore();
  const watchIdRef = useRef<number | null>(null);

  const handlePosition = useCallback(
    (pos: GeolocationPosition) => {
      setUserLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        altitude: pos.coords.altitude ?? undefined,
      });
      setLocationError(null);
    },
    [setUserLocation, setLocationError],
  );

  const handleError = useCallback(
    (err: GeolocationPositionError) => {
      setLocationError(err.message || "Location access denied");
      setUserLocation(null);
    },
    [setLocationError, setUserLocation],
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported");
      return;
    }

    try {
      setLocationLoading(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        },
      );
    } catch {
      setLocationError("Failed to get location");
    } finally {
      setLocationLoading(false);
    }

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setLocationLoading(false);
    };
  }, [handlePosition, handleError, setLocationLoading]);

  return { userLocation };
}

export {
  UNLOCK_DISTANCE_M,
  NEAR_DISTANCE_M,
  LOCKED_DISTANCE_M,
  POLL_INTERVAL_MS,
};
