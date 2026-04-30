import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { authenticateAdmin } from "../services/auth.service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  const result = authenticateAdmin(username, password);

  res.status(200).json({
    success: true,
    data: result,
  });
});
