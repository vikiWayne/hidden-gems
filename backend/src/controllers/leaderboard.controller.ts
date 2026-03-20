import type { RequestHandler } from 'express'
import { leaderboardService } from '../services/leaderboard.service.js'

export const listLeaderboardController: RequestHandler = (_req, res) => {
  res.json({ leaderboard: leaderboardService.list() })
}
