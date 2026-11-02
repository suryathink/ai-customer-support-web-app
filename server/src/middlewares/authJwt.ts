import { Request, Response, NextFunction } from "express";
import EnvVars from "@src/constants/EnvVars";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { verifyJwt } from "@src/helper/token";

const unauthorized = (res: Response, message: string) =>
  res
    .status(HttpStatusCodes.UNAUTHORIZED)
    .send({ statusCode: HttpStatusCodes.UNAUTHORIZED, message });

/**
 * Reads the JWT from the httpOnly cookie (or a Bearer header for API clients)
 * and attaches the user to the request.
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  const token: string | undefined =
    req.cookies?.[EnvVars.Cookie.Name] ??
    (header?.startsWith("Bearer ") ? header.slice(7) : undefined);

  if (!token) return unauthorized(res, "No token provided!");

  try {
    const { userId, email } = verifyJwt(token);
    req.user = { userId, email };
    return next();
  } catch {
    return unauthorized(res, "Invalid or expired token");
  }
};
