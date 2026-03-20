import type { RequestHandler } from 'express'
import { getDb } from '../db/connection.js'

export const healthController: RequestHandler = (_req, res) => {
  try {
    getDb().prepare('SELECT 1').get()
    res.json({ status: 'ok', database: 'connected' })
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' })
  }
}
