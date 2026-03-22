import type { RequestHandler } from "express";
import { lootItemsService } from "../services/lootItems.service.js";
import { sendSuccess } from "../lib/response.js";

export const createLootItemController: RequestHandler = (_req, res) => {
  const payload = res.locals.validated.body as Parameters<
    typeof lootItemsService.create
  >[0];
  const item = lootItemsService.create(payload);
  return sendSuccess(201, res, { lootItem: { id: item.id } });
};
