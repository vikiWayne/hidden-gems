import { getDb } from '../connection.js'
import { randomUUID } from 'crypto'

export interface ItemRating {
  id: string
  userId: string
  itemType: 'message' | 'chest' | 'loot'
  itemId: string
  rating: number
  createdAt: string
}

interface ExistingRatingRow {
  id: string
  user_id: string
  item_type: string
  item_id: string
  rating: number
  created_at: string
}

interface RatingStatsRow {
  avgRating: number | null
  count: number
}

export function rateItem(userId: string, itemType: 'message' | 'chest' | 'loot', itemId: string, rating: number): ItemRating {
  const existing = getDb()
    .prepare(`SELECT * FROM item_ratings WHERE user_id = ? AND item_type = ? AND item_id = ?`)
    .get(userId, itemType, itemId) as ExistingRatingRow | undefined

  if (existing) {
    const updatedAt = new Date().toISOString()
    getDb()
      .prepare(`UPDATE item_ratings SET rating = ?, created_at = ? WHERE id = ?`)
      .run(rating, updatedAt, existing.id)
    return {
      id: existing.id,
      userId,
      itemType,
      itemId,
      rating,
      createdAt: updatedAt,
    }
  }

  const id = randomUUID()
  const createdAt = new Date().toISOString()

  getDb()
    .prepare(
      `INSERT INTO item_ratings (id, user_id, item_type, item_id, rating, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, itemType, itemId, rating, createdAt)

  return { id, userId, itemType, itemId, rating, createdAt }
}

export function getItemRating(itemType: 'message' | 'chest' | 'loot', itemId: string) {
  const row = getDb()
    .prepare(`SELECT AVG(rating) as avgRating, COUNT(*) as count FROM item_ratings WHERE item_type = ? AND item_id = ?`)
    .get(itemType, itemId) as RatingStatsRow | undefined

  return {
    rating: row?.avgRating ? Number(row.avgRating) : 0,
    ratingCount: row?.count ? Number(row.count) : 0,
  }
}
