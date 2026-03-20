import type { RequestHandler } from 'express'
import { messagesService } from '../services/messages.service.js'

export const getNearbyMessagesController: RequestHandler = (req, res) => {
  const { lat, lng, alt, userId } = res.locals.validated.query as { lat: number; lng: number; alt?: number; userId?: string }
  const messages = messagesService.getNearby(lat, lng, alt, userId)
  res.json({ messages })
}

export const createMessageController: RequestHandler = (req, res) => {
  const payload = res.locals.validated.body as Parameters<typeof messagesService.create>[0]
  const message = messagesService.create(payload)
  res.status(201).json({ message: { id: message.id } })
}

export const getMessageController: RequestHandler = (req, res) => {
  const { id } = res.locals.validated.params as { id: string }
  const { lat, lng, userId } = res.locals.validated.query as { lat: number; lng: number; userId?: string }
  const result = messagesService.getById(id, lat, lng, userId)
  res.json(result)
}

export const updateMessageController: RequestHandler = (req, res) => {
  const { id } = res.locals.validated.params as { id: string }
  const payload = res.locals.validated.body as Parameters<typeof messagesService.update>[1]
  const updated = messagesService.update(id, payload)
  res.json({ message: updated })
}

export const deleteMessageController: RequestHandler = (req, res) => {
  const { id } = res.locals.validated.params as { id: string }
  const { userId } = res.locals.validated.query as { userId: string }
  messagesService.remove(id, userId)
  res.status(204).send()
}
