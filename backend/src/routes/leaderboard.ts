import { Router } from 'express'
import { listLeaderboardController } from '../controllers/leaderboard.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

export const leaderboardRouter = Router()

leaderboardRouter.get('/', asyncHandler(listLeaderboardController))
