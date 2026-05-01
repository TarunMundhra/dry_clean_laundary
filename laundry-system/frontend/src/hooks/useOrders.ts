import axios from "axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { ApiSuccess, Order, OrderStatus, PaginatedOrders } from "../types";

interface UseOrdersParams {
  status?: OrderStatus;
  garment?: string;
  search?: string;
  page: number;
  limit: number;
}

export const useOrders = ({
  status,
  garment,
  search,
  page,
  limit,
}: UseOrdersParams) => {
  const query = useQuery({
    queryKey: ["orders", { status, garment, search, page, limit }],
    queryFn: async (): Promise<PaginatedOrders> => {
      const response = await api.get<ApiSuccess<PaginatedOrders>>("/orders", {
        params: { status, garment, search, page, limit },
      });
      return response.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const errorMessage = (() => {
    if (!query.error) {
      return null;
    }
    if (axios.isAxiosError(query.error)) {
      return (
        query.error.response?.data?.error?.message ?? "Failed to load orders"
      );
    }
    return "Failed to load orders";
  })();

  return {
    orders: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    loading: query.isLoading || query.isFetching,
    error: errorMessage,
    refresh: query.refetch,
  };
};
