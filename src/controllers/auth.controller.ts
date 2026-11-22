import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.util.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  UpdateProfileInput,
} from "../validators/auth.validator.js";

export class AuthController {
  public static async register(
    req: Request<Record<string, never>, Record<string, never>, RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, "Account registered successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public static async login(
    req: Request<Record<string, never>, Record<string, never>, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, "Login successful", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async refreshToken(
    req: Request<Record<string, never>, Record<string, never>, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.refreshToken(req.body.refreshToken);
      sendSuccess(res, result, "Token refreshed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user
        ? AuthService.sanitizeUser(req.user)
        : await AuthService.getProfile(req.jwtPayload!.userId);
      sendSuccess(res, user, "Profile retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(
    req: AuthenticatedRequest & { body: UpdateProfileInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updatedUser = await AuthService.updateProfile(req.jwtPayload!.userId, req.body);
      sendSuccess(res, updatedUser, "Profile updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}
