import type { RequestHandler } from 'express'
import { lootItemsService } from '../services/lootItems.service.js'

export const createLootItemController: RequestHandler = (_req, res) => {
  const payload = res.locals.validated.body as Parameters<typeof lootItemsService.create>[0]
  const item = lootItemsService.create(payload)
  res.status(201).json({ lootItem: { id: item.id } })
}
