/**
 * Chests repository. PostGIS-ready queries.
 */
import { randomUUID } from 'crypto'
import { getDb } from '../connection.js'
import { haversineDistance, isInBoundingBox } from '../../utils/geo.js'
import { GEO_CONFIG } from '../../config/items.config.js'
import type { ChestVariant } from '../../config/items.config.js'

export interface ChestRow {
  id: string
  content: string
  latitude: number
  longitude: number
  altitude: number | null
  xp_reward: number
  coin_reward: number | null
  variant: string
  created_by: string | null
  created_at: string
}

export interface Chest {
  id: string
  content: string
  latitude: number
  longitude: number
  altitude?: number
  createdBy?: string
  createdAt: string
  xpReward: number
  coinReward?: number
  variant?: ChestVariant
}

export interface NearbyChest {
  id: string
  content: string
  location: { latitude: number; longitude: number; altitude?: number }
  distance: number
  xpReward: number
  coinReward?: number
  variant?: ChestVariant
  createdBy?: string
  createdAt: string
  isOwn?: boolean
}

const CHEST_RADIUS_M = GEO_CONFIG.NEARBY_RADIUS_M

function rowToChest(row: ChestRow): Chest {
  return {
    id: row.id,
    content: row.content,
    latitude: row.latitude,
    longitude: row.longitude,
    altitude: row.altitude ?? undefined,
    xpReward: row.xp_reward,
    coinReward: row.coin_reward ?? undefined,
    variant: (row.variant as ChestVariant) ?? 'normal',
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
  }
}

export function createChest(data: Omit<Chest, 'id' | 'createdAt'>): Chest {
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const variant = data.variant ?? 'normal'

  getDb()
    .prepare(
      `INSERT INTO chests (id, content, latitude, longitude, altitude, xp_reward, coin_reward, variant, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      data.content,
      data.latitude,
      data.longitude,
      data.altitude ?? null,
      data.xpReward,
      data.coinReward ?? null,
      variant,
      data.createdBy ?? null,
      createdAt
    )

  return { ...data, id, variant, createdAt }
}

export function getChestById(id: string): Chest | undefined {
  const row = getDb().prepare(`SELECT * FROM chests WHERE id = ?`).get(id) as ChestRow | undefined
  return row ? rowToChest(row) : undefined
}

export function getNearbyChests(lat: number, lng: number, userId?: string): NearbyChest[] {
  // Use bounding box to filter at SQL level
  const latDelta = CHEST_RADIUS_M / 111000
  const lngDelta = CHEST_RADIUS_M / (111000 * Math.cos(lat * Math.PI / 180))

  const rows = getDb().prepare(`SELECT * FROM chests
    WHERE latitude BETWEEN ? AND ?
    AND longitude BETWEEN ? AND ?`).all(
    lat - latDelta, lat + latDelta,
    lng - lngDelta, lng + lngDelta
  ) as ChestRow[]

  return rows
    .map((row) => ({
      id: row.id,
      content: row.content,
      location: { latitude: row.latitude, longitude: row.longitude, altitude: row.altitude ?? undefined },
      distance: haversineDistance(lat, lng, row.latitude, row.longitude),
      xpReward: row.xp_reward,
      coinReward: row.coin_reward ?? undefined,
      variant: (row.variant as ChestVariant) ?? 'normal',
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      isOwn: !!userId && row.created_by === userId,
    }))
    .filter((c) => c.distance <= CHEST_RADIUS_M)
    .sort((a, b) => a.distance - b.distance)
}

export function getChestsInViewport(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  userId?: string,
  userLat?: number,
  userLng?: number
): NearbyChest[] {
  const refLat = userLat ?? (minLat + maxLat) / 2
  const refLng = userLng ?? (minLng + maxLng) / 2

  // Filter at SQL level using bounding box
  const rows = getDb().prepare(`SELECT * FROM chests
    WHERE latitude BETWEEN ? AND ?
    AND longitude BETWEEN ? AND ?`).all(
    minLat, maxLat, minLng, maxLng
  ) as ChestRow[]

  return rows
    .filter((row) => isInBoundingBox(row.latitude, row.longitude, minLat, maxLat, minLng, maxLng))
    .map((row) => ({
      id: row.id,
      content: row.content,
      location: { latitude: row.latitude, longitude: row.longitude, altitude: row.altitude ?? undefined },
      distance: haversineDistance(refLat, refLng, row.latitude, row.longitude),
      xpReward: row.xp_reward,
      coinReward: row.coin_reward ?? undefined,
      variant: (row.variant as ChestVariant) ?? 'normal',
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      isOwn: !!userId && row.created_by === userId,
    }))
    .sort((a, b) => a.distance - b.distance)
}

export function deleteChest(id: string, userId: string): boolean {
  const row = getDb().prepare(`SELECT created_by FROM chests WHERE id = ?`).get(id) as { created_by: string | null } | undefined
  if (!row || row.created_by !== userId) return false
  getDb().prepare(`DELETE FROM chests WHERE id = ?`).run(id)
  return true
}

export function getChestsByCreator(userId: string): Chest[] {
  const rows = getDb().prepare(`SELECT * FROM chests WHERE created_by = ? ORDER BY created_at DESC`).all(userId) as ChestRow[]
  return rows.map(rowToChest)
}
