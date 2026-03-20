import type { ErrorRequestHandler } from 'express'
import { AppError } from '../lib/errors.js'
import { logger } from '../lib/logger.js'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = res.locals.requestId as string | undefined

  if (err instanceof AppError) {
    logger.warn('request_failed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    })
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    })
    return
  }

  logger.error('unhandled_error', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    error: err instanceof Error ? err.message : String(err),
  })

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      requestId,
    },
  })
}
