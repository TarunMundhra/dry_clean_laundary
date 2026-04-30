import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthPayload } from "../types";
import { AppError } from "../utils/appError";

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(new AppError("UNAUTHORIZED", "Unauthorized", 401));
    return;
  }

  const token = header.replace("Bearer", "").trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    (req as Request & { user?: AuthPayload }).user = payload;
    next();
  } catch {
    next(new AppError("UNAUTHORIZED", "Unauthorized", 401));
  }
};
