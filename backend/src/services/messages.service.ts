import { createMessage, deleteMessage, getMessage, getNearbyMessages, updateMessage } from '../db/repositories/messages.repository.js'
import { recordMessageDiscovery } from '../db/repositories/discoveries.repository.js'
import { ForbiddenError, NotFoundError } from '../lib/errors.js'

export const messagesService = {
  getNearby(lat: number, lng: number, _alt?: number, userId?: string) {
    return getNearbyMessages(lat, lng, [], userId)
  },
  create(payload: Parameters<typeof createMessage>[0]) {
    return createMessage(payload)
  },
  getById(id: string, lat: number, lng: number, userId?: string) {
    const result = getMessage(id, lat, lng, userId)
    if (!result) throw new NotFoundError('Message not found')
    if (userId && result.unlocked) {
      recordMessageDiscovery(userId, id)
    }
    return result
  },
  update(id: string, payload: Parameters<typeof updateMessage>[1]) {
    const updated = updateMessage(id, payload)
    if (!updated) throw new NotFoundError('Message not found')
    return updated
  },
  remove(id: string, userId: string) {
    const removed = deleteMessage(id, userId)
    if (!removed) throw new ForbiddenError('Forbidden or not found')
  },
}
