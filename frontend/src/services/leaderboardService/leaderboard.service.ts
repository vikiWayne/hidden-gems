/**
 * Leaderboard service - API calls
 */

import { requests } from "@/api";

export const getLeaderboard = () => {
  return requests.get("/leaderboard");
};
