import { addDays } from "date-fns";
import { FilterQuery } from "mongoose";
import { env } from "../config/env";
import { GARMENT_CATALOG } from "../constants/garments";
import { Order, OrderDocument } from "../models/Order.model";
import { OrderInputGarment, OrderStatus, PaginatedResult } from "../types";
import { AppError } from "../utils/appError";
import { generateOrderId } from "../utils/generateOrderId";

const PHONE_REGEX = /^[6-9]\d{9}$/;
const STATUS_FLOW: OrderStatus[] = [
  "RECEIVED",
  "PROCESSING",
  "READY",
  "DELIVERED",
];

export interface CreateOrderInput {
  customerName: string;
  phoneNumber: string;
  garments: OrderInputGarment[];
}

export interface ListOrdersParams {
  status?: OrderStatus;
  search?: string;
  page: number;
  limit: number;
}

const validatePhoneNumber = (phoneNumber: string): void => {
  if (!PHONE_REGEX.test(phoneNumber)) {
    throw new AppError("VALIDATION_ERROR", "Invalid phone number", 400);
  }
};

const buildGarments = (
  garments: OrderInputGarment[],
): OrderDocument["garments"] => {
  if (!garments || garments.length === 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "At least one garment is required",
      400,
    );
  }

  return garments.map((garment) => {
    if (!Object.prototype.hasOwnProperty.call(GARMENT_CATALOG, garment.name)) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Garment '${garment.name}' is not in our service catalog`,
        400,
      );
    }

    if (garment.quantity < 1) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Garment quantity must be at least 1",
        400,
      );
    }

    const pricePerItem = GARMENT_CATALOG[garment.name];
    const subtotal = pricePerItem * garment.quantity;

    return {
      name: garment.name,
      quantity: garment.quantity,
      pricePerItem,
      subtotal,
    };
  });
};

const computeTotalAmount = (items: OrderDocument["garments"]): number =>
  items.reduce((total, item) => total + item.subtotal, 0);

/**
 * Create a new order with computed totals and delivery date.
 */
export const createOrder = async (
  input: CreateOrderInput,
): Promise<OrderDocument> => {
  validatePhoneNumber(input.phoneNumber);

  const garments = buildGarments(input.garments);
  const totalAmount = computeTotalAmount(garments);
  const now = new Date();
  const estimatedDeliveryDate = addDays(now, env.deliveryDaysOffset);

  const order = new Order({
    orderId: "PENDING",
    customerName: input.customerName,
    phoneNumber: input.phoneNumber,
    garments,
    totalAmount,
    status: "RECEIVED",
    estimatedDeliveryDate,
  });

  order.orderId = generateOrderId(order._id, now);
  await order.save();

  return order;
};

/**
 * List orders with filters and pagination.
 */
export const listOrders = async (
  params: ListOrdersParams,
): Promise<PaginatedResult<OrderDocument>> => {
  const { status, search, page, limit } = params;
  const filter: FilterQuery<OrderDocument> = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { customerName: regex },
      { phoneNumber: regex },
      { orderId: regex },
    ];
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    totalPages,
  };
};

/**
 * Fetch an order by its orderId.
 */
export const getOrderById = async (orderId: string): Promise<OrderDocument> => {
  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found", 404);
  }

  return order;
};

/**
 * Update order status with forward-only transitions.
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<OrderDocument> => {
  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found", 404);
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextIndex = STATUS_FLOW.indexOf(status);

  if (nextIndex !== currentIndex + 1) {
    throw new AppError("VALIDATION_ERROR", "Invalid status transition", 400);
  }

  order.status = status;
  await order.save();

  return order;
};
