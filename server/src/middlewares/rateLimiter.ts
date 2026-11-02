import rateLimit from "express-rate-limit";
import EnvVars from "@src/constants/EnvVars";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";

const buildLimiter = (windowMs: number, limit: number, message: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    statusCode: HttpStatusCodes.TOO_MANY_REQUESTS,
    message: { statusCode: HttpStatusCodes.TOO_MANY_REQUESTS, message },
  });

// Slows down brute-force attempts on login/signup
export const authLimiter = buildLimiter(
  EnvVars.RateLimit.AuthWindowMs,
  EnvVars.RateLimit.AuthMax,
  "Too many attempts. Please try again later."
);

// Protects the AI quota from message spam
export const chatLimiter = buildLimiter(
  EnvVars.RateLimit.ChatWindowMs,
  EnvVars.RateLimit.ChatMax,
  "You are sending messages too fast. Please slow down."
);
