import { randomUUID } from 'crypto'
import type { RequestHandler } from 'express'
import { logger } from '../lib/logger.js'

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now()
  const requestId = randomUUID()
  res.locals.requestId = requestId

  res.on('finish', () => {
    logger.info('request_completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    })
  })

  next()
}
