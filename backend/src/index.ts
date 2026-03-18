import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { getDb } from './db/connection.js'
import { runMigrations } from './db/migrate.js'
import { seedDatabase } from './db/seed.js'
import { messagesRouter } from './routes/messages.js'
import { chestsRouter } from './routes/chests.js'
import { leaderboardRouter } from './routes/leaderboard.js'
import { usersRouter } from './routes/users.js'
import { seedRouter } from './routes/seed.js'
import { mapRouter } from './routes/map.js'
import { lootItemsRouter } from './routes/lootItems.js'

const app = express()
const PORT = process.env.PORT ?? 3001

// CORS from environment variable (comma-separated list)
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173']
app.use(cors({ origin: corsOrigins }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)
app.use(express.json({ limit: '10mb' }))

app.use('/api/messages', messagesRouter)
app.use('/api/chests', chestsRouter)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/users', usersRouter)
app.use('/api/seed', seedRouter)
app.use('/api/map', mapRouter)
app.use('/api/loot-items', lootItemsRouter)

app.get('/api/health', (_req, res) => {
  try {
    getDb().prepare('SELECT 1').get()
    res.json({ status: 'ok', database: 'connected' })
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' })
  }
})

runMigrations()
// seedDatabase() // Creates mock data

// Global error handler middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
