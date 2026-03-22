import type { RequestHandler } from "express";
import { usersService } from "../services/users.service.js";
import { sendSuccess } from "../lib/response.js";

export const getMyItemsController: RequestHandler = (_req, res) => {
  const { userId } = res.locals.validated.query as { userId: string };
  return sendSuccess(200, res, usersService.getMeItems(userId));
};

export const searchUsersController: RequestHandler = (_req, res) => {
  const { q, limit } = res.locals.validated.query as {
    q: string;
    limit: number;
  };
  const users = usersService.search(q, limit);
  return sendSuccess(200, res, { users });
};
