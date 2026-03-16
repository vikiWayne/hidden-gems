import { Router } from 'express'
import { createChest, getNearbyChests, deleteChest } from '../db/repositories/chests.repository.js'
import { recordChestDiscovery } from '../db/repositories/discoveries.repository.js'

export const chestsRouter = Router()

chestsRouter.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat as string)
  const lng = parseFloat(req.query.lng as string)

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ message: 'Invalid lat/lng' })
  }

  const userId = req.query.userId as string | undefined
  const chests = getNearbyChests(lat, lng, userId)
  res.json({ chests })
})

chestsRouter.post('/', (req, res) => {
  const {
    content,
    latitude,
    longitude,
    altitude,
    xpReward,
    coinReward,
    variant,
    createdBy,
  } = req.body

  if (!content || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'content, latitude, longitude required' })
  }

  const validVariant = variant === 'snake' ? 'snake' : 'normal'

  const chest = createChest({
    content: String(content),
    latitude: Number(latitude),
    longitude: Number(longitude),
    altitude: altitude != null ? Number(altitude) : undefined,
    xpReward: Number(xpReward) || 25,
    coinReward: coinReward != null ? Number(coinReward) : undefined,
    variant: validVariant,
    createdBy: createdBy ? String(createdBy) : undefined,
  })

  res.status(201).json({ chest: { id: chest.id } })
})

chestsRouter.post('/:id/claim', (req, res) => {
  const userId = req.body.userId as string | undefined
  if (!userId) return res.status(400).json({ message: 'userId required' })
  const result = recordChestDiscovery(userId, req.params.id)
  if (!result) return res.status(400).json({ message: 'Chest not found or already claimed' })
  res.json({ ok: true, finderOrdinal: result.finderOrdinal })
})

chestsRouter.delete('/:id', (req, res) => {
  const userId = req.query.userId as string | undefined
  if (!userId) return res.status(400).json({ message: 'userId required' })
  const ok = deleteChest(req.params.id, userId)
  if (!ok) return res.status(403).json({ message: 'Forbidden or not found' })
  res.status(204).send()
})
