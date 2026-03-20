import { getItemRating, rateItem } from '../db/repositories/ratings.repository.js'

export const ratingsService = {
  rate(userId: string, itemType: 'message' | 'chest' | 'loot', itemId: string, rating: number) {
    return rateItem(userId, itemType, itemId, rating)
  },
  get(itemType: 'message' | 'chest' | 'loot', itemId: string) {
    return getItemRating(itemType, itemId)
  },
}
