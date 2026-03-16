/**
 * Seed initial data: India messages, mock users, mock leaderboard.
 */
import { getDb } from './connection.js'

const INDIA_SEED_MESSAGES: Array<{ lat: number; lng: number; content: string; markerColor?: string }> = [
  { lat: 28.6139, lng: 77.209, content: 'Best chai at this corner! Ask for masala.', markerColor: 'orange' },
  { lat: 28.6139, lng: 77.215, content: 'Secret rooftop view of India Gate — sunset is magical', markerColor: 'purple' },
  { lat: 19.076, lng: 72.8777, content: 'Marine Drive bench — perfect for stargazing', markerColor: 'blue' },
  { lat: 19.076, lng: 72.882, content: 'Hidden vada pav stall, best in Mumbai!', markerColor: 'red' },
  { lat: 13.0827, lng: 80.2707, content: 'Filter coffee paradise — try the degree coffee', markerColor: 'gold' },
  { lat: 13.0827, lng: 80.275, content: 'Ancient temple nearby, peaceful at dawn', markerColor: 'teal' },
  { lat: 12.9716, lng: 77.5946, content: 'Tech park shortcut — saves 10 min walk', markerColor: 'green' },
  { lat: 12.9716, lng: 77.599, content: 'Quiet cafe with great WiFi for remote work', markerColor: 'pink' },
  { lat: 22.5726, lng: 88.3639, content: "Best rosogolla in the city — you're welcome!", markerColor: 'orange' },
  { lat: 22.5726, lng: 88.368, content: 'Colonial building with amazing architecture', markerColor: 'purple' },
  { lat: 26.8467, lng: 80.9462, content: 'Street food heaven — try the chaat!', markerColor: 'red' },
  { lat: 17.385, lng: 78.4867, content: 'Biryani spot — legendary taste', markerColor: 'gold' },
  { lat: 23.0225, lng: 72.5714, content: 'Sabarmati riverfront — great for evening walks', markerColor: 'blue' },
  { lat: 26.9124, lng: 75.7873, content: 'Hawa Mahal view from this rooftop cafe', markerColor: 'pink' },
  { lat: 9.9312, lng: 76.2673, content: 'Backwaters start here — serene boat rides', markerColor: 'teal' },
  { lat: 15.2993, lng: 74.124, content: 'Spice market — best prices in Goa', markerColor: 'orange' },
  { lat: 11.0168, lng: 76.9558, content: 'Hill station trail — misty mornings', markerColor: 'green' },
  { lat: 34.0837, lng: 74.7973, content: 'Dal Lake shikara — magical experience', markerColor: 'blue' },
  { lat: 30.7333, lng: 76.7794, content: 'Rock Garden — hidden art paradise', markerColor: 'purple' },
  { lat: 25.5941, lng: 85.1376, content: 'Buddhist ruins nearby — peaceful meditation spot', markerColor: 'teal' },
]

const MOCK_USERS = [
  { id: 'user-1', username: 'Alex' },
  { id: 'user-2', username: 'Riya' },
  { id: 'user-3', username: 'Jordan' },
  { id: 'user-4', username: 'Sam' },
  { id: 'user-5', username: 'Taylor' },
  { id: 'user-6', username: 'GeoNinja' },
  { id: 'user-7', username: 'Pathfinder' },
  { id: 'user-8', username: 'AdventureAwaits' },
  { id: 'user-9', username: 'QuestComplete' },
  { id: 'user-10', username: 'NewExplorer' },
]

const MOCK_LEADERBOARD = [
  { userId: 'user-1', username: 'ExplorerMax', xp: 2840, discovered: 127, chestsFound: 23 },
  { userId: 'user-2', username: 'ChestHunter99', xp: 2650, discovered: 98, chestsFound: 31 },
  { userId: 'user-3', username: 'MapMaster', xp: 2420, discovered: 156, chestsFound: 18 },
  { userId: 'user-4', username: 'TreasureSeeker', xp: 2180, discovered: 89, chestsFound: 25 },
  { userId: 'user-5', username: 'Wanderlust', xp: 1950, discovered: 72, chestsFound: 19 },
  { userId: 'user-6', username: 'GeoNinja', xp: 1720, discovered: 64, chestsFound: 14 },
  { userId: 'user-7', username: 'Pathfinder', xp: 1480, discovered: 51, chestsFound: 12 },
  { userId: 'user-8', username: 'AdventureAwaits', xp: 1250, discovered: 43, chestsFound: 9 },
  { userId: 'user-9', username: 'QuestComplete', xp: 980, discovered: 38, chestsFound: 7 },
  { userId: 'user-10', username: 'NewExplorer', xp: 650, discovered: 22, chestsFound: 4 },
]

export function seedDatabase(): void {
  const db = getDb()
  const now = new Date().toISOString()

  const existingMessages = db.prepare(`SELECT COUNT(*) as c FROM messages`).get() as { c: number }
  if (existingMessages.c === 0) {
    INDIA_SEED_MESSAGES.forEach((s, i) => {
      db.prepare(
        `INSERT INTO messages (id, type, content, latitude, longitude, visibility, allowed_user_ids, marker_color, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        `india-seed-${i}`,
        'text',
        s.content,
        s.lat + (Math.random() - 0.5) * 0.002,
        s.lng + (Math.random() - 0.5) * 0.002,
        'public',
        '[]',
        s.markerColor ?? null,
        now
      )
    })
    console.log('[db] Seeded India messages')
  }

  const userCount = db.prepare(`SELECT COUNT(*) as c FROM users`).get() as { c: number }
  if (userCount.c === 0) {
    for (const u of MOCK_USERS) {
      db.prepare(`INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)`).run(u.id, u.username, now)
    }
    console.log('[db] Seeded mock users')
  }

  const leaderboardCount = db.prepare(`SELECT COUNT(*) as c FROM leaderboard`).get() as { c: number }
  if (leaderboardCount.c === 0) {
    for (const e of MOCK_LEADERBOARD) {
      db.prepare(
        `INSERT INTO leaderboard (user_id, username, xp, discovered, chests_found, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
      ).run(e.userId, e.username, e.xp, e.discovered, e.chestsFound, now)
    }
    console.log('[db] Seeded leaderboard')
  }
}
