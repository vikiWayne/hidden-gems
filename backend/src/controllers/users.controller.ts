import type { RequestHandler } from 'express'
import { usersService } from '../services/users.service.js'

export const getMyItemsController: RequestHandler = (_req, res) => {
  const { userId } = res.locals.validated.query as { userId: string }
  res.json(usersService.getMeItems(userId))
}

export const searchUsersController: RequestHandler = (_req, res) => {
  const { q, limit } = res.locals.validated.query as { q: string; limit: number }
  const users = usersService.search(q, limit)
  res.json({ users })
}
