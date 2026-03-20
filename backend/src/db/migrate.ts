/**
 * Migration runner. Executes SQL files in order.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDb } from './connection.js'
import { logger } from '../lib/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')
const MIGRATIONS_TABLE = 'schema_migrations'

export function runMigrations(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `)

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    const name = file
    const row = db.prepare(`SELECT name FROM ${MIGRATIONS_TABLE} WHERE name = ?`).get(name) as { name: string } | undefined

    if (row) continue

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')
    db.exec(sql)
    db.prepare(`INSERT INTO ${MIGRATIONS_TABLE} (name, applied_at) VALUES (?, ?)`).run(name, new Date().toISOString())
    logger.info('db_migration_applied', { name })
  }
}
