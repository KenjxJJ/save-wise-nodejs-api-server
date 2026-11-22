import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError, sendError } from "../utils/response.util.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // Handle MongoDB duplicate key error (code 11000)
  if ("code" in err && (err as { code: number }).code === 11000) {
    const keyVal = (err as { keyValue?: Record<string, unknown> }).keyValue;
    const field = keyVal ? Object.keys(keyVal)[0] : "field";
    sendError(res, `An account with that ${field} already exists.`, 409);
    return;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    sendError(res, "Invalid resource identifier", 400);
    return;
  }

  console.error("Unhandled Server Error:", err);
  sendError(
    res,
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    500
  );
};
