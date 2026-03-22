/**
 * Authentication Controller
 * Handles registration, login, token verification, and username availability checks
 */
import type { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { authService } from "../services/auth.service.js";
import { sendSuccess } from "../lib/response.js";
import { AppError } from "../lib/errors.js";
import { getErrorMessage } from "../config/errorMessages.js";

/**
 * Register a new user
 * POST /auth/register
 * Body: { username, password, fullName }
 */
export const register: RequestHandler = async (req, res) => {
  const { username, password, fullName } = res.locals.validated.body as {
    username: string;
    password: string;
    fullName: string;
  };

  const result = await authService.registerUser(username, password, fullName);

  return sendSuccess(201, res, result);
};

/**
 * Login user
 * POST /auth/login
 * Body: { username, password }
 */
export const login: RequestHandler = async (req, res) => {
  const { username, password } = res.locals.validated.body as {
    username: string;
    password: string;
  };

  const result = await authService.login(username, password);

  return sendSuccess(200, res, result);
};

/**
 * Get current user profile
 * GET /auth/me
 * Requires: Authorization header with Bearer token
 */
export const getCurrentUser: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  if (!req.user) {
    throw new AppError(
      getErrorMessage("AUTH_NOT_AUTHENTICATED"),
      401,
      "AUTH_NOT_AUTHENTICATED",
    );
  }

  return sendSuccess(200, res, req.user);
};

/**
 * Check if username is available
 * GET /auth/check-username?username=<username>
 * No auth required
 */
export const checkUsernameAvailable: RequestHandler = (req, res) => {
  const { username } = res.locals.validated.query as { username: string };

  const available = authService.checkUsernameAvailable(username);

  return sendSuccess(200, res, {
    username,
    available,
  });
};
