import { Router } from 'express'
import { rateItem, getItemRating } from '../db/repositories/ratings.repository.js'

export const ratingsRouter = Router()

ratingsRouter.post('/', (req, res) => {
  const { userId, itemType, itemId, rating } = req.body
  if (!userId || !itemType || !itemId || !rating || typeof rating !== 'number') {
    return res.status(400).json({ error: 'Missing required fields or invalid rating' })
  }
  const result = rateItem(userId, itemType, itemId, rating)
  res.json(result)
})

ratingsRouter.get('/:itemType/:itemId', (req, res) => {
  const { itemType, itemId } = req.params as { itemType: 'message'|'chest'|'loot', itemId: string }
  const result = getItemRating(itemType, itemId)
  res.json(result)
})
