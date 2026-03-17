-- Item Ratings: users rate items 1-5
CREATE TABLE IF NOT EXISTS item_ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('message', 'chest', 'loot')),
  item_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TEXT NOT NULL,
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_item_ratings_item ON item_ratings(item_type, item_id);
