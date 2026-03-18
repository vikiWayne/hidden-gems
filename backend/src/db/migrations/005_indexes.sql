-- Performance indexes for frequently queried columns

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_created_by ON messages(created_by);
CREATE INDEX IF NOT EXISTS idx_messages_visibility ON messages(visibility);
CREATE INDEX IF NOT EXISTS idx_messages_lat_lng ON messages(latitude, longitude);

-- Chests table indexes
CREATE INDEX IF NOT EXISTS idx_chests_lat_lng ON chests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_chests_variant ON chests(variant);

-- Loot items table indexes
CREATE INDEX IF NOT EXISTS idx_loot_items_lat_lng ON loot_items(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_loot_items_type ON loot_items(type);

-- Discoveries table indexes
CREATE INDEX IF NOT EXISTS idx_discoveries_user_id ON discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_discoveries_item_type_item_id ON discoveries(item_type, item_id);

-- Message discoveries table indexes
CREATE INDEX IF NOT EXISTS idx_message_discoveries_user_id ON message_discoveries(user_id);

-- Item ratings table indexes
CREATE INDEX IF NOT EXISTS idx_item_ratings_item ON item_ratings(item_type, item_id);