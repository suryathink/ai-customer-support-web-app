import mongoose from "mongoose";
import log4js from "log4js";
import EnvVars from "@src/constants/EnvVars";

const logger = log4js.getLogger();

const db = mongoose.connection;

db.on("error", (error) => {
  logger.error("❌ Unable to connect to the Mongo database:", error.message);
});
db.once("open", () => {
  logger.info("🎉 Mongo Database connected successfully!");
});

export const connectMongo = async () => {
  await mongoose.connect(EnvVars.MongoUri);
};

export default db;
