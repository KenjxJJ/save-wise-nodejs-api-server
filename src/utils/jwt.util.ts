import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export interface JwtUserPayload {
  userId: string;
  email: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "savewise_default_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "savewise_default_refresh_secret";
const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"];
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as SignOptions["expiresIn"];

export const generateAccessToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

export const generateRefreshToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtUserPayload;
};

export const verifyRefreshToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtUserPayload;
};
