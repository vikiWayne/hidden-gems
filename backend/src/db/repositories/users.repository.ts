/**
 * Users repository.
 */
import { getDb } from "../connection.js";

export interface User {
  id: string;
  username: string;
  passwordHash?: string;
  fullName?: string;
  createdAt?: string;
}

export function searchUsers(query: string, limit = 5): User[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Escape special LIKE characters (%, _) to prevent SQL injection
  const escapedQ = q.replace(/[%_]/g, "\\$&");

  const rows = getDb()
    .prepare(
      `SELECT id, username FROM users WHERE LOWER(username) LIKE ? ESCAPE '\\' ORDER BY username LIMIT ?`,
    )
    .all(`%${escapedQ}%`, limit) as { id: string; username: string }[];

  return rows.map((r) => ({ id: r.id, username: r.username }));
}

export function getUser(id: string): User | undefined {
  const row = getDb()
    .prepare(`SELECT id, username FROM users WHERE id = ?`)
    .get(id) as { id: string; username: string } | undefined;
  return row ? { id: row.id, username: row.username } : undefined;
}

export function getUserById(id: string): User | undefined {
  const row = getDb()
    .prepare(
      `SELECT id, username, password_hash as passwordHash, full_name as fullName, created_at as createdAt FROM users WHERE id = ?`,
    )
    .get(id) as User | undefined;
  return row;
}

export function getUserByUsername(username: string): User | undefined {
  const row = getDb()
    .prepare(
      `SELECT id, username, password_hash as passwordHash, full_name as fullName, created_at as createdAt FROM users WHERE username = ?`,
    )
    .get(username) as User | undefined;
  return row;
}

export function createUser(
  id: string,
  username: string,
  passwordHash: string,
  fullName: string,
): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO users (id, username, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(id, username, passwordHash, fullName, now);
}

export function upsertUser(id: string, username: string): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET username = excluded.username`,
    )
    .run(id, username, now);
}
