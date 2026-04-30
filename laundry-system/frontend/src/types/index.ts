export type OrderStatus = "RECEIVED" | "PROCESSING" | "READY" | "DELIVERED";

export interface GarmentItem {
  name: string;
  quantity: number;
  pricePerItem: number;
  subtotal: number;
}

export interface Order {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  garments: GarmentItem[];
  totalAmount: number;
  status: OrderStatus;
  estimatedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrders {
  data: Order[];
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

export interface CreateOrderPayload {
  customerName: string;
  phoneNumber: string;
  garments: Array<{ name: string; quantity: number }>;
}

export interface UpdateStatusPayload {
  status: "PROCESSING" | "READY" | "DELIVERED";
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
