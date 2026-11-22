import { Schema, model, type Document, type Types } from "mongoose";

export interface IAutoSaveConfig {
  enabled: boolean;
  amountKobo: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  nextRunAt?: Date;
}

export interface ISavingsGoal extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  targetAmountKobo: number;
  currentBalanceKobo: number;
  currency: string;
  targetDate: Date;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  autoSave: IAutoSaveConfig;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const AutoSaveConfigSchema = new Schema<IAutoSaveConfig>(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    amountKobo: {
      type: Number,
      default: 0,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY"],
      default: "MONTHLY",
    },
    nextRunAt: {
      type: Date,
      index: true,
    },
  },
  { _id: false }
);

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmountKobo: {
      type: Number,
      required: true,
      min: 1000,
    },
    currentBalanceKobo: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
    autoSave: {
      type: AutoSaveConfigSchema,
      default: () => ({
        enabled: false,
        amountKobo: 0,
        frequency: "MONTHLY",
      }),
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: "version",
  }
);

// Compound index for user goal lists & active goal dashboard queries
SavingsGoalSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const SavingsGoalModel = model<ISavingsGoal>("SavingsGoal", SavingsGoalSchema);
