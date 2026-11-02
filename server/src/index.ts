/**
 * Setup express server.
 */

import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import ExpressMongoSanitize from "express-mongo-sanitize";
import log4js, { Configuration } from "log4js";

import EnvVars from "./constants/EnvVars";
import HttpStatusCodes from "./constants/HttpStatusCodes";
import log4jsConfig from "./configs/log4js.config";
import { connectMongo } from "./configs/mongo.config";
import { routes } from "@src/routes";
import { logRequests } from "./middlewares/requestLogger";
import { logApiError } from "./helper/apiLoggerUtils";

// Configuring logger
log4js.configure(log4jsConfig as Configuration);
const logger = log4js.getLogger();

const app = express();

// **** Setup **** //

// behind nginx / a hosting proxy: needed for correct client IPs in rate limiting
app.set("trust proxy", 1);

// set security HTTP headers
app.use(helmet());

// enable cors for the client app (cookies need credentials)
app.use(cors({ origin: EnvVars.ClientOrigin.split(","), credentials: true }));

// parse json request body
app.use(express.json({ limit: "100kb" }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// parse auth cookie
app.use(cookieParser());

// sanitize request data
app.use(ExpressMongoSanitize());

// Logs API requests
app.use(logRequests);

//Route is initialized
routes(app);

app.use((req, res) => {
  res
    .status(HttpStatusCodes.NOT_FOUND)
    .send({ statusCode: HttpStatusCodes.NOT_FOUND, message: "Not found" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  // e.g. malformed JSON body
  if (err.status && err.status < HttpStatusCodes.INTERNAL_SERVER_ERROR) {
    return res
      .status(err.status)
      .send({ statusCode: err.status, message: "Invalid request" });
  }
  logApiError(req, err);
  return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    message: "internal server error",
  });
});

const start = async () => {
  if (!EnvVars.MongoUri) throw new Error("MONGO_URI is not set");
  if (!EnvVars.Jwt.Secret) throw new Error("JWT_SECRET is not set");
  if (!EnvVars.OpenRouter.ApiKey) {
    logger.warn("⚠️ OPENROUTER_API_KEY is not set - chat replies will fail");
  }

  await connectMongo();

  app.listen(EnvVars.Port, () =>
    logger.info(
      `🚀 Server running in ${EnvVars.NodeEnv} mode on port ${EnvVars.Port}`
    )
  );
};

start().catch((error) => {
  logger.error("❌ Failed to start server:", error.message);
  process.exit(1);
});
