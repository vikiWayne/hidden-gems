import { Router } from 'express'
import { searchUsers } from '../db/repositories/users.repository.js'
import { getMessagesByCreator } from '../db/repositories/messages.repository.js'
import { getChestsByCreator } from '../db/repositories/chests.repository.js'
import { getFoundItemsByUser } from '../db/repositories/discoveries.repository.js'

export const usersRouter = Router()

usersRouter.get('/me/items', (req, res) => {
  const userId = req.query.userId as string | undefined
  if (!userId) return res.status(400).json({ message: 'userId required' })
  const createdMessages = getMessagesByCreator(userId)
  const createdChests = getChestsByCreator(userId)
  const { chests: foundChests, loot: foundLoot } = getFoundItemsByUser(userId)
  res.json({
    createdMessages,
    createdChests,
    foundChests,
    foundLoot,
  })
})

usersRouter.get('/search', (req, res) => {
  const q = (req.query.q as string) ?? ''
  const limit = Math.min(20, parseInt(req.query.limit as string) || 5)
  const users = searchUsers(q, limit)
  res.json({ users })
})
