/**
 * Haversine formula - calculates distance between two points on Earth in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Earth's radius in meters
  const R = 6371000;

  // Distance between latitudes and longitudes in radians
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  // Convert latitudes to radians
  const rLat1 = degToRad(lat1);
  const rLat2 = degToRad(lat2);

  // Haversine formula
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(rLat1) * Math.cos(rLat2);

  // Using asin(sqrt(a)) is more accurate for small distances than atan2(sqrt(a), sqrt(1 - a))
  const c = 2 * Math.asin(Math.sqrt(a));

  return R * c;
}

function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
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
  maxLng: number,
): boolean {
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

/**
 * Compute bounding box from center point and radius in meters.
 * Approximate: 1 deg lat ≈ 111.32 km, 1 deg lng ≈ 111.32 * cos(lat) km
 */
export function boundsFromCenterAndRadius(
  centerLat: number,
  centerLng: number,
  radiusM: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusM / 111320;
  const lngDelta = radiusM / (111320 * Math.cos((centerLat * Math.PI) / 180));
  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLng: centerLng - lngDelta,
    maxLng: centerLng + lngDelta,
  };
}
