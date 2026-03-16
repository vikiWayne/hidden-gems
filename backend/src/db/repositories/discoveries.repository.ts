/**
 * Discoveries repository - tracks when users find items (chests, loot) with finder ordinal.
 */
import { randomUUID } from 'crypto'
import { getDb } from '../connection.js'

export type DiscoveryItemType = 'chest' | 'loot'

export interface Discovery {
  id: string
  userId: string
  itemType: DiscoveryItemType
  itemId: string
  finderOrdinal: number
  foundAt: string
}

export interface FoundChest {
  id: string
  itemId: string
  content: string
  xpReward: number
  finderOrdinal: number
  foundAt: string
}

export interface FoundLootItem {
  id: string
  itemId: string
  type: string
  content: string
  xpReward: number
  coinReward: number
  finderOrdinal: number
  foundAt: string
}

export function recordChestDiscovery(userId: string, chestId: string): { finderOrdinal: number } | null {
  const chest = getDb().prepare(`SELECT id FROM chests WHERE id = ?`).get(chestId) as { id: string } | undefined
  if (!chest) return null

  const existing = getDb()
    .prepare(`SELECT id FROM discoveries WHERE user_id = ? AND item_type = 'chest' AND item_id = ?`)
    .get(userId, chestId) as { id: string } | undefined
  if (existing) return null

  const count = getDb()
    .prepare(`SELECT COUNT(*) as c FROM discoveries WHERE item_type = 'chest' AND item_id = ?`)
    .get(chestId) as { c: number }
  const finderOrdinal = count.c + 1

  const id = randomUUID()
  const foundAt = new Date().toISOString()
  getDb()
    .prepare(`INSERT INTO discoveries (id, user_id, item_type, item_id, finder_ordinal, found_at) VALUES (?, ?, 'chest', ?, ?, ?)`)
    .run(id, userId, chestId, finderOrdinal, foundAt)

  return { finderOrdinal }
}

export function getClaimedIds(userId: string): { chestIds: string[]; lootIds: string[] } {
  const chestRows = getDb()
    .prepare(`SELECT item_id FROM discoveries WHERE user_id = ? AND item_type = 'chest'`)
    .all(userId) as Array<{ item_id: string }>
  const lootRows = getDb()
    .prepare(`SELECT item_id FROM discoveries WHERE user_id = ? AND item_type = 'loot'`)
    .all(userId) as Array<{ item_id: string }>
  return {
    chestIds: chestRows.map((r) => r.item_id),
    lootIds: lootRows.map((r) => r.item_id),
  }
}

export function getFoundItemsByUser(userId: string): { chests: FoundChest[]; loot: FoundLootItem[] } {
  const chestRows = getDb()
    .prepare(
      `SELECT d.id, d.item_id, d.finder_ordinal, d.found_at, c.content, c.xp_reward
       FROM discoveries d
       JOIN chests c ON c.id = d.item_id
       WHERE d.user_id = ? AND d.item_type = 'chest'
       ORDER BY d.found_at DESC`
    )
    .all(userId) as Array<{ id: string; item_id: string; finder_ordinal: number; found_at: string; content: string; xp_reward: number }>

  const lootRows = getDb()
    .prepare(
      `SELECT d.id, d.item_id, d.finder_ordinal, d.found_at, l.type, l.content, l.xp_reward, l.coin_reward
       FROM discoveries d
       JOIN loot_items l ON l.id = d.item_id
       WHERE d.user_id = ? AND d.item_type = 'loot'
       ORDER BY d.found_at DESC`
    )
    .all(userId) as Array<{ id: string; item_id: string; finder_ordinal: number; found_at: string; type: string; content: string; xp_reward: number; coin_reward: number }>

  const chests: FoundChest[] = chestRows.map((r) => ({
    id: r.id,
    itemId: r.item_id,
    content: r.content,
    xpReward: r.xp_reward,
    finderOrdinal: r.finder_ordinal,
    foundAt: r.found_at,
  }))

  const loot: FoundLootItem[] = lootRows.map((r) => ({
    id: r.id,
    itemId: r.item_id,
    type: r.type,
    content: r.content,
    xpReward: r.xp_reward,
    coinReward: r.coin_reward,
    finderOrdinal: r.finder_ordinal,
    foundAt: r.found_at,
  }))

  return { chests, loot }
}
