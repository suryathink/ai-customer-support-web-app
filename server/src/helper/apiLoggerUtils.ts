import { Request, Response } from "express";
import log4js from "log4js";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { ApiError } from "./apiError";

const logger = log4js.getLogger();

export const logApiError = (req: Request, error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : error;
  logger.error(`[${req.method}] ${req.originalUrl} -`, message);
};

/**
 * Logs the error and sends a consistent error response.
 * Known ApiErrors keep their status/message; anything else becomes a 500.
 */
export const sendApiError = (req: Request, res: Response, error: unknown) => {
  if (error instanceof ApiError) {
    if (error.statusCode >= HttpStatusCodes.INTERNAL_SERVER_ERROR) {
      logApiError(req, error);
    }
    return res
      .status(error.statusCode)
      .send({ statusCode: error.statusCode, message: error.message });
  }

  logApiError(req, error);
  return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    message: "internal server error",
  });
};
