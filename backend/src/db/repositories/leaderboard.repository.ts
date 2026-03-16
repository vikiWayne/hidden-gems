/**
 * Leaderboard repository.
 */
import { getDb } from '../connection.js'

export interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  discovered: number
  chestsFound: number
}

export function getLeaderboard(limit = 10): LeaderboardEntry[] {
  const rows = getDb()
    .prepare(
      `SELECT username, xp, discovered, chests_found FROM leaderboard
       ORDER BY xp DESC LIMIT ?`
    )
    .all(limit) as { username: string; xp: number; discovered: number; chests_found: number }[]

  return rows.map((r, i) => ({
    rank: i + 1,
    username: r.username,
    xp: r.xp,
    discovered: r.discovered,
    chestsFound: r.chests_found,
  }))
}

export function upsertLeaderboardEntry(
  userId: string,
  username: string,
  xp: number,
  discovered: number,
  chestsFound: number
): void {
  const now = new Date().toISOString()
  getDb()
    .prepare(
      `INSERT INTO leaderboard (user_id, username, xp, discovered, chests_found, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         username = excluded.username,
         xp = excluded.xp,
         discovered = excluded.discovered,
         chests_found = excluded.chests_found,
         updated_at = excluded.updated_at`
    )
    .run(userId, username, xp, discovered, chestsFound, now)
}
