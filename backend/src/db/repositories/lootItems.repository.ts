/**
 * Loot items repository. PostGIS-ready.
 */
import { randomUUID } from 'crypto'
import { getDb } from '../connection.js'
import { haversineDistance, isInBoundingBox, boundsFromCenterAndRadius } from '../../utils/geo.js'
import { LOOT_ITEM_CONFIG, GEO_CONFIG } from '../../config/items.config.js'
import type { LootItemType } from '../../config/items.config.js'

export interface LootItemRow {
  id: string
  type: string
  content: string
  latitude: number
  longitude: number
  altitude: number | null
  xp_reward: number
  coin_reward: number
  is_penalty: number
  created_by: string | null
  created_at: string
}

export interface LootItem {
  id: string
  type: LootItemType
  content: string
  latitude: number
  longitude: number
  altitude?: number
  xpReward: number
  coinReward: number
  createdBy?: string
  createdAt: string
  isPenalty?: boolean
}

export interface NearbyLootItem {
  id: string
  type: LootItemType
  content: string
  location: { latitude: number; longitude: number; altitude?: number }
  distance: number
  xpReward: number
  coinReward: number
  isPenalty?: boolean
  createdBy?: string
  createdAt: string
  isOwn?: boolean
}

export function createLootItem(
  data: Omit<LootItem, 'id' | 'createdAt' | 'xpReward' | 'coinReward' | 'isPenalty'> &
    Partial<Pick<LootItem, 'xpReward' | 'coinReward' | 'isPenalty'>>
): LootItem {
  const config = LOOT_ITEM_CONFIG[data.type]
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const xpReward = data.xpReward ?? config.xpReward
  const coinReward = data.coinReward ?? config.coinReward
  const isPenalty = data.isPenalty ?? config.isPenalty

  getDb()
    .prepare(
      `INSERT INTO loot_items (id, type, content, latitude, longitude, altitude, xp_reward, coin_reward, is_penalty, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      data.type,
      data.content,
      data.latitude,
      data.longitude,
      data.altitude ?? null,
      xpReward,
      coinReward,
      isPenalty ? 1 : 0,
      data.createdBy ?? null,
      createdAt
    )

  return { ...data, id, xpReward, coinReward, isPenalty, createdAt }
}

export function getLootItemsNearby(lat: number, lng: number, userId?: string): NearbyLootItem[] {
  const { minLat, maxLat, minLng, maxLng } = boundsFromCenterAndRadius(lat, lng, GEO_CONFIG.NEARBY_RADIUS_M)
  return getLootItemsInViewport(minLat, maxLat, minLng, maxLng, userId, lat, lng)
}

export function getLootItemsInViewport(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  userId?: string,
  userLat?: number,
  userLng?: number
): NearbyLootItem[] {
  const refLat = userLat ?? (minLat + maxLat) / 2
  const refLng = userLng ?? (minLng + maxLng) / 2

  const rows = getDb().prepare(`SELECT * FROM loot_items`).all() as LootItemRow[]

  return rows
    .filter((row) => isInBoundingBox(row.latitude, row.longitude, minLat, maxLat, minLng, maxLng))
    .map((row) => ({
      id: row.id,
      type: row.type as LootItemType,
      content: row.content,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        altitude: row.altitude ?? undefined,
      },
      distance: haversineDistance(refLat, refLng, row.latitude, row.longitude),
      xpReward: row.xp_reward,
      coinReward: row.coin_reward,
      isPenalty: row.is_penalty === 1,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      isOwn: !!userId && row.created_by === userId,
    }))
    .sort((a, b) => a.distance - b.distance)
}
