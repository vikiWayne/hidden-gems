export const ERROR_MESSAGE_MAP = {
  INTERNAL_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation failed",
  NOT_FOUND: "Resource not found",
  FORBIDDEN: "Forbidden",
  UNAUTHORIZED: "Unauthorized",
  AUTH_NO_TOKEN: "No token provided",
  AUTH_INVALID_TOKEN: "Invalid or expired token",
  AUTH_NOT_AUTHENTICATED: "Not authenticated",
  AUTH_INVALID_CREDENTIALS: "Invalid username or password",
  AUTH_MISSING_CREDENTIALS: "Username and password are required",
  AUTH_PASSWORD_WEAK: "Password must be at least 8 characters",
  AUTH_USERNAME_TAKEN: "Username already taken",
  AUTH_FIELD_REQUIRED: "Username, password, and full name are required",
  MESSAGES_UNAUTHORIZED_UPDATE: "You can only update your own messages",
  MESSAGES_UNAUTHORIZED_DELETE: "You can only delete your own messages",
  CHESTS_UNAUTHORIZED_DELETE: "You can only delete your own chests",
  SERVICE_UNAVAILABLE: "Service unavailable",
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGE_MAP;

export function getErrorMessage(code: ErrorCode, fallback?: string): string {
  return (
    ERROR_MESSAGE_MAP[code] ?? fallback ?? ERROR_MESSAGE_MAP.INTERNAL_ERROR
  );
}
