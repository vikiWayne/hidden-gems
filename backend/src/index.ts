import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { closeDb } from './db/connection.js'
import { runMigrations } from './db/migrate.js'
import { messagesRouter } from './routes/messages.js'
import { chestsRouter } from './routes/chests.js'
import { leaderboardRouter } from './routes/leaderboard.js'
import { usersRouter } from './routes/users.js'
import { seedRouter } from './routes/seed.js'
import { mapRouter } from './routes/map.js'
import { lootItemsRouter } from './routes/lootItems.js'
import { ratingsRouter } from './routes/ratings.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import { healthController } from './controllers/health.controller.js'
import { logger } from './lib/logger.js'
import { seedDatabase } from './db/seed.js'

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
// app.use('/api', limiter)
app.use(express.json({ limit: '10mb' }))
app.use(requestLogger)

app.use('/api/messages', messagesRouter)
app.use('/api/chests', chestsRouter)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/users', usersRouter)
app.use('/api/seed', seedRouter)
app.use('/api/map', mapRouter)
app.use('/api/loot-items', lootItemsRouter)
app.use('/api/ratings', ratingsRouter)

app.get('/api/health', healthController)

runMigrations()
seedDatabase() // Optional local mock data

app.use(errorHandler)

const server = app.listen(PORT, () => {
  logger.info('server_started', { port: PORT })
})

function shutdown(signal: string): void {
  logger.info('server_shutdown_started', { signal })
  server.close(() => {
    closeDb()
    logger.info('server_shutdown_complete')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
