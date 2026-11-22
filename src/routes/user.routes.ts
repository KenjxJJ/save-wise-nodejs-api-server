import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { updateProfileSchema } from "../validators/auth.validator.js";

const router = Router();

// Protected user profile routes
router.use(requireAuth);

router.get("/me", AuthController.getMe);
router.patch("/me", validateBody(updateProfileSchema), AuthController.updateProfile);

export const userRoutes = router;
