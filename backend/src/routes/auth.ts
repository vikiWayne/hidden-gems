/**
 * Authentication Routes
 * POST /auth/register - Register new user
 * POST /auth/login - Login user
 * GET /auth/me - Get current user (requires auth)
 * GET /auth/check-username - Check username availability
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  parseRegisterBody,
  parseLoginBody,
  parseUsernameQuery,
} from "../middleware/validators.js";
import {
  register,
  login,
  getCurrentUser,
  checkUsernameAvailable,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

// No auth required
authRouter.post(
  "/register",
  validate("body", parseRegisterBody),
  asyncHandler(register),
);
authRouter.post(
  "/login",
  validate("body", parseLoginBody),
  asyncHandler(login),
);
authRouter.get(
  "/check-username",
  validate("query", parseUsernameQuery),
  asyncHandler(checkUsernameAvailable),
);

// Auth required
authRouter.get("/me", authenticateToken, asyncHandler(getCurrentUser));
