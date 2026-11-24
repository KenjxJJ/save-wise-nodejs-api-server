import { Schema, model, type Document, type Types } from "mongoose";

export interface IUserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  avatarUrl?: string;
}

export interface IUserSettings {
  targetSavingsPercentage: number; // default: 20 (adjustable: 1-100%)
  monthlyIncomeKobo?: number;
  currency: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  profile: IUserProfile;
  walletBalanceKobo: number;
  settings: IUserSettings;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    avatarUrl: { type: String, trim: true },
  },
  { _id: false }
);

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    targetSavingsPercentage: {
      type: Number,
      default: 20,
      min: 1,
      max: 100,
    },
    monthlyIncomeKobo: {
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
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    profile: {
      type: UserProfileSchema,
      required: true,
    },
    walletBalanceKobo: {
      type: Number,
      default: 0,
      min: 0,
    },
    settings: {
      type: UserSettingsSchema,
      default: () => ({
        targetSavingsPercentage: 20,
        monthlyIncomeKobo: 0,
        currency: "NGN",
      }),
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>("User", UserSchema);
