import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCode } from "../utils/appError";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let code: ErrorCode = "INTERNAL_ERROR";
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else {
    logger.error({ err }, "Unhandled error");
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
};
