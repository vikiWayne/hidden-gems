import { Router } from 'express'
import { getItemRatingController, rateItemController } from '../controllers/ratings.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import { parseRateItemBody, parseRatingParams } from '../middleware/validators.js'

export const ratingsRouter = Router()

ratingsRouter.post('/', validate('body', parseRateItemBody), asyncHandler(rateItemController))
ratingsRouter.get('/:itemType/:itemId', validate('params', parseRatingParams), asyncHandler(getItemRatingController))
