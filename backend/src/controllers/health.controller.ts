import type { RequestHandler } from "express";
import { getDb } from "../db/connection.js";
import { sendSuccess } from "../lib/response.js";
import { AppError } from "../lib/errors.js";
import { getErrorMessage } from "../config/errorMessages.js";

export const healthController: RequestHandler = (_req, res) => {
  try {
    getDb().prepare("SELECT 1").get();
    return sendSuccess(200, res, { database: "connected" });
  } catch {
    throw new AppError(
      getErrorMessage("INTERNAL_ERROR"),
      503,
      "SERVICE_UNAVAILABLE",
    );
  }
};
