import { Router } from 'express'
import { createMessage, getNearbyMessages, getMessage, updateMessage, deleteMessage } from '../db/repositories/messages.repository.js'

export const messagesRouter = Router()

// Unused route in FE
messagesRouter.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat as string)
  const lng = parseFloat(req.query.lng as string)
  const alt = req.query.alt != null ? parseFloat(req.query.alt as string) : undefined
  const userId = req.query.userId as string | undefined

  // Validate coordinates
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Invalid lat/lng. Lat must be -90 to 90, Lng must be -180 to 180' })
  }

  const messages = getNearbyMessages(lat, lng, alt, userId)
  res.json({ messages })
})

messagesRouter.post('/', (req, res) => {
  const { type, content, mediaUrl, latitude, longitude, altitude, visibility, allowedUserIds, category, createdBy, markerColor } = req.body

  // Validate required fields
  if (!content || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'content, latitude, longitude required' })
  }

  // Validate coordinates
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid coordinates. Lat must be -90 to 90, Lng must be -180 to 180' })
  }

  const validColors = ['purple', 'orange', 'green', 'gold', 'teal', 'blue', 'red', 'pink']
  const color = validColors.includes(markerColor) ? markerColor : undefined

  const message = createMessage({
    type: ['text', 'voice', 'image', 'video'].includes(type) ? type : 'text',
    content: String(content),
    mediaUrl: mediaUrl ? String(mediaUrl) : undefined,
    latitude: Number(latitude),
    longitude: Number(longitude),
    altitude: altitude != null ? Number(altitude) : undefined,
    visibility: visibility === 'private' ? 'private' : 'public',
    allowedUserIds: Array.isArray(allowedUserIds) ? allowedUserIds : [],
    category: category ? String(category) : undefined,
    createdBy: createdBy ? String(createdBy) : undefined,
    markerColor: color,
  })

  res.status(201).json({ message: { id: message.id } })
})

messagesRouter.get('/:id', (req, res) => {
  const lat = parseFloat(req.query.lat as string)
  const lng = parseFloat(req.query.lng as string)
  const userId = req.query.userId as string | undefined

  // Validate coordinates
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Invalid lat/lng. Lat must be -90 to 90, Lng must be -180 to 180' })
  }

  const result = getMessage(req.params.id, lat, lng, userId)
  if (!result) {
    return res.status(404).json({ error: 'Message not found' })
  }

  if (userId && result.unlocked) {
    import('../db/repositories/discoveries.repository.js').then(m => {
      m.recordMessageDiscovery(userId, req.params.id)
    }).catch(err => {
      console.error('Error importing discoveries repository:', err)
    })
  }

  res.json(result)
})

messagesRouter.patch('/:id', (req, res) => {
  const { content, visibility, allowedUserIds, category, markerColor } = req.body
  const validColors = ['purple', 'orange', 'green', 'gold', 'teal', 'blue', 'red', 'pink']
  const updated = updateMessage(req.params.id, {
    ...(content != null && { content: String(content) }),
    ...(visibility != null && { visibility: visibility === 'private' ? 'private' : 'public' }),
    ...(allowedUserIds != null && { allowedUserIds: Array.isArray(allowedUserIds) ? allowedUserIds : [] }),
    ...(category != null && { category: String(category) }),
    ...(markerColor != null && validColors.includes(markerColor) && { markerColor }),
  })
  if (!updated) return res.status(404).json({ error: 'Message not found' })
  res.json({ message: updated })
})

messagesRouter.delete('/:id', (req, res) => {
  const userId = req.query.userId as string | undefined
  if (!userId) return res.status(400).json({ error: 'userId required' })
  const ok = deleteMessage(req.params.id, userId)
  if (!ok) return res.status(403).json({ error: 'Forbidden or not found' })
  res.status(204).send()
})
