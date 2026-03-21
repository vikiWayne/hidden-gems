import {
  createMessage,
  deleteMessage,
  getMessage,
  getNearbyMessages,
  updateMessage,
} from "../db/repositories/messages.repository.js";
import { getDb } from "../db/connection.js";
import { recordMessageDiscovery } from "../db/repositories/discoveries.repository.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";
import { haversineDistance } from "../utils/geo.js";
import { GEO_CONFIG } from "../config/items.config.js";

export const messagesService = {
  getNearby(lat: number, lng: number, _alt?: number, userId?: string) {
    return getNearbyMessages(lat, lng, [], userId);
  },
  create(payload: Parameters<typeof createMessage>[0]) {
    return createMessage(payload);
  },
  getById(id: string, lat: number, lng: number, userId?: string) {
    const result = getMessage(id, lat, lng, userId);
    if (!result) throw new NotFoundError("Message not found");

    // Check the location of the message against the provided lat/lng to determine if it's within the unlock radius.
    // If it is, and the userId is provided, record the discovery.
    const distance = haversineDistance(
      result.message.latitude,
      result.message.longitude,
      lat,
      lng,
    );

    if (distance > GEO_CONFIG.UNLOCK_DISTANCE_M) {
      throw new ForbiddenError("Message is out of unlock distance");
    }

    if (userId && result.unlocked) {
      recordMessageDiscovery(userId, id);
    }

    return result;
  },
  update(id: string, payload: Parameters<typeof updateMessage>[1]) {
    const updated = updateMessage(id, payload);
    if (!updated) throw new NotFoundError("Message not found");
    return updated;
  },
  remove(id: string, userId: string) {
    const removed = deleteMessage(id, userId);
    if (!removed) throw new ForbiddenError("Forbidden or not found");
  },
  isOwner(id: string, userId: string): boolean {
    const row = getDb()
      .prepare(`SELECT created_by FROM messages WHERE id = ?`)
      .get(id) as { created_by: string | null } | undefined;
    return row ? row.created_by === userId : false;
  },
};
