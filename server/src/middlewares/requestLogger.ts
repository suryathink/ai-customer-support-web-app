import { Request, Response, NextFunction } from "express";
import log4js from "log4js";

const logger = log4js.getLogger();

export const logRequests = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`
    );
  });
  next();
};
