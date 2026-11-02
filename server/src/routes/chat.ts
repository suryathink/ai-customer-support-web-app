import express, { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { verifyToken } from "../middlewares/authJwt";
import { chatLimiter } from "../middlewares/rateLimiter";
import { validateBody } from "../middlewares/validate";
import { sendMessageSchema } from "../validations/chat.validation";

const router: Router = express.Router();

// Every chat route is user-scoped
router.use(verifyToken);

router.post(
  "/send",
  chatLimiter,
  validateBody(sendMessageSchema),
  ChatController.send
);
router.get("/history", ChatController.history);
router.get("/history/:conversationId", ChatController.conversationMessages);
router.delete("/history/:conversationId", ChatController.deleteConversation);

export default router;
