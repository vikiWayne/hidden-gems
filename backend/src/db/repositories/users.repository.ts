/**
 * Users repository.
 */
import { getDb } from '../connection.js'

export interface User {
  id: string
  username: string
}

export function searchUsers(query: string, limit = 5): User[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const rows = getDb()
    .prepare(`SELECT id, username FROM users WHERE LOWER(username) LIKE ? ORDER BY username LIMIT ?`)
    .all(`%${q}%`, limit) as { id: string; username: string }[]

  return rows.map((r) => ({ id: r.id, username: r.username }))
}

export function getUser(id: string): User | undefined {
  const row = getDb().prepare(`SELECT id, username FROM users WHERE id = ?`).get(id) as { id: string; username: string } | undefined
  return row ? { id: row.id, username: row.username } : undefined
}

export function upsertUser(id: string, username: string): void {
  const now = new Date().toISOString()
  getDb()
    .prepare(
      `INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET username = excluded.username`
    )
    .run(id, username, now)
}
