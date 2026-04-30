import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getDashboardStats } from "../services/dashboard.service";

export const getDashboardHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  },
);
