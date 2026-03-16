import { Router } from 'express'
import { createMessage } from '../db/repositories/messages.repository.js'
import { createChest } from '../db/repositories/chests.repository.js'
import { createLootItem } from '../db/repositories/lootItems.repository.js'
import type { LootItemType } from '../config/items.config.js'

/** Approximate meters to lat/lng offset at given latitude */
function metersToOffset(lat: number, meters: number) {
  const latDegPerM = 1 / 111320
  const lngDegPerM = 1 / (111320 * Math.cos((lat * Math.PI) / 180))
  return { lat: meters * latDegPerM, lng: meters * lngDegPerM }
}

const SAMPLE_MESSAGES = [
  'Best tiramisu in the city — ask for the secret menu!',
  'Amazing sunset view from this spot. Come at 6 PM!',
  'Hidden garden entrance — shhh!',
  'Free WiFi here, password: explore2024',
  'Best coffee in town, try the cold brew!',
  'Street art mural around the corner — worth a look',
  'Quiet reading nook, perfect for a break',
  'Local market every Saturday morning',
  'Secret shortcut to the park through here',
  'Best tacos in the neighborhood!',
]

const SAMPLE_CHESTS = [
  { content: 'Golden treasure! +50 XP', xp: 50, variant: 'normal' as const },
  { content: 'Secret stash — you found it!', xp: 30, variant: 'normal' as const },
  { content: 'Rare discovery! +75 XP', xp: 75, variant: 'normal' as const },
  { content: 'Snake inside! Watch out!', xp: 0, variant: 'snake' as const },
  { content: 'Hidden chest! +60 XP', xp: 60, variant: 'normal' as const },
]

const SAMPLE_LOOT: Array<{ type: LootItemType; content: string }> = [
  { type: 'diamond', content: 'Shiny diamond!' },
  { type: 'cash_chest', content: 'Cash reward!' },
  { type: 'loot_box', content: 'Mystery loot!' },
  { type: 'powerup', content: 'Speed boost!' },
  { type: 'bomb', content: 'Boom! Penalty!' },
]

export const seedRouter = Router()

seedRouter.post('/', (req, res) => {
  const lat = parseFloat(req.body.lat as string)
  const lng = parseFloat(req.body.lng as string)

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ message: 'lat and lng required' })
  }

  const created: { messages: number; chests: number; lootItems: number } = {
    messages: 0,
    chests: 0,
    lootItems: 0,
  }

  // Create 6-8 random messages within 50-800m
  const numMessages = 6 + Math.floor(Math.random() * 3)
  for (let i = 0; i < numMessages; i++) {
    const dist = 50 + Math.random() * 750
    const angle = Math.random() * 2 * Math.PI
    const { lat: dLat, lng: dLng } = metersToOffset(lat, dist)
    const mLat = lat + dLat * Math.cos(angle)
    const mLng = lng + dLng * Math.sin(angle)

    const content = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)]!
    createMessage({
      type: 'text',
      content,
      latitude: mLat,
      longitude: mLng,
      visibility: 'public',
      allowedUserIds: [],
    })
    created.messages++
  }

  // Create 3-5 random chests within 80-600m
  const numChests = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < numChests; i++) {
    const dist = 80 + Math.random() * 520
    const angle = Math.random() * 2 * Math.PI
    const { lat: dLat, lng: dLng } = metersToOffset(lat, dist)
    const cLat = lat + dLat * Math.cos(angle)
    const cLng = lng + dLng * Math.sin(angle)

    const sample = SAMPLE_CHESTS[Math.floor(Math.random() * SAMPLE_CHESTS.length)]!
    createChest({
      content: sample.content,
      latitude: cLat,
      longitude: cLng,
      xpReward: sample.xp,
      variant: sample.variant,
    })
    created.chests++
  }

  // Create 2-4 random loot items within 100-500m
  const numLoot = 2 + Math.floor(Math.random() * 3)
  for (let i = 0; i < numLoot; i++) {
    const dist = 100 + Math.random() * 400
    const angle = Math.random() * 2 * Math.PI
    const { lat: dLat, lng: dLng } = metersToOffset(lat, dist)
    const lLat = lat + dLat * Math.cos(angle)
    const lLng = lng + dLng * Math.sin(angle)

    const sample = SAMPLE_LOOT[Math.floor(Math.random() * SAMPLE_LOOT.length)]!
    createLootItem({
      type: sample.type,
      content: sample.content,
      latitude: lLat,
      longitude: lLng,
    })
    created.lootItems++
  }

  res.json({ ok: true, ...created })
})
