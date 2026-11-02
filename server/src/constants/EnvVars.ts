/**
 * Environments variables declared here.
 */

import dotenv from "dotenv";
dotenv.config({ quiet: true });

const NodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = NodeEnv === "production";

export default {
  NodeEnv,
  IsProduction: isProduction,
  Port: Number(process.env.PORT ?? 5000),
  MongoUri: process.env.MONGO_URI ?? "",
  ClientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  Jwt: {
    Secret: process.env.JWT_SECRET ?? "",
    ExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  Cookie: {
    Name: "token",
    // Browsers only send Secure cookies over HTTPS (localhost is exempt)
    Secure: (process.env.COOKIE_SECURE ?? String(isProduction)) === "true",
    MaxAgeMs: Number(process.env.COOKIE_MAX_AGE_MS ?? 7 * 24 * 60 * 60 * 1000),
  },
  OpenRouter: {
    ApiKey: process.env.OPENROUTER_API_KEY ?? "",
    BaseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    Model:
      process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free",
    TimeoutMs: Number(process.env.OPENROUTER_TIMEOUT_MS ?? 30000),
    ContextMessages: Number(process.env.AI_CONTEXT_MESSAGES ?? 10),
  },
  RateLimit: {
    AuthWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    AuthMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
    ChatWindowMs: Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS ?? 60 * 1000),
    ChatMax: Number(process.env.CHAT_RATE_LIMIT_MAX ?? 20),
  },
} as const;
