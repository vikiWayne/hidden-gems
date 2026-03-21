/**
 * Authentication Middleware
 * Verifies JWT tokens and sets req.userId and req.user on authenticated requests
 */
import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
    username: string;
    fullName: string;
  };
}

/**
 * Middleware to authenticate requests with JWT token
 * Expects Authorization header: "Bearer <token>"
 * Sets req.userId and req.user if token is valid
 * Returns 401 if token is missing or invalid
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const user = authService.verifyToken(token);
    req.userId = user.userId;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't error if no token is provided
 * Useful for routes that work for both authenticated and guest users
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.userId = undefined;
    req.user = undefined;
    return next();
  }

  try {
    const user = authService.verifyToken(token);
    req.userId = user.userId;
    req.user = user;
  } catch (err) {
    // Token is invalid, but we don't error; just continue without auth
    req.userId = undefined;
    req.user = undefined;
  }

  next();
};
