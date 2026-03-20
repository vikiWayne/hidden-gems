import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import { parseClaimBody, parseCreateChestBody, parseIdParams, parseNearbyQuery, parseUserIdQuery } from '../middleware/validators.js'
import {
  claimChestController,
  createChestController,
  deleteChestController,
  getNearbyChestsController,
} from '../controllers/chests.controller.js'

export const chestsRouter = Router()

chestsRouter.get('/nearby', validate('query', parseNearbyQuery), asyncHandler(getNearbyChestsController))
chestsRouter.post('/', validate('body', parseCreateChestBody), asyncHandler(createChestController))
chestsRouter.post('/:id/claim', validate('params', parseIdParams), validate('body', parseClaimBody), asyncHandler(claimChestController))
chestsRouter.delete('/:id', validate('params', parseIdParams), validate('query', parseUserIdQuery), asyncHandler(deleteChestController))
