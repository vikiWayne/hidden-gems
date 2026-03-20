import type { RequestHandler } from 'express'
import { ratingsService } from '../services/ratings.service.js'

export const rateItemController: RequestHandler = (_req, res) => {
  const { userId, itemType, itemId, rating } = res.locals.validated.body as {
    userId: string
    itemType: 'message' | 'chest' | 'loot'
    itemId: string
    rating: number
  }
  const result = ratingsService.rate(userId, itemType, itemId, rating)
  res.json(result)
}

export const getItemRatingController: RequestHandler = (_req, res) => {
  const { itemType, itemId } = res.locals.validated.params as { itemType: 'message' | 'chest' | 'loot'; itemId: string }
  const result = ratingsService.get(itemType, itemId)
  res.json(result)
}
