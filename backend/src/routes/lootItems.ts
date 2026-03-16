import { Router } from 'express'
import { createLootItem } from '../db/repositories/lootItems.repository.js'
import { LOOT_ITEM_CONFIG } from '../config/items.config.js'
import type { LootItemType } from '../config/items.config.js'

export const lootItemsRouter = Router()

const VALID_LOOT_TYPES = Object.keys(LOOT_ITEM_CONFIG) as LootItemType[]

lootItemsRouter.post('/', (req, res) => {
  const {
    type,
    content,
    latitude,
    longitude,
    altitude,
    xpReward,
    coinReward,
    createdBy,
  } = req.body

  if (!content || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({
      message: 'content, latitude, longitude required',
    })
  }

  const config = LOOT_ITEM_CONFIG[type as LootItemType]
  const validType = VALID_LOOT_TYPES.includes(type as LootItemType)
    ? (type as LootItemType)
    : 'diamond'

  const item = createLootItem({
    type: validType,
    content: String(content),
    latitude: Number(latitude),
    longitude: Number(longitude),
    altitude: altitude != null ? Number(altitude) : undefined,
    xpReward: xpReward != null ? Number(xpReward) : config.xpReward,
    coinReward: coinReward != null ? Number(coinReward) : config.coinReward,
    createdBy: createdBy ? String(createdBy) : undefined,
  })

  res.status(201).json({ lootItem: { id: item.id } })
})
