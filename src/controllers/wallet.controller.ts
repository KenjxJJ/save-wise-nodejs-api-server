import type { Response, NextFunction } from "express";
import { WalletService } from "../services/wallet.service.js";
import { sendSuccess } from "../utils/response.util.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import type {
  FundWalletInput,
  UpdateSettingsInput,
} from "../validators/wallet.validator.js";

export class WalletController {
  public static async getWallet(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const summary = await WalletService.getWalletSummary(req.jwtPayload!.userId);
      sendSuccess(res, summary, "Wallet summary retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async fundWallet(
    req: AuthenticatedRequest & { body: FundWalletInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await WalletService.fundWallet(req.jwtPayload!.userId, req.body);
      sendSuccess(res, result, "Wallet funded successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async updateSettings(
    req: AuthenticatedRequest & { body: UpdateSettingsInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await WalletService.updateSettings(req.jwtPayload!.userId, req.body);
      sendSuccess(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getRecommendation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recommendation = await WalletService.getSavingsRecommendation(req.jwtPayload!.userId);
      sendSuccess(res, recommendation, "Savings recommendation retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getTransactions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const type = req.query.type as string | undefined;

      const result = await WalletService.getTransactionHistory(req.jwtPayload!.userId, {
        page,
        limit,
        type,
      });

      sendSuccess(res, result, "Transaction history retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}
