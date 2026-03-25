/**
 * TanStack Query keys - centralized for consistent cache invalidation
 */

export const queryKeys = {
  leaderboard: ["leaderboard"] as const,
  mapConfig: ["map", "config"] as const,
  searchUsers: (q: string) => ["users", "search", q] as const,
  nearbyMessages: (lat: number, lng: number, userId?: string) =>
    ["messages", "nearby", lat, lng, userId] as const,
  nearbyChests: (lat: number, lng: number, userId?: string) =>
    ["chests", "nearby", lat, lng, userId] as const,
  myItems: (userId: string) => ["users", "me", "items", userId] as const,
};
