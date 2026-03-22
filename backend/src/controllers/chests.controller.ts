import type { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { chestsService } from "../services/chests.service.js";
import { sendSuccess } from "../lib/response.js";
import { ForbiddenError } from "../lib/errors.js";
import { getErrorMessage } from "../config/errorMessages.js";

export const getNearbyChestsController: RequestHandler = (_req, res) => {
  const { lat, lng, userId } = res.locals.validated.query as {
    lat: number;
    lng: number;
    userId?: string;
  };
  const chests = chestsService.getNearby(lat, lng, userId);
  return sendSuccess(200, res, { chests });
};

export const createChestController: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  const payload = res.locals.validated.body as Parameters<
    typeof chestsService.create
  >[0];
  // Override createdBy with authenticated userId
  payload.createdBy = req.userId;
  const chest = chestsService.create(payload);
  return sendSuccess(201, res, { chest: { id: chest.id } });
};

export const claimChestController: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  const { id } = res.locals.validated.params as { id: string };
  // Use authenticated userId instead of body param
  const result = chestsService.claim(id, req.userId!);
  return sendSuccess(200, res, {
    ok: true,
    finderOrdinal: result.finderOrdinal,
  });
};

export const deleteChestController: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  const { id } = res.locals.validated.params as { id: string };
  // Verify ownership
  if (!chestsService.isOwner(id, req.userId!)) {
    throw new ForbiddenError(getErrorMessage("CHESTS_UNAUTHORIZED_DELETE"));
  }
  chestsService.remove(id, req.userId!);
  return res.status(204).send();
};
