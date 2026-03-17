/**
 * Messages repository. Queries designed for PostGIS migration.
 */
import { randomUUID } from 'crypto'
import { getDb } from '../connection.js'
import { haversineDistance, isInBoundingBox } from '../../utils/geo.js'
import { GEO_CONFIG } from '../../config/items.config.js'

export type MarkerColor = 'purple' | 'orange' | 'green' | 'gold' | 'teal' | 'blue' | 'red' | 'pink'

export interface MessageRow {
  id: string
  type: string
  content: string
  media_url: string | null
  latitude: number
  longitude: number
  altitude: number | null
  visibility: string
  allowed_user_ids: string
  category: string | null
  marker_color: string | null
  created_by: string | null
  created_at: string
}

export interface Message {
  id: string
  type: 'text' | 'voice' | 'image' | 'video'
  content: string
  mediaUrl?: string
  latitude: number
  longitude: number
  altitude?: number
  visibility: 'public' | 'private'
  allowedUserIds: string[]
  category?: string
  createdBy?: string
  createdAt: string
  markerColor?: MarkerColor
  rating?: number
  ratingCount?: number
}

export interface NearbyResult {
  id: string
  type: 'text' | 'voice' | 'image' | 'video'
  content: string
  mediaUrl?: string
  location: { latitude: number; longitude: number; altitude?: number }
  visibility: 'public' | 'private'
  allowedUserIds: string[]
  category?: string
  createdBy?: string
  createdAt: string
  distance: number
  isOwn?: boolean
  markerColor?: MarkerColor
  rating?: number
  ratingCount?: number
}

const { NEARBY_RADIUS_M, UNLOCK_DISTANCE_M } = GEO_CONFIG

function rowToMessage(row: MessageRow): Message {
  const allowedUserIds = row.allowed_user_ids ? (JSON.parse(row.allowed_user_ids) as string[]) : []
  return {
    id: row.id,
    type: row.type as Message['type'],
    content: row.content,
    mediaUrl: row.media_url ?? undefined,
    latitude: row.latitude,
    longitude: row.longitude,
    altitude: row.altitude ?? undefined,
    visibility: row.visibility as Message['visibility'],
    allowedUserIds,
    category: row.category ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    markerColor: (row.marker_color as MarkerColor) ?? undefined,
    rating: (row as any).rating_count ? ((row as any).rating_sum! / (row as any).rating_count) : 0,
    ratingCount: (row as any).rating_count ?? 0,
  }
}

export function createMessage(data: Omit<Message, 'id' | 'createdAt'>): Message {
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const allowedUserIds = data.allowedUserIds ?? []

  getDb()
    .prepare(
      `INSERT INTO messages (id, type, content, media_url, latitude, longitude, altitude, visibility, allowed_user_ids, category, marker_color, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      data.type ?? 'text',
      data.content,
      data.mediaUrl ?? null,
      data.latitude,
      data.longitude,
      data.altitude ?? null,
      data.visibility,
      JSON.stringify(allowedUserIds),
      data.category ?? null,
      data.markerColor ?? null,
      data.createdBy ?? null,
      createdAt
    )

  return { ...data, id, type: (data.type ?? 'text') as Message['type'], allowedUserIds, createdAt }
}

export function getNearbyMessages(lat: number, lng: number, claimedIds: string[] = [], userId?: string): NearbyResult[] {
  const rows = getDb().prepare(`SELECT m.*, 
    (SELECT SUM(rating) FROM item_ratings WHERE item_type='message' AND item_id=m.id) as rating_sum,
    (SELECT COUNT(*) FROM item_ratings WHERE item_type='message' AND item_id=m.id) as rating_count
  FROM messages m`).all() as (MessageRow & { rating_sum: number | null, rating_count: number | null })[]
  const results: NearbyResult[] = []

  for (const row of rows) {
    const dist = haversineDistance(lat, lng, row.latitude, row.longitude)
    if (dist > NEARBY_RADIUS_M) continue

    const isOwn = !!(userId && row.created_by === userId)
    const isPublic = row.visibility === 'public'
    const allowedUserIds = row.allowed_user_ids ? (JSON.parse(row.allowed_user_ids) as string[]) : []
    const isAllowed = allowedUserIds.includes(userId ?? '')
    const isClaimed = claimedIds.includes(row.id)
    const isUnlocked = dist <= UNLOCK_DISTANCE_M

    if (!isOwn && !isClaimed && !isUnlocked) {
      results.push({
        id: row.id,
        type: row.type as NearbyResult['type'],
        content: '[Hidden - walk closer to reveal]',
        location: { latitude: row.latitude, longitude: row.longitude, altitude: row.altitude ?? undefined },
        visibility: row.visibility as NearbyResult['visibility'],
        allowedUserIds,
        category: row.category ?? undefined,
        createdBy: row.created_by ?? undefined,
        createdAt: row.created_at,
        distance: dist,
        isOwn: false,
        rating: row.rating_count ? (row.rating_sum! / row.rating_count) : 0,
        ratingCount: row.rating_count ?? 0,
      })
      continue
    }

    if (!isPublic && !isAllowed && !isOwn) continue

    results.push({
      id: row.id,
      type: row.type as NearbyResult['type'],
      content: row.content,
      mediaUrl: row.media_url ?? undefined,
      location: { latitude: row.latitude, longitude: row.longitude, altitude: row.altitude ?? undefined },
      visibility: row.visibility as NearbyResult['visibility'],
      allowedUserIds,
      category: row.category ?? undefined,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      distance: dist,
      isOwn,
      markerColor: (row.marker_color as MarkerColor) ?? undefined,
      rating: row.rating_count ? (row.rating_sum! / row.rating_count) : 0,
      ratingCount: row.rating_count ?? 0,
    })
  }

  results.sort((a, b) => a.distance - b.distance)
  return results
}

export function getMessagesInViewport(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  userId?: string,
  userLat?: number,
  userLng?: number,
  claimedIds: string[] = []
): NearbyResult[] {
  const refLat = userLat ?? (minLat + maxLat) / 2
  const refLng = userLng ?? (minLng + maxLng) / 2

  const rows = getDb().prepare(`SELECT m.*,
    (SELECT SUM(rating) FROM item_ratings WHERE item_type='message' AND item_id=m.id) as rating_sum,
    (SELECT COUNT(*) FROM item_ratings WHERE item_type='message' AND item_id=m.id) as rating_count
  FROM messages m`).all() as (MessageRow & { rating_sum: number | null, rating_count: number | null })[]
  const results: NearbyResult[] = []

  for (const row of rows) {
    if (!isInBoundingBox(row.latitude, row.longitude, minLat, maxLat, minLng, maxLng)) continue

    const dist = haversineDistance(refLat, refLng, row.latitude, row.longitude)
    const isOwn = !!(userId && row.created_by === userId)
    const isPublic = row.visibility === 'public'
    const allowedUserIds = row.allowed_user_ids ? (JSON.parse(row.allowed_user_ids) as string[]) : []
    const isAllowed = allowedUserIds.includes(userId ?? '')
    const isClaimed = claimedIds.includes(row.id)
    const isUnlocked = dist <= UNLOCK_DISTANCE_M

    if (!isOwn && !isClaimed && !isUnlocked) {
      results.push({
        id: row.id,
        type: row.type as NearbyResult['type'],
        content: '[Hidden - walk closer to reveal]',
        location: { latitude: row.latitude, longitude: row.longitude, altitude: row.altitude ?? undefined },
        visibility: row.visibility as NearbyResult['visibility'],
        allowedUserIds,
        category: row.category ?? undefined,
        createdBy: row.created_by ?? undefined,
        createdAt: row.created_at,
        distance: dist,
        isOwn: false,
        rating: row.rating_count ? (row.rating_sum! / row.rating_count) : 0,
        ratingCount: row.rating_count ?? 0,
      })
      continue
    }

    if (!isPublic && !isAllowed && !isOwn) continue

    results.push({
      id: row.id,
      type: row.type as NearbyResult['type'],
      content: row.content,
      mediaUrl: row.media_url ?? undefined,
      location: { latitude: row.latitude, longitude: row.longitude, altitude: row.altitude ?? undefined },
      visibility: row.visibility as NearbyResult['visibility'],
      allowedUserIds,
      category: row.category ?? undefined,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      distance: dist,
      isOwn,
      markerColor: (row.marker_color as MarkerColor) ?? undefined,
      rating: row.rating_count ? (row.rating_sum! / row.rating_count) : 0,
      ratingCount: row.rating_count ?? 0,
    })
  }

  results.sort((a, b) => a.distance - b.distance)
  return results
}

export function getMessage(id: string, lat: number, lng: number, userId?: string) {
  const row = getDb().prepare(`SELECT m.*,
    (SELECT SUM(rating) FROM item_ratings WHERE item_type='message' AND item_id=m.id) as rating_sum,
    (SELECT COUNT(*) FROM item_ratings WHERE item_type='message' AND item_id=m.id) as rating_count
  FROM messages m WHERE id = ?`).get(id) as (MessageRow & { rating_sum: number | null, rating_count: number | null }) | undefined
  if (!row) return null

  const dist = haversineDistance(lat, lng, row.latitude, row.longitude)
  const allowedUserIds = row.allowed_user_ids ? (JSON.parse(row.allowed_user_ids) as string[]) : []
  const unlocked = dist <= UNLOCK_DISTANCE_M && (row.visibility === 'public' || allowedUserIds.includes(userId ?? ''))

  const msg = rowToMessage(row)
  return {
    message: unlocked ? msg : { ...msg, content: '[Unlock by getting closer]' },
    unlocked,
  }
}

export function updateMessage(
  id: string,
  updates: Partial<Pick<Message, 'content' | 'visibility' | 'allowedUserIds' | 'category' | 'markerColor'>>
) {
  const row = getDb().prepare(`SELECT * FROM messages WHERE id = ?`).get(id) as MessageRow | undefined
  if (!row) return null

  const content = updates.content ?? row.content
  const visibility = updates.visibility ?? row.visibility
  const allowedUserIds = updates.allowedUserIds ?? (row.allowed_user_ids ? (JSON.parse(row.allowed_user_ids) as string[]) : [])
  const category = updates.category ?? row.category
  const markerColor = updates.markerColor ?? row.marker_color

  getDb()
    .prepare(`UPDATE messages SET content = ?, visibility = ?, allowed_user_ids = ?, category = ?, marker_color = ? WHERE id = ?`)
    .run(content, visibility, JSON.stringify(allowedUserIds), category ?? null, markerColor ?? null, id)

  return rowToMessage({ ...row, content, visibility, allowed_user_ids: JSON.stringify(allowedUserIds), category, marker_color: markerColor })
}

export function deleteMessage(id: string, userId: string): boolean {
  const row = getDb().prepare(`SELECT created_by FROM messages WHERE id = ?`).get(id) as { created_by: string | null } | undefined
  if (!row || row.created_by !== userId) return false
  getDb().prepare(`DELETE FROM messages WHERE id = ?`).run(id)
  return true
}

export function getMessagesByCreator(userId: string): Message[] {
  const rows = getDb().prepare(`SELECT * FROM messages WHERE created_by = ? ORDER BY created_at DESC`).all(userId) as MessageRow[]
  return rows.map(rowToMessage)
}
