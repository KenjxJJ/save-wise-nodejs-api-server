import { Types } from "mongoose";
import { SavingsGoalModel, UserModel, TransactionModel, type ISavingsGoal } from "../models/index.js";
import { AppError } from "../utils/response.util.js";
import type {
  CreateGoalInput,
  UpdateGoalInput,
  DepositToGoalInput,
} from "../validators/goal.validator.js";

export interface FormattedGoal {
  id: string;
  name: string;
  targetAmountKobo: number;
  currentBalanceKobo: number;
  currency: string;
  targetDate: Date;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  progressPercentage: number;
  autoSave: {
    enabled: boolean;
    amountKobo: number;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  };
  createdAt: Date;
  updatedAt: Date;
}

export class GoalService {
  public static formatGoal(goal: ISavingsGoal): FormattedGoal {
    const target = goal.targetAmountKobo || 1;
    const progress = Math.min(100, Math.round((goal.currentBalanceKobo / target) * 100));

    return {
      id: goal._id.toString(),
      name: goal.name,
      targetAmountKobo: goal.targetAmountKobo,
      currentBalanceKobo: goal.currentBalanceKobo,
      currency: goal.currency,
      targetDate: goal.targetDate,
      status: goal.status,
      progressPercentage: progress,
      autoSave: {
        enabled: goal.autoSave?.enabled ?? false,
        amountKobo: goal.autoSave?.amountKobo ?? 0,
        frequency: goal.autoSave?.frequency ?? "MONTHLY",
      },
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  public static async createGoal(userId: string, input: CreateGoalInput): Promise<FormattedGoal> {
    const goal = await SavingsGoalModel.create({
      userId: new Types.ObjectId(userId),
      name: input.name,
      targetAmountKobo: input.targetAmountKobo,
      currentBalanceKobo: 0,
      currency: input.currency || "NGN",
      targetDate: input.targetDate,
      status: "ACTIVE",
      autoSave: input.autoSave || { enabled: false, amountKobo: 0, frequency: "MONTHLY" },
    });

    return this.formatGoal(goal);
  }

  public static async listGoals(
    userId: string,
    status?: "ACTIVE" | "COMPLETED" | "CANCELLED"
  ): Promise<{ goals: FormattedGoal[]; totalSavingsKobo: number; count: number }> {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (status) filter.status = status;

    const goals = await SavingsGoalModel.find(filter).sort({ createdAt: -1 });
    const formatted = goals.map((g) => this.formatGoal(g));
    const totalSavingsKobo = formatted.reduce((sum, g) => sum + g.currentBalanceKobo, 0);

    return {
      goals: formatted,
      totalSavingsKobo,
      count: formatted.length,
    };
  }

  public static async getGoalById(userId: string, goalId: string): Promise<FormattedGoal> {
    if (!Types.ObjectId.isValid(goalId)) {
      throw new AppError("Invalid goal ID", 400);
    }

    const goal = await SavingsGoalModel.findOne({
      _id: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });

    if (!goal) {
      throw new AppError("Savings goal not found", 404);
    }

    return this.formatGoal(goal);
  }

  public static async updateGoal(
    userId: string,
    goalId: string,
    input: UpdateGoalInput
  ): Promise<FormattedGoal> {
    if (!Types.ObjectId.isValid(goalId)) {
      throw new AppError("Invalid goal ID", 400);
    }

    const goal = await SavingsGoalModel.findOne({
      _id: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });

    if (!goal) {
      throw new AppError("Savings goal not found", 404);
    }

    if (input.name !== undefined) goal.name = input.name;
    if (input.targetAmountKobo !== undefined) goal.targetAmountKobo = input.targetAmountKobo;
    if (input.targetDate !== undefined) goal.targetDate = input.targetDate;
    if (input.status !== undefined) goal.status = input.status;
    if (input.autoSave !== undefined) {
      goal.autoSave = {
        enabled: input.autoSave.enabled ?? goal.autoSave?.enabled ?? false,
        amountKobo: input.autoSave.amountKobo ?? goal.autoSave?.amountKobo ?? 0,
        frequency: input.autoSave.frequency ?? goal.autoSave?.frequency ?? "MONTHLY",
      };
    }

    await goal.save();
    return this.formatGoal(goal);
  }

  public static async deleteGoal(userId: string, goalId: string): Promise<{ message: string; refundedKobo: number }> {
    if (!Types.ObjectId.isValid(goalId)) {
      throw new AppError("Invalid goal ID", 400);
    }

    const goal = await SavingsGoalModel.findOne({
      _id: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });

    if (!goal) {
      throw new AppError("Savings goal not found", 404);
    }

    let refundedKobo = 0;
    // Refund any remaining balance back to user's wallet
    if (goal.currentBalanceKobo > 0) {
      refundedKobo = goal.currentBalanceKobo;
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { walletBalanceKobo: refundedKobo },
      });

      await TransactionModel.create({
        userId: new Types.ObjectId(userId),
        goalId: goal._id,
        type: "WALLET_FUND",
        amountKobo: refundedKobo,
        currency: goal.currency,
        status: "SUCCESS",
        reference: `REF_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        idempotencyKey: `IDEMP_REF_${goal._id}_${Date.now()}`,
        reason: `Refund from cancelled goal: ${goal.name}`,
      });
    }

    await SavingsGoalModel.deleteOne({ _id: goal._id });
    return {
      message: `Savings goal deleted.${refundedKobo > 0 ? ` ${refundedKobo} kobo returned to wallet balance.` : ""}`,
      refundedKobo,
    };
  }

  public static async depositToGoal(
    userId: string,
    goalId: string,
    input: DepositToGoalInput
  ): Promise<{ goal: FormattedGoal; transaction: unknown }> {
    if (!Types.ObjectId.isValid(goalId)) {
      throw new AppError("Invalid goal ID", 400);
    }

    const goal = await SavingsGoalModel.findOne({
      _id: new Types.ObjectId(goalId),
      userId: new Types.ObjectId(userId),
    });

    if (!goal) {
      throw new AppError("Savings goal not found", 404);
    }

    if (goal.status === "CANCELLED") {
      throw new AppError("Cannot deposit into a cancelled savings goal", 400);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // If funding from wallet, ensure adequate balance
    if (input.source === "WALLET") {
      if ((user.walletBalanceKobo ?? 0) < input.amountKobo) {
        throw new AppError(
          `Insufficient wallet balance (${user.walletBalanceKobo ?? 0} kobo). Top up your wallet or choose another funding source.`,
          400
        );
      }
      user.walletBalanceKobo = (user.walletBalanceKobo ?? 0) - input.amountKobo;
      await user.save();
    }

    goal.currentBalanceKobo += input.amountKobo;
    if (goal.currentBalanceKobo >= goal.targetAmountKobo) {
      goal.status = "COMPLETED";
    }
    await goal.save();

    const ref = `DEP_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const transaction = await TransactionModel.create({
      userId: new Types.ObjectId(userId),
      goalId: goal._id,
      type: "DEPOSIT",
      amountKobo: input.amountKobo,
      currency: goal.currency,
      status: "SUCCESS",
      reference: ref,
      idempotencyKey: `IDEMP_${ref}`,
      reason: input.reason || `Deposit into ${goal.name}`,
      metadata: { source: input.source },
    });

    return {
      goal: this.formatGoal(goal),
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
}
