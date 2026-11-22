import { Schema, model, type Document, type Types } from "mongoose";

export type OtpPurpose = "REGISTRATION" | "LOGIN" | "WITHDRAWAL";

export interface IOtp extends Document {
  _id: Types.ObjectId;
  identifier: string; // E.164 phone number or email
  hashedCode: string;
  purpose: OtpPurpose;
  attempts: number;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    hashedCode: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["REGISTRATION", "LOGIN", "WITHDRAWAL"],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    // MongoDB Atlas TTL Index: Automatically drops the document after 300 seconds (5 mins)
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for fast lookup by identifier and purpose
OtpSchema.index({ identifier: 1, purpose: 1 });

export const OtpModel = model<IOtp>("Otp", OtpSchema);
