import { GEO_CONFIG, LOOT_ITEM_CONFIG, PENALTY_CONFIG } from '../config/items.config.js'
import { getNearbyMessages, getMessagesInViewport } from '../db/repositories/messages.repository.js'
import { getNearbyChests, getChestsInViewport } from '../db/repositories/chests.repository.js'
import { getLootItemsInViewport, getLootItemsNearby } from '../db/repositories/lootItems.repository.js'
import { getClaimedIds } from '../db/repositories/discoveries.repository.js'

function shouldFetch(filter: string | undefined, target: 'messages' | 'chests' | 'loot'): boolean {
  return !filter || filter === 'all' || filter === target
}

export const mapService = {
  getNearby(lat: number, lng: number, userId?: string, filter?: string) {
    let claimedMessageIds: string[] = []
    let claimedChestIds: string[] = []
    let claimedLootIds: string[] = []

    if (userId) {
      const claimed = getClaimedIds(userId)
      claimedMessageIds = claimed.messageIds
      claimedChestIds = claimed.chestIds
      claimedLootIds = claimed.lootIds
    }

    const messages = shouldFetch(filter, 'messages') ? getNearbyMessages(lat, lng, claimedMessageIds, userId) : []
    const chests = shouldFetch(filter, 'chests')
      ? getNearbyChests(lat, lng, userId).filter((item) => !claimedChestIds.includes(item.id))
      : []
    const lootItems = shouldFetch(filter, 'loot')
      ? getLootItemsNearby(lat, lng, userId).filter((item) => !claimedLootIds.includes(item.id))
      : []

    return { messages, chests, lootItems }
  },

  getViewport(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    userId?: string,
    userLat?: number,
    userLng?: number,
    filter?: string
  ) {
    let claimedMessageIds: string[] = []
    let claimedChestIds: string[] = []
    let claimedLootIds: string[] = []

    if (userId) {
      const claimed = getClaimedIds(userId)
      claimedMessageIds = claimed.messageIds
      claimedChestIds = claimed.chestIds
      claimedLootIds = claimed.lootIds
    }

    const messages = shouldFetch(filter, 'messages')
      ? getMessagesInViewport(minLat, maxLat, minLng, maxLng, userId, userLat, userLng, claimedMessageIds)
      : []
    const chests = shouldFetch(filter, 'chests')
      ? getChestsInViewport(minLat, maxLat, minLng, maxLng, userId, userLat, userLng).filter((item) => !claimedChestIds.includes(item.id))
      : []
    const lootItems = shouldFetch(filter, 'loot')
      ? getLootItemsInViewport(minLat, maxLat, minLng, maxLng, userId, userLat, userLng).filter((item) => !claimedLootIds.includes(item.id))
      : []

    return { messages, chests, lootItems }
  },

  getConfig() {
    return {
      penalty: PENALTY_CONFIG,
      lootItems: LOOT_ITEM_CONFIG,
      geo: GEO_CONFIG,
    }
  },
}
