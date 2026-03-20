import { Router } from 'express'
import { createLootItemController } from '../controllers/lootItems.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import { parseCreateLootBody } from '../middleware/validators.js'

export const lootItemsRouter = Router()

lootItemsRouter.post('/', validate('body', parseCreateLootBody), asyncHandler(createLootItemController))
