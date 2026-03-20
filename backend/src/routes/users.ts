import { Router } from 'express'
import { getMyItemsController, searchUsersController } from '../controllers/users.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import { parseSearchUsersQuery, parseUserIdQuery } from '../middleware/validators.js'

export const usersRouter = Router()

usersRouter.get('/me/items', validate('query', parseUserIdQuery), asyncHandler(getMyItemsController))
usersRouter.get('/search', validate('query', parseSearchUsersQuery), asyncHandler(searchUsersController))
