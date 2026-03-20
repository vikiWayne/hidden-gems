import { createLootItem } from '../db/repositories/lootItems.repository.js'

export const lootItemsService = {
  create(payload: Parameters<typeof createLootItem>[0]) {
    return createLootItem(payload)
  },
}
