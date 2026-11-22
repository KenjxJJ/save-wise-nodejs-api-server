import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtUserPayload } from "../utils/jwt.util.js";
import { AppError } from "../utils/response.util.js";
import { UserModel, type IUser } from "../models/index.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  jwtPayload?: JwtUserPayload;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required. Please provide a valid Bearer token.", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Malformed authorization header", 401);
    }

    let payload: JwtUserPayload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError("Invalid or expired access token", 401);
    }

    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new AppError("User account no longer exists", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("User account is suspended or inactive", 403);
    }

    req.user = user;
    req.jwtPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
};
