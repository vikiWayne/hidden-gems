import { Router } from 'express'
import { getLeaderboard } from '../db/repositories/leaderboard.repository.js'

export const leaderboardRouter = Router()

leaderboardRouter.get('/', (_, res) => {
  const entries = getLeaderboard()
  res.json({ leaderboard: entries })
})
