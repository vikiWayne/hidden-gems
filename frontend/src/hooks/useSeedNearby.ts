import { useEffect, useRef } from 'react'
import { api } from '@/api/client'

/** Seeds random messages and chests near user location once per session */
export function useSeedNearby(userLocation: { latitude: number; longitude: number } | null) {
  const hasSeededRef = useRef(false)

  useEffect(() => {
    if (!userLocation || hasSeededRef.current) return

    hasSeededRef.current = true
    api
      .seedNearby({ lat: userLocation.latitude, lng: userLocation.longitude })
      .catch(() => {})
  }, [userLocation])
}
