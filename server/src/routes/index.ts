import { Express } from "express";
import auth from "./auth";
import chat from "./chat";

export const routes = function (app: Express) {
  app.use("/health", (req, res) => {
    return res.send("Good Health");
  });
  app.use("/auth", auth);
  app.use("/chat", chat);
};
