/**
 * Authentication Controller
 * Handles registration, login, token verification, and username availability checks
 */
import type { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { authService } from "../services/auth.service.js";

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

  // Register user
  const result = await authService.registerUser(username, password, fullName);

  return res.status(201).json({
    userId: result.userId,
    token: result.token,
    user: result.user,
  });
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

  return res.status(200).json({
    userId: result.userId,
    token: result.token,
    user: result.user,
  });
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
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.status(200).json(req.user);
};

/**
 * Check if username is available
 * GET /auth/check-username?username=<username>
 * No auth required
 */
export const checkUsernameAvailable: RequestHandler = (req, res) => {
  const { username } = res.locals.validated.query as { username: string };

  const available = authService.checkUsernameAvailable(username);

  return res.status(200).json({
    username,
    available,
  });
};
