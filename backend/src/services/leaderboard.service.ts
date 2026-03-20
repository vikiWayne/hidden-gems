import { getLeaderboard } from '../db/repositories/leaderboard.repository.js'

export const leaderboardService = {
  list() {
    return getLeaderboard()
  },
}
