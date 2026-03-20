import { Router } from 'express'
import { getMapConfigController, getNearbyMapItemsController, getViewportMapItemsController } from '../controllers/map.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import { parseNearbyQuery, parseViewportQuery } from '../middleware/validators.js'

export const mapRouter = Router()

mapRouter.get('/nearby', validate('query', parseNearbyQuery), asyncHandler(getNearbyMapItemsController))
mapRouter.get('/viewport', validate('query', parseViewportQuery), asyncHandler(getViewportMapItemsController))
mapRouter.get('/config', asyncHandler(getMapConfigController))
