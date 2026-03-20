import { Router } from 'express'
import { seedNearbyController } from '../controllers/seed.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import { parseSeedBody } from '../middleware/validators.js'

export const seedRouter = Router()

seedRouter.post('/', validate('body', parseSeedBody), asyncHandler(seedNearbyController))
