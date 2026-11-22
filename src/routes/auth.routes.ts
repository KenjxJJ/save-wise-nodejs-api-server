import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validateBody(registerSchema), AuthController.register);
router.post("/login", validateBody(loginSchema), AuthController.login);
router.post("/refresh-token", validateBody(refreshTokenSchema), AuthController.refreshToken);

export const authRoutes = router;
