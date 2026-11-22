import { UserModel, type IUser } from "../models/index.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util.js";
import { AppError } from "../utils/response.util.js";
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "../validators/auth.validator.js";

export interface SafeUser {
  id: string;
  email: string;
  phoneNumber?: string;
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    avatarUrl?: string;
  };
  status: string;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: SafeUser;
  tokens: AuthTokens;
}

export class AuthService {
  public static sanitizeUser(user: IUser): SafeUser {
    return {
      id: user._id.toString(),
      email: user.email,
      phoneNumber: user.phoneNumber,
      profile: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        dateOfBirth: user.profile.dateOfBirth,
        avatarUrl: user.profile.avatarUrl,
      },
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  public static async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await UserModel.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError("An account with this email already exists", 409);
    }

    if (input.phoneNumber) {
      const existingPhone = await UserModel.findOne({ phoneNumber: input.phoneNumber });
      if (existingPhone) {
        throw new AppError("An account with this phone number already exists", 409);
      }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await UserModel.create({
      email: input.email,
      passwordHash,
      phoneNumber: input.phoneNumber,
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth,
      },
      status: "ACTIVE",
    });

    const tokens = {
      accessToken: generateAccessToken({ userId: user._id.toString(), email: user.email }),
      refreshToken: generateRefreshToken({ userId: user._id.toString(), email: user.email }),
    };

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public static async login(input: LoginInput): Promise<AuthResult> {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("Your account is suspended or inactive. Please contact support.", 403);
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = {
      accessToken: generateAccessToken({ userId: user._id.toString(), email: user.email }),
      refreshToken: generateRefreshToken({ userId: user._id.toString(), email: user.email }),
    };

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public static async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(token);
      const user = await UserModel.findById(payload.userId);

      if (!user || user.status !== "ACTIVE") {
        throw new AppError("Invalid or expired refresh token", 401);
      }

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
      });

      return { accessToken };
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  public static async getProfile(userId: string): Promise<SafeUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return this.sanitizeUser(user);
  }

  public static async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<SafeUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (input.firstName !== undefined) user.profile.firstName = input.firstName;
    if (input.lastName !== undefined) user.profile.lastName = input.lastName;
    if (input.dateOfBirth !== undefined) user.profile.dateOfBirth = input.dateOfBirth;
    if (input.avatarUrl !== undefined) user.profile.avatarUrl = input.avatarUrl;
    if (input.phoneNumber !== undefined) user.phoneNumber = input.phoneNumber;

    await user.save();
    return this.sanitizeUser(user);
  }
}
