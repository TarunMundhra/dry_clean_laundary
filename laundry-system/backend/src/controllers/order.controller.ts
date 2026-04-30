import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../services/order.service";
import { OrderStatus } from "../types";

export const createOrderHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await createOrder(req.body);

    res.status(201).json({
      success: true,
      data: order,
    });
  },
);

export const listOrdersHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const status = req.query.status as OrderStatus | undefined;
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;
    const pageValue = Number(req.query.page ?? 1);
    const limitValue = Number(req.query.limit ?? 10);
    const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit =
      Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 10;

    const result = await listOrders({ status, search, page, limit });

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const getOrderByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await getOrderById(req.params.orderId);

    res.status(200).json({
      success: true,
      data: order,
    });
  },
);

export const updateOrderStatusHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const status = req.body.status as OrderStatus;
    const order = await updateOrderStatus(req.params.orderId, status);

    res.status(200).json({
      success: true,
      data: order,
    });
  },
);
