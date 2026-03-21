import {
  createChest,
  deleteChest,
  getNearbyChests,
} from "../db/repositories/chests.repository.js";
import { getDb } from "../db/connection.js";
import { recordChestDiscovery } from "../db/repositories/discoveries.repository.js";
import { ForbiddenError, ValidationError } from "../lib/errors.js";

export const chestsService = {
  getNearby(lat: number, lng: number, userId?: string) {
    return getNearbyChests(lat, lng, userId);
  },
  create(payload: Parameters<typeof createChest>[0]) {
    return createChest(payload);
  },
  claim(id: string, userId: string) {
    const result = recordChestDiscovery(userId, id);
    if (!result)
      throw new ValidationError("Chest not found or already claimed");
    return result;
  },
  remove(id: string, userId: string) {
    const removed = deleteChest(id, userId);
    if (!removed) throw new ForbiddenError("Forbidden or not found");
  },
  isOwner(id: string, userId: string): boolean {
    const row = getDb()
      .prepare(`SELECT created_by FROM chests WHERE id = ?`)
      .get(id) as { created_by: string | null } | undefined;
    return row ? row.created_by === userId : false;
  },
};
