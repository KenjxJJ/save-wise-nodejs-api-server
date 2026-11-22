import type { Request, Response, NextFunction } from "express";
import { type ZodType, ZodError } from "zod";
import { AppError } from "../utils/response.util.js";

export const validateBody = (schema: ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        next(new AppError("Validation failed", 422, formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
