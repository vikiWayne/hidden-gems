import express from 'express'
import cors from 'cors'
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

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
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
seedDatabase()

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
