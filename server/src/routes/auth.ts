import express, { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/authJwt";
import { authLimiter } from "../middlewares/rateLimiter";
import { validateBody } from "../middlewares/validate";
import { loginSchema, signupSchema } from "../validations/auth.validation";

const router: Router = express.Router();

router.post(
  "/signup",
  authLimiter,
  validateBody(signupSchema),
  AuthController.signup
);
router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  AuthController.login
);
router.post("/logout", AuthController.logout);
router.get("/me", verifyToken, AuthController.me);

export default router;
