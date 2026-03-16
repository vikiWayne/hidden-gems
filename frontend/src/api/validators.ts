/**
 * Zod schemas for API request/response validation
 */

import { z } from "zod";

export const nearbyMessageSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "voice", "image", "video"]).optional(),
  content: z.string(),
  mediaUrl: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number().optional(),
  }),
  visibility: z.enum(["public", "private"]),
  allowedUserIds: z.array(z.string()).optional(),
  category: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
  distance: z.number(),
  isOwn: z.boolean().optional(),
  markerColor: z.enum(["purple", "orange", "green", "gold", "teal", "blue", "red", "pink"]).optional(),
});

export const nearbyChestSchema = z.object({
  id: z.string(),
  content: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number().optional(),
  }),
  distance: z.number(),
  xpReward: z.number(),
  coinReward: z.number().optional(),
  variant: z.enum(["normal", "snake"]).optional(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
  isOwn: z.boolean().optional(),
});

export const lootItemTypeSchema = z.enum([
  "avatar",
  "diamond",
  "cash_chest",
  "loot_box",
  "surprise",
  "powerup",
  "bomb",
  "snake",
]);

export const nearbyLootItemSchema = z.object({
  id: z.string(),
  type: lootItemTypeSchema,
  content: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number().optional(),
  }),
  distance: z.number(),
  xpReward: z.number(),
  coinReward: z.number(),
  isPenalty: z.boolean().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
  isOwn: z.boolean().optional(),
});

export const getMapViewportResponseSchema = z.object({
  messages: z.array(nearbyMessageSchema),
  chests: z.array(nearbyChestSchema),
  lootItems: z.array(nearbyLootItemSchema),
});

export const leaderboardEntrySchema = z.object({
  rank: z.number(),
  username: z.string(),
  xp: z.number(),
  discovered: z.number(),
  chestsFound: z.number(),
});

export const searchUserSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export const getNearbyMessagesResponseSchema = z.object({
  messages: z.array(nearbyMessageSchema),
});

export const createMessageResponseSchema = z.object({
  message: z.object({ id: z.string() }),
});

export const getNearbyChestsResponseSchema = z.object({
  chests: z.array(nearbyChestSchema),
});

export const createChestResponseSchema = z.object({
  chest: z.object({ id: z.string() }),
});

export const getLeaderboardResponseSchema = z.object({
  leaderboard: z.array(leaderboardEntrySchema),
});

export const seedNearbyResponseSchema = z.object({
  ok: z.boolean(),
  messages: z.number(),
  chests: z.number(),
  lootItems: z.number().optional(),
});

export const searchUsersResponseSchema = z.object({
  users: z.array(searchUserSchema),
});
