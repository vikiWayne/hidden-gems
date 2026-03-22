import type { ErrorRequestHandler } from "express";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { getErrorMessage } from "../config/errorMessages.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = res.locals.requestId as string | undefined;

  if (err instanceof AppError) {
    logger.warn("request_failed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      status: "error",
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
  }

  logger.error("unhandled_error", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    error: err instanceof Error ? err.message : String(err),
  });

  res.status(500).json({
    status: "error",
    error: {
      code: "INTERNAL_ERROR",
      message: getErrorMessage("INTERNAL_ERROR"),
      requestId,
    },
  });
};
