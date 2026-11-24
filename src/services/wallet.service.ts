import { Types } from "mongoose";
import { UserModel, TransactionModel, SavingsGoalModel } from "../models/index.js";
import { AppError } from "../utils/response.util.js";
import type {
  FundWalletInput,
  UpdateSettingsInput,
} from "../validators/wallet.validator.js";

export class WalletService {
  public static async getWalletSummary(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const goals = await SavingsGoalModel.find({
      userId: new Types.ObjectId(userId),
      status: { $in: ["ACTIVE", "COMPLETED"] },
    });

    const totalSavingsKobo = goals.reduce((sum, g) => sum + g.currentBalanceKobo, 0);
    const walletBalanceKobo = user.walletBalanceKobo ?? 0;
    const netWorthKobo = walletBalanceKobo + totalSavingsKobo;

    return {
      walletBalanceKobo,
      totalSavingsKobo,
      netWorthKobo,
      activeGoalsCount: goals.filter((g) => g.status === "ACTIVE").length,
      currency: user.settings?.currency ?? "NGN",
      settings: {
        targetSavingsPercentage: user.settings?.targetSavingsPercentage ?? 20,
        monthlyIncomeKobo: user.settings?.monthlyIncomeKobo ?? 0,
        currency: user.settings?.currency ?? "NGN",
      },
    };
  }

  public static async fundWallet(userId: string, input: FundWalletInput) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.walletBalanceKobo = (user.walletBalanceKobo ?? 0) + input.amountKobo;
    await user.save();

    const ref = `WLT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const transaction = await TransactionModel.create({
      userId: new Types.ObjectId(userId),
      type: "WALLET_FUND",
      amountKobo: input.amountKobo,
      currency: user.settings?.currency ?? "NGN",
      status: "SUCCESS",
      reference: ref,
      idempotencyKey: `IDEMP_${ref}`,
      reason: input.reason || "Wallet Top-up",
      metadata: { paymentMethod: input.paymentMethod },
    });

    return {
      walletBalanceKobo: user.walletBalanceKobo,
      transaction: {
        id: transaction._id.toString(),
        reference: transaction.reference,
        amountKobo: transaction.amountKobo,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    };
  }

  public static async updateSettings(userId: string, input: UpdateSettingsInput) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.settings) {
      user.settings = {
        targetSavingsPercentage: 20,
        monthlyIncomeKobo: 0,
        currency: "NGN",
      };
    }

    if (input.targetSavingsPercentage !== undefined) {
      user.settings.targetSavingsPercentage = input.targetSavingsPercentage;
    }
    if (input.monthlyIncomeKobo !== undefined) {
      user.settings.monthlyIncomeKobo = input.monthlyIncomeKobo;
    }
    if (input.currency !== undefined) {
      user.settings.currency = input.currency;
    }

    await user.save();

    return {
      settings: user.settings,
      message: `Savings settings updated. Target set to ${user.settings.targetSavingsPercentage}%.`,
    };
  }

  public static async getSavingsRecommendation(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const percentage = user.settings?.targetSavingsPercentage ?? 20;
    let monthlyIncomeKobo = user.settings?.monthlyIncomeKobo ?? 0;

    // If user has not set monthly income yet, estimate based on last 30 days wallet funding deposits
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (monthlyIncomeKobo === 0) {
      const recentDeposits = await TransactionModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            type: "WALLET_FUND",
            status: "SUCCESS",
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amountKobo" },
          },
        },
      ]);

      if (recentDeposits.length > 0 && recentDeposits[0].total > 0) {
        monthlyIncomeKobo = recentDeposits[0].total;
      } else {
        // Fallback demo benchmark: 100,000 NGN (10,000,000 kobo)
        monthlyIncomeKobo = 10000000;
      }
    }

    const recommendedMonthlySavingsKobo = Math.round(monthlyIncomeKobo * (percentage / 100));
    const recommendedWeeklySavingsKobo = Math.round(recommendedMonthlySavingsKobo / 4);
    const recommendedDailySavingsKobo = Math.round(recommendedMonthlySavingsKobo / 30);

    // Calculate actual savings achieved in the last 30 days
    const recentSavings = await TransactionModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          type: "DEPOSIT",
          status: "SUCCESS",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amountKobo" },
        },
      },
    ]);

    const actualSavedLast30DaysKobo = recentSavings.length > 0 ? recentSavings[0].total : 0;
    const progressRate = recommendedMonthlySavingsKobo > 0
      ? Math.min(100, Math.round((actualSavedLast30DaysKobo / recommendedMonthlySavingsKobo) * 100))
      : 0;

    return {
      rule: `${percentage}% Savings Rule`,
      targetSavingsPercentage: percentage,
      monthlyIncomeKobo,
      recommendedMonthlySavingsKobo,
      recommendedWeeklySavingsKobo,
      recommendedDailySavingsKobo,
      actualSavedLast30DaysKobo,
      progressRatePercentage: progressRate,
      onTrack: actualSavedLast30DaysKobo >= recommendedMonthlySavingsKobo,
      advice: `Based on your configured ${percentage}% target and monthly income of ${(monthlyIncomeKobo / 100).toLocaleString()} ${user.settings?.currency ?? "NGN"}, we recommend setting aside ${(recommendedMonthlySavingsKobo / 100).toLocaleString()} ${user.settings?.currency ?? "NGN"} each month. You can readjust this percentage anytime in /api/v1/wallet/settings.`,
    };
  }

  public static async getTransactionHistory(
    userId: string,
    options: { page?: number; limit?: number; type?: string }
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (options.type) {
      filter.type = options.type;
    }

    const [transactions, total] = await Promise.all([
      TransactionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("goalId", "name currency"),
      TransactionModel.countDocuments(filter),
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t._id.toString(),
        reference: t.reference,
        type: t.type,
        amountKobo: t.amountKobo,
        currency: t.currency,
        status: t.status,
        reason: t.reason,
        goal: t.goalId ? { id: (t.goalId as unknown as { _id: string })._id, name: (t.goalId as unknown as { name: string }).name } : null,
        createdAt: t.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
