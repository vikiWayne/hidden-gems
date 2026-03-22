/**
 * Authentication Service
 * Handles user registration, login, password hashing, and JWT token generation
 */
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import {
  createUser,
  getUserByUsername,
  getUserById,
} from "../db/repositories/users.repository.js";
import { AppError, ValidationError } from "../lib/errors.js";
import { getErrorMessage } from "../config/errorMessages.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // process.env.JWT_EXPIRES_IN || "7d";

export interface AuthUser {
  userId: string;
  username: string;
  fullName: string;
}

export interface AuthToken {
  token: string;
  userId: string;
  user: AuthUser;
}

export const authService = {
  /**
   * Register a new user
   */
  async registerUser(
    username: string,
    password: string,
    fullName: string,
  ): Promise<AuthToken> {
    // Validate input
    if (!username || !password || !fullName) {
      throw new ValidationError(getErrorMessage("AUTH_FIELD_REQUIRED"));
    }

    if (password.length < 8) {
      throw new ValidationError(getErrorMessage("AUTH_PASSWORD_WEAK"));
    }

    // Check if username already exists
    const existingUser = getUserByUsername(username);
    if (existingUser) {
      throw new ValidationError(getErrorMessage("AUTH_USERNAME_TAKEN"));
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user
    const userId = randomUUID();
    createUser(userId, username, passwordHash, fullName);

    // Generate token
    const user: AuthUser = { userId, username, fullName };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { token, userId, user };
  },

  /**
   * Login user with username and password
   */
  async login(username: string, password: string): Promise<AuthToken> {
    if (!username || !password) {
      throw new ValidationError(getErrorMessage("AUTH_MISSING_CREDENTIALS"));
    }

    const user = getUserByUsername(username);
    if (!user) {
      throw new AppError(
        getErrorMessage("AUTH_INVALID_CREDENTIALS"),
        401,
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    // Verify password
    const validPassword = await bcryptjs.compare(
      password,
      user.passwordHash as string,
    );
    if (!validPassword) {
      throw new AppError(
        getErrorMessage("AUTH_INVALID_CREDENTIALS"),
        401,
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    // Generate token
    const authUser: AuthUser = {
      userId: user.id,
      username: user.username,
      fullName: user.fullName as string,
    };
    const token = jwt.sign(authUser, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { token, userId: user.id, user: authUser };
  },

  /**
   * Verify JWT token
   */
  verifyToken(token: string): AuthUser {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      return decoded;
    } catch (err) {
      throw new AppError(
        getErrorMessage("AUTH_INVALID_TOKEN"),
        401,
        "AUTH_INVALID_TOKEN",
      );
    }
  },

  /**
   * Check if username is available
   */
  checkUsernameAvailable(username: string): boolean {
    if (!username) return false;
    const user = getUserByUsername(username);
    return !user;
  },

  /**
   * Get current user by userId
   */
  getCurrentUser(userId: string): AuthUser | null {
    const user = getUserById(userId);
    if (!user) return null;
    return {
      userId: user.id,
      username: user.username,
      fullName: user.fullName as string,
    };
  },
};
