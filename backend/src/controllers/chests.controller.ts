import type { RequestHandler } from 'express'
import { chestsService } from '../services/chests.service.js'

export const getNearbyChestsController: RequestHandler = (_req, res) => {
  const { lat, lng, userId } = res.locals.validated.query as { lat: number; lng: number; userId?: string }
  const chests = chestsService.getNearby(lat, lng, userId)
  res.json({ chests })
}

export const createChestController: RequestHandler = (_req, res) => {
  const payload = res.locals.validated.body as Parameters<typeof chestsService.create>[0]
  const chest = chestsService.create(payload)
  res.status(201).json({ chest: { id: chest.id } })
}

export const claimChestController: RequestHandler = (_req, res) => {
  const { id } = res.locals.validated.params as { id: string }
  const { userId } = res.locals.validated.body as { userId: string }
  const result = chestsService.claim(id, userId)
  res.json({ ok: true, finderOrdinal: result.finderOrdinal })
}

export const deleteChestController: RequestHandler = (_req, res) => {
  const { id } = res.locals.validated.params as { id: string }
  const { userId } = res.locals.validated.query as { userId: string }
  chestsService.remove(id, userId)
  res.status(204).send()
}
