import { Router } from 'express'
import { getMessagesInViewport, getNearbyMessages } from '../db/repositories/messages.repository.js'
import { getChestsInViewport, getNearbyChests } from '../db/repositories/chests.repository.js'
import { getLootItemsInViewport, getLootItemsNearby } from '../db/repositories/lootItems.repository.js'
import { getClaimedIds } from '../db/repositories/discoveries.repository.js'
import {
  PENALTY_CONFIG,
  LOOT_ITEM_CONFIG,
  GEO_CONFIG,
} from '../config/items.config.js'

export const mapRouter = Router()

/**
 * GET /api/map/nearby
 * Returns items within NEARBY_RADIUS_M of the user. Use for proximity, theme, nearby list.
 * Excludes claimed chests and loot when userId is provided.
 * Query: lat, lng, userId?
 */
mapRouter.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat as string)
  const lng = parseFloat(req.query.lng as string)
  const userId = req.query.userId as string | undefined

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ message: 'lat, lng required as numbers' })
  }

  const messages = getNearbyMessages(lat, lng, undefined, userId)
  let chests = getNearbyChests(lat, lng, userId)
  let lootItems = getLootItemsNearby(lat, lng, userId)

  if (userId) {
    const { chestIds, lootIds } = getClaimedIds(userId)
    chests = chests.filter((c) => !chestIds.includes(c.id))
    lootItems = lootItems.filter((l) => !lootIds.includes(l.id))
  }

  res.json({ messages, chests, lootItems })
})

/**
 * GET /api/map/viewport
 * Returns all map items (messages, chests, loot) within the viewport bounding box.
 * Use this for efficient viewport-based loading instead of loading everything.
 *
 * Query: minLat, maxLat, minLng, maxLng, userId?, userLat?, userLng?
 * userLat/userLng: optional - if provided, distance is computed from user location
 */
mapRouter.get('/viewport', (req, res) => {
  const minLat = parseFloat(req.query.minLat as string)
  const maxLat = parseFloat(req.query.maxLat as string)
  const minLng = parseFloat(req.query.minLng as string)
  const maxLng = parseFloat(req.query.maxLng as string)
  const userId = req.query.userId as string | undefined
  const userLat = req.query.userLat != null ? parseFloat(req.query.userLat as string) : undefined
  const userLng = req.query.userLng != null ? parseFloat(req.query.userLng as string) : undefined

  if (
    isNaN(minLat) ||
    isNaN(maxLat) ||
    isNaN(minLng) ||
    isNaN(maxLng)
  ) {
    return res.status(400).json({
      message: 'minLat, maxLat, minLng, maxLng required as numbers',
    })
  }

  if (minLat >= maxLat || minLng >= maxLng) {
    return res.status(400).json({
      message: 'minLat < maxLat and minLng < maxLng required',
    })
  }

  const messages = getMessagesInViewport(minLat, maxLat, minLng, maxLng, userId, userLat, userLng)
  let chests = getChestsInViewport(minLat, maxLat, minLng, maxLng, userId, userLat, userLng)
  let lootItems = getLootItemsInViewport(
    minLat,
    maxLat,
    minLng,
    maxLng,
    userId,
    userLat,
    userLng
  )

  if (userId) {
    const { chestIds, lootIds } = getClaimedIds(userId)
    chests = chests.filter((c) => !chestIds.includes(c.id))
    lootItems = lootItems.filter((l) => !lootIds.includes(l.id))
  }

  res.json({
    messages,
    chests,
    lootItems,
  })
})

/**
 * GET /api/map/config
 * Returns configurable item types, penalties, and geo constants for the frontend.
 */
mapRouter.get('/config', (_req, res) => {
  res.json({
    penalty: PENALTY_CONFIG,
    lootItems: LOOT_ITEM_CONFIG,
    geo: GEO_CONFIG,
  })
})
