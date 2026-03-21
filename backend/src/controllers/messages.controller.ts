import type { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { messagesService } from "../services/messages.service.js";

export const getNearbyMessagesController: RequestHandler = (req, res) => {
  const { lat, lng, alt, userId } = res.locals.validated.query as {
    lat: number;
    lng: number;
    alt?: number;
    userId?: string;
  };
  const messages = messagesService.getNearby(lat, lng, alt, userId);
  res.json({ messages });
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
  res.status(201).json({ message: { id: message.id } });
};

export const getMessageController: RequestHandler = (req, res) => {
  const { id } = res.locals.validated.params as { id: string };
  const { lat, lng, userId } = res.locals.validated.query as {
    lat: number;
    lng: number;
    userId?: string;
  };
  const result = messagesService.getById(id, lat, lng, userId);
  res.json(result);
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
    return res
      .status(403)
      .json({ error: "Unauthorized: You can only update your own messages" });
  }
  const updated = messagesService.update(id, payload);
  res.json({ message: updated });
};

export const deleteMessageController: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  const { id } = res.locals.validated.params as { id: string };
  // Verify ownership
  if (!messagesService.isOwner(id, req.userId!)) {
    return res
      .status(403)
      .json({ error: "Unauthorized: You can only delete your own messages" });
  }
  messagesService.remove(id, req.userId!);
  res.status(204).send();
};
