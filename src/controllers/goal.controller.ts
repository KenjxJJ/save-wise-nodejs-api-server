import type { Response, NextFunction } from "express";
import { GoalService } from "../services/goal.service.js";
import { sendSuccess } from "../utils/response.util.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import type {
  CreateGoalInput,
  UpdateGoalInput,
  DepositToGoalInput,
} from "../validators/goal.validator.js";

export class GoalController {
  public static async createGoal(
    req: AuthenticatedRequest & { body: CreateGoalInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const goal = await GoalService.createGoal(req.jwtPayload!.userId, req.body);
      sendSuccess(res, goal, "Savings goal created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public static async listGoals(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const status = req.query.status as "ACTIVE" | "COMPLETED" | "CANCELLED" | undefined;
      const result = await GoalService.listGoals(req.jwtPayload!.userId, status);
      sendSuccess(res, result, "Savings goals retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getGoalById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const goal = await GoalService.getGoalById(req.jwtPayload!.userId, String(req.params.id));
      sendSuccess(res, goal, "Savings goal retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async updateGoal(
    req: AuthenticatedRequest & { body: UpdateGoalInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const goal = await GoalService.updateGoal(req.jwtPayload!.userId, String(req.params.id), req.body);
      sendSuccess(res, goal, "Savings goal updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteGoal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await GoalService.deleteGoal(req.jwtPayload!.userId, String(req.params.id));
      sendSuccess(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async depositToGoal(
    req: AuthenticatedRequest & { body: DepositToGoalInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await GoalService.depositToGoal(req.jwtPayload!.userId, String(req.params.id), req.body);
      sendSuccess(res, result, "Deposit to savings goal successful", 200);
    } catch (error) {
      next(error);
    }
  }
}
