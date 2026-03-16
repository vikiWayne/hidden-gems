/**
 * Haversine formula - calculates distance between two points on Earth in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Check if a point (lat, lng) is inside a bounding box.
 * Bounding box: minLat <= lat <= maxLat, minLng <= lng <= maxLng
 */
export function isInBoundingBox(
  lat: number,
  lng: number,
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): boolean {
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
}

/**
 * Compute bounding box from center point and radius in meters.
 * Approximate: 1 deg lat ≈ 111.32 km, 1 deg lng ≈ 111.32 * cos(lat) km
 */
export function boundsFromCenterAndRadius(
  centerLat: number,
  centerLng: number,
  radiusM: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusM / 111320
  const lngDelta = radiusM / (111320 * Math.cos((centerLat * Math.PI) / 180))
  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLng: centerLng - lngDelta,
    maxLng: centerLng + lngDelta,
  }
}
