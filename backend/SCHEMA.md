# Postbox Database Schema

Temporary SQLite schema designed for easy migration to PostgreSQL/PostGIS.

---

## Design Principles

- **PostGIS-ready**: Use `latitude` and `longitude` columns; PostGIS migration adds `geometry(Point, 4326)` from these
- **Parameterized queries**: All queries use `?` placeholders (SQLite) / `$1, $2` (PostgreSQL)
- **JSON for arrays**: `allowed_user_ids` stored as JSON; both SQLite and PostgreSQL support JSON
- **ISO 8601 timestamps**: `created_at` as TEXT (SQLite) / TIMESTAMPTZ (PostgreSQL)

---

## Tables

### `messages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID |
| type | TEXT | NOT NULL, CHECK IN ('text','voice','image','video') | Message type |
| content | TEXT | NOT NULL | Message body |
| media_url | TEXT | | Optional media URL |
| latitude | REAL | NOT NULL | WGS84 latitude |
| longitude | REAL | NOT NULL | WGS84 longitude |
| altitude | REAL | | Optional altitude (meters) |
| visibility | TEXT | NOT NULL, CHECK IN ('public','private') | Visibility |
| allowed_user_ids | TEXT | | JSON array of user IDs (private only) |
| category | TEXT | | Optional category |
| marker_color | TEXT | | Optional marker color |
| created_by | TEXT | | Creator user ID |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**PostGIS migration**: Add `location geometry(Point, 4326)` and populate:
```sql
ALTER TABLE messages ADD COLUMN location geometry(Point, 4326);
UPDATE messages SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
CREATE INDEX idx_messages_location ON messages USING GIST (location);
```

---

### `chests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID |
| content | TEXT | NOT NULL | Chest description |
| latitude | REAL | NOT NULL | WGS84 latitude |
| longitude | REAL | NOT NULL | WGS84 longitude |
| altitude | REAL | | Optional altitude |
| xp_reward | INTEGER | NOT NULL DEFAULT 25 | XP reward |
| coin_reward | INTEGER | | Optional coin reward |
| variant | TEXT | CHECK IN ('normal','snake') | 'snake' = trap |
| created_by | TEXT | | Creator user ID |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**PostGIS migration**: Same pattern as messages.

---

### `loot_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID |
| type | TEXT | NOT NULL | avatar, diamond, cash_chest, loot_box, surprise, powerup, bomb, snake |
| content | TEXT | NOT NULL | Item description |
| latitude | REAL | NOT NULL | WGS84 latitude |
| longitude | REAL | NOT NULL | WGS84 longitude |
| altitude | REAL | | Optional altitude |
| xp_reward | INTEGER | NOT NULL | XP reward |
| coin_reward | INTEGER | NOT NULL | Coin reward |
| is_penalty | INTEGER | DEFAULT 0 | 1 = penalty item |
| created_by | TEXT | | Creator user ID |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

---

### `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | User ID |
| username | TEXT | NOT NULL | Display name |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

---

### `leaderboard`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Row ID |
| user_id | TEXT | NOT NULL | FK to users |
| username | TEXT | NOT NULL | Denormalized for display |
| xp | INTEGER | NOT NULL DEFAULT 0 | Total XP |
| discovered | INTEGER | NOT NULL DEFAULT 0 | Tags discovered |
| chests_found | INTEGER | NOT NULL DEFAULT 0 | Chests opened |
| updated_at | TEXT | NOT NULL | Last update |

---

## Spatial Queries (PostGIS)

### Nearby (radius)

```sql
-- PostGIS: items within radius_m meters
SELECT *, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography) AS distance
FROM messages
WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography, $radius_m)
ORDER BY distance;
```

### Viewport (bounding box)

```sql
-- PostGIS: items in bounding box
SELECT *, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($ref_lng, $ref_lat), 4326)::geography) AS distance
FROM messages
WHERE location && ST_MakeEnvelope($min_lng, $min_lat, $max_lng, $max_lat, 4326)
ORDER BY distance;
```

---

## Indexes (SQLite)

```sql
CREATE INDEX idx_messages_lat_lng ON messages(latitude, longitude);
CREATE INDEX idx_chests_lat_lng ON chests(latitude, longitude);
CREATE INDEX idx_loot_items_lat_lng ON loot_items(latitude, longitude);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_leaderboard_xp ON leaderboard(xp DESC);
```

---

## Migration Checklist (SQLite → PostGIS)

1. Export data or use `pg_dump`-compatible format
2. Create PostgreSQL schema with `geometry(Point, 4326)` columns
3. Populate geometry from `latitude`, `longitude`
4. Create GIST indexes on geometry columns
5. Replace haversine in application with `ST_DWithin` / `ST_Distance`
6. Update connection string and driver (node-postgres)
