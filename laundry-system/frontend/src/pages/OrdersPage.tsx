import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { CreateOrderForm } from "../components/CreateOrderForm";
import { FilterBar } from "../components/FilterBar";
import { OrderTable } from "../components/OrderTable";
import { useOrders } from "../hooks/useOrders";
import { ApiSuccess, Order, OrderStatus } from "../types";

export const OrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const { orders, total, totalPages, loading, error, refresh } = useOrders({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchQuery || undefined,
    page,
    limit: 10
  });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    if (status === "RECEIVED") {
      return;
    }
    setUpdateError(null);
    setUpdatingOrderId(orderId);
    try {
      await api.patch<ApiSuccess<Order>>(`/orders/${orderId}/status`, { status });
      refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setUpdateError(err.response?.data?.error?.message ?? "Failed to update status");
      } else {
        setUpdateError("Failed to update status");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate/70">Orders</p>
          <h2 className="mt-2 font-display text-3xl">Order workflow center</h2>
        </div>
        <div className="text-sm text-slate">Total orders: {total}</div>
      </div>

      <FilterBar
        status={statusFilter}
        search={searchInput}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onSearchChange={setSearchInput}
        onCreate={() => setIsModalOpen(true)}
      />

      {updateError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {updateError}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-6 text-sm text-slate">
          Loading orders...
        </div>
      ) : (
        <OrderTable
          orders={orders}
          onStatusChange={handleStatusChange}
          updatingOrderId={updatingOrderId}
        />
      )}

      <div className="flex items-center justify-between text-sm text-slate">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="rounded-full border border-ink/20 px-4 py-2 disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages || 1))}
          disabled={page >= totalPages}
          className="rounded-full border border-ink/20 px-4 py-2 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-ink/10 bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate/70">New order</p>
                <h3 className="font-display text-2xl">Create order ticket</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-ink/20 px-3 py-1 text-xs"
              >
                Close
              </button>
            </div>
            <CreateOrderForm
              onCreated={() => {
                setIsModalOpen(false);
                refresh();
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};
