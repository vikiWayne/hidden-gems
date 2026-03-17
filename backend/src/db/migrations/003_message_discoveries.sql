-- Message Discoveries: track when users open messages
CREATE TABLE IF NOT EXISTS message_discoveries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  found_at TEXT NOT NULL,
  UNIQUE(user_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_message_discoveries_user ON message_discoveries(user_id);
