import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthPayload, LoginResult } from "../types";
import { AppError } from "../utils/appError";

/**
 * Authenticate the admin user and issue a JWT token.
 */
export const authenticateAdmin = (
  username: string,
  password: string,
): LoginResult => {
  if (username !== env.adminUsername || password !== env.adminPassword) {
    throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);
  }

  const payload: AuthPayload = { username };
  const signOptions: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  const token = jwt.sign(payload, env.jwtSecret, signOptions);

  return {
    token,
    expiresIn: env.jwtExpiresIn,
  };
};
