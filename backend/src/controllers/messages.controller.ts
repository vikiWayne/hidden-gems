import type { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { messagesService } from "../services/messages.service.js";
import { sendSuccess } from "../lib/response.js";
import { ForbiddenError } from "../lib/errors.js";
import { getErrorMessage } from "../config/errorMessages.js";

export const getNearbyMessagesController: RequestHandler = (req, res) => {
  const { lat, lng, alt, userId } = res.locals.validated.query as {
    lat: number;
    lng: number;
    alt?: number;
    userId?: string;
  };
  const messages = messagesService.getNearby(lat, lng, alt, userId);
  return sendSuccess(200, res, { messages });
};

export const createMessageController: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  const payload = res.locals.validated.body as Parameters<
    typeof messagesService.create
  >[0];
  // Override createdBy with authenticated userId
  payload.createdBy = req.userId;
  const message = messagesService.create(payload);
  return sendSuccess(201, res, { message: { id: message.id } });
};

export const getMessageController: RequestHandler = (req, res) => {
  const { id } = res.locals.validated.params as { id: string };
  const { lat, lng, userId } = res.locals.validated.query as {
    lat: number;
    lng: number;
    userId?: string;
  };
  const result = messagesService.getById(id, lat, lng, userId);
  return sendSuccess(200, res, result);
};

export const updateMessageController: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  const { id } = res.locals.validated.params as { id: string };
  const payload = res.locals.validated.body as Parameters<
    typeof messagesService.update
  >[1];
  // Verify ownership
  if (!messagesService.isOwner(id, req.userId!)) {
    throw new ForbiddenError(getErrorMessage("MESSAGES_UNAUTHORIZED_UPDATE"));
  }
  const updated = messagesService.update(id, payload);
  return sendSuccess(200, res, { message: updated });
};

export const deleteMessageController: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  const { id } = res.locals.validated.params as { id: string };
  // Verify ownership
  if (!messagesService.isOwner(id, req.userId!)) {
    throw new ForbiddenError(getErrorMessage("MESSAGES_UNAUTHORIZED_DELETE"));
  }
  messagesService.remove(id, req.userId!);
  return sendSuccess(204, res, null);
};
