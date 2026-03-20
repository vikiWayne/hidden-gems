import { createChest, deleteChest, getNearbyChests } from '../db/repositories/chests.repository.js'
import { recordChestDiscovery } from '../db/repositories/discoveries.repository.js'
import { ForbiddenError, ValidationError } from '../lib/errors.js'

export const chestsService = {
  getNearby(lat: number, lng: number, userId?: string) {
    return getNearbyChests(lat, lng, userId)
  },
  create(payload: Parameters<typeof createChest>[0]) {
    return createChest(payload)
  },
  claim(id: string, userId: string) {
    const result = recordChestDiscovery(userId, id)
    if (!result) throw new ValidationError('Chest not found or already claimed')
    return result
  },
  remove(id: string, userId: string) {
    const removed = deleteChest(id, userId)
    if (!removed) throw new ForbiddenError('Forbidden or not found')
  },
}
