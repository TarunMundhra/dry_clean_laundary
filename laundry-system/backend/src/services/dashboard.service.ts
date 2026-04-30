import { Order } from "../models/Order.model";
import { DashboardStats, OrderStatus } from "../types";

const getUtcDayRange = (now: Date = new Date()): { start: Date; end: Date } => {
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const end = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
  return { start, end };
};

/**
 * Build dashboard statistics for the store.
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const totalOrders = await Order.countDocuments();
  const totalRevenueAgg = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = totalRevenueAgg[0]?.total ?? 0;

  const ordersByStatusAgg = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const ordersByStatus: Record<OrderStatus, number> = {
    RECEIVED: 0,
    PROCESSING: 0,
    READY: 0,
    DELIVERED: 0,
  };

  for (const entry of ordersByStatusAgg) {
    const status = entry._id as OrderStatus;
    if (status in ordersByStatus) {
      ordersByStatus[status] = entry.count;
    }
  }

  const { start, end } = getUtcDayRange();
  const ordersToday = await Order.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });
  const revenueTodayAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const revenueToday = revenueTodayAgg[0]?.total ?? 0;

  return {
    totalOrders,
    totalRevenue,
    ordersByStatus,
    revenueToday,
    ordersToday,
  };
};
