/**
 * Database connection singleton.
 * SQLite for now; swap to pg Pool for PostGIS.
 */
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DB_PATH = process.env.DATABASE_PATH ?? path.join(__dirname, '../../data/postbox.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH)
    fs.mkdirSync(dir, { recursive: true })
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
