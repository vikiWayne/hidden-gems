/**
 * Leaderboard service response types
 */

import type { APISuccessResponse } from "@/api/types/common";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  discovered: number;
  chestsFound: number;
}

export type LeaderBoardResponse = APISuccessResponse<LeaderboardEntry[]>;
