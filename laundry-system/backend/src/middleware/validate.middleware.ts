import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";

export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
    return;
  }

  const details = errors.array().map((error) => ({
    field: error.type === "field" ? error.path : error.type,
    message: error.msg,
  }));

  next(new AppError("VALIDATION_ERROR", "Validation failed", 400, details));
};
