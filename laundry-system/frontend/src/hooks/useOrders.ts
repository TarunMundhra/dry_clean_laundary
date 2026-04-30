import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { ApiSuccess, Order, OrderStatus, PaginatedOrders } from "../types";

interface UseOrdersParams {
  status?: OrderStatus;
  search?: string;
  page: number;
  limit: number;
}

export const useOrders = ({ status, search, page, limit }: UseOrdersParams) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiSuccess<PaginatedOrders>>("/orders", {
        params: { status, search, page, limit },
      });
      setOrders(response.data.data.data);
      setTotal(response.data.data.total);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message ?? "Failed to load orders");
      } else {
        setError("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  }, [status, search, page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    total,
    totalPages,
    loading,
    error,
    refresh: fetchOrders,
  };
};
