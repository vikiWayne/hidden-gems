import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  parseCreateMessageBody,
  parseIdParams,
  parseNearbyQuery,
  parseUpdateMessageBody,
  parseUserIdQuery,
} from "../middleware/validators.js";
import {
  createMessageController,
  deleteMessageController,
  getMessageController,
  getNearbyMessagesController,
  updateMessageController,
} from "../controllers/messages.controller.js";

export const messagesRouter = Router();

messagesRouter.get(
  "/nearby",
  validate("query", parseNearbyQuery),
  asyncHandler(getNearbyMessagesController),
);
messagesRouter.post(
  "/",
  authenticateToken,
  validate("body", parseCreateMessageBody),
  asyncHandler(createMessageController),
);
messagesRouter.get(
  "/:id",
  validate("params", parseIdParams),
  validate("query", parseNearbyQuery),
  asyncHandler(getMessageController),
);
messagesRouter.patch(
  "/:id",
  authenticateToken,
  validate("params", parseIdParams),
  validate("body", parseUpdateMessageBody),
  asyncHandler(updateMessageController),
);
messagesRouter.delete(
  "/:id",
  authenticateToken,
  validate("params", parseIdParams),
  validate("query", parseUserIdQuery),
  asyncHandler(deleteMessageController),
);
