export type OrderStatus = "RECEIVED" | "PROCESSING" | "READY" | "DELIVERED";

export interface AuthPayload {
  username: string;
}

export interface LoginResult {
  token: string;
  expiresIn: string;
}

export interface GarmentItem {
  name: string;
  quantity: number;
  pricePerItem: number;
  subtotal: number;
}

export interface OrderInputGarment {
  name: string;
  quantity: number;
}

export interface IOrder {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  garments: GarmentItem[];
  totalAmount: number;
  status: OrderStatus;
  estimatedDeliveryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueToday: number;
  ordersToday: number;
}
