import { OrderStatus } from "../types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  RECEIVED: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  READY: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-slate-200 text-slate-700"
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
      STATUS_STYLES[status]
    }`}
  >
    {status}
  </span>
);
