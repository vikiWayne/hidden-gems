-- Discoveries: track when users find items (chests, loot) with finder ordinal
CREATE TABLE IF NOT EXISTS discoveries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('chest', 'loot')),
  item_id TEXT NOT NULL,
  finder_ordinal INTEGER NOT NULL,
  found_at TEXT NOT NULL,
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_discoveries_user ON discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_discoveries_item ON discoveries(item_type, item_id);
