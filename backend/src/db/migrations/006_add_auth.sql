-- Add authentication fields to users table
-- Migration: Add password_hash and full_name columns for user authentication

ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Add UNIQUE constraint on username (case-insensitive comparison)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(LOWER(username));
