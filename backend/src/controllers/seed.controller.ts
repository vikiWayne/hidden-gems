import type { RequestHandler } from "express";
import { seedService } from "../services/seed.service.js";
import { sendSuccess } from "../lib/response.js";

export const seedNearbyController: RequestHandler = (_req, res) => {
  const { lat, lng } = res.locals.validated.body as {
    lat: number;
    lng: number;
  };
  const created = seedService.createAtLocation(lat, lng);
  return sendSuccess(200, res, { ok: true, ...created });
};
