-- Postbox initial schema (SQLite)
-- PostGIS migration: add geometry columns and GIST indexes

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'image', 'video')) DEFAULT 'text',
  content TEXT NOT NULL,
  media_url TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  altitude REAL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
  allowed_user_ids TEXT DEFAULT '[]',
  category TEXT,
  marker_color TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_lat_lng ON messages(latitude, longitude);

CREATE TABLE IF NOT EXISTS chests (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  altitude REAL,
  xp_reward INTEGER NOT NULL DEFAULT 25,
  coin_reward INTEGER,
  variant TEXT CHECK (variant IN ('normal', 'snake')) DEFAULT 'normal',
  created_by TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chests_lat_lng ON chests(latitude, longitude);

CREATE TABLE IF NOT EXISTS loot_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  altitude REAL,
  xp_reward INTEGER NOT NULL,
  coin_reward INTEGER NOT NULL,
  is_penalty INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_loot_items_lat_lng ON loot_items(latitude, longitude);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  discovered INTEGER NOT NULL DEFAULT 0,
  chests_found INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard(xp DESC);
