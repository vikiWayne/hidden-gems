import type { Response } from "express";

export function sendSuccess(
  statusCode = 200,
  res: Response,
  data: unknown = null,
) {
  return res.status(statusCode).json({ status: "success", data });
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}
