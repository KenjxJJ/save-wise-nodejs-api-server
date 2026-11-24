import { Schema, model, type Document, type Types } from "mongoose";

export type TransactionType = "WALLET_FUND" | "DEPOSIT" | "WITHDRAWAL" | "AUTO_SAVE";
export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  goalId?: Types.ObjectId;
  type: TransactionType;
  amountKobo: number;
  currency: string;
  status: TransactionStatus;
  reference: string;
  idempotencyKey: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "SavingsGoal",
      required: false,
      index: true,
    },
    type: {
      type: String,
      enum: ["WALLET_FUND", "DEPOSIT", "WITHDRAWAL", "AUTO_SAVE"],
      required: true,
      index: true,
    },
    amountKobo: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "SUCCESS", // Default to SUCCESS for manual simulated savings transactions
      index: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for fast historical queries
TransactionSchema.index({ goalId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const TransactionModel = model<ITransaction>("Transaction", TransactionSchema);
