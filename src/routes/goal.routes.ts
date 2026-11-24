import { Router } from "express";
import { GoalController } from "../controllers/goal.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  createGoalSchema,
  updateGoalSchema,
  depositToGoalSchema,
} from "../validators/goal.validator.js";

const router = Router();

// All goal routes require authentication
router.use(requireAuth);

router.post("/", validateBody(createGoalSchema), GoalController.createGoal);
router.get("/", GoalController.listGoals);
router.get("/:id", GoalController.getGoalById);
router.patch("/:id", validateBody(updateGoalSchema), GoalController.updateGoal);
router.delete("/:id", GoalController.deleteGoal);
router.post("/:id/deposit", validateBody(depositToGoalSchema), GoalController.depositToGoal);

export const goalRoutes = router;
