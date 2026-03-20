import { getChestsByCreator } from '../db/repositories/chests.repository.js'
import { getFoundItemsByUser } from '../db/repositories/discoveries.repository.js'
import { getMessagesByCreator } from '../db/repositories/messages.repository.js'
import { searchUsers } from '../db/repositories/users.repository.js'

export const usersService = {
  getMeItems(userId: string) {
    const createdMessages = getMessagesByCreator(userId)
    const createdChests = getChestsByCreator(userId)
    const { chests: foundChests, loot: foundLoot, messages: foundMessages } = getFoundItemsByUser(userId)
    return { createdMessages, createdChests, foundChests, foundLoot, foundMessages }
  },
  search(q: string, limit: number) {
    return searchUsers(q, limit)
  },
}
