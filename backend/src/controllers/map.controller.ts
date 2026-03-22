import type { RequestHandler } from "express";
import { mapService } from "../services/map.service.js";
import { sendSuccess } from "../lib/response.js";

export const getNearbyMapItemsController: RequestHandler = (_req, res) => {
  const { lat, lng, userId, filter } = res.locals.validated.query as {
    lat: number;
    lng: number;
    userId?: string;
    filter?: string;
  };
  const result = mapService.getNearby(lat, lng, userId, filter);
  return sendSuccess(200, res, result);
};

export const getViewportMapItemsController: RequestHandler = (_req, res) => {
  const { minLat, maxLat, minLng, maxLng, userId, userLat, userLng, filter } =
    res.locals.validated.query as {
      minLat: number;
      maxLat: number;
      minLng: number;
      maxLng: number;
      userId?: string;
      userLat?: number;
      userLng?: number;
      filter?: string;
    };
  const result = mapService.getViewport(
    minLat,
    maxLat,
    minLng,
    maxLng,
    userId,
    userLat,
    userLng,
    filter,
  );
  return sendSuccess(200, res, result);
};

export const getMapConfigController: RequestHandler = (_req, res) => {
  return sendSuccess(200, res, mapService.getConfig());
};
