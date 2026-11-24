import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validateBody(registerSchema), AuthController.register);
router.post("/login", validateBody(loginSchema), AuthController.login);
router.post("/refresh-token", validateBody(refreshTokenSchema), AuthController.refreshToken);
router.post("/forgot-password", validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), AuthController.resetPassword);

export const authRoutes = router;
