import type { RequestHandler } from "express";
import { leaderboardService } from "../services/leaderboard.service.js";
import { sendSuccess } from "../lib/response.js";

export const listLeaderboardController: RequestHandler = (_req, res) => {
  return sendSuccess(200, res, { leaderboard: leaderboardService.list() });
};
