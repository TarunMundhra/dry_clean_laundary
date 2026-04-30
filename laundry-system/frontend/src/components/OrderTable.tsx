import { format } from "date-fns";
import { Order, OrderStatus } from "../types";
import { StatusBadge } from "./StatusBadge";

const STATUS_FLOW: OrderStatus[] = [
  "RECEIVED",
  "PROCESSING",
  "READY",
  "DELIVERED"
];

const getAllowedStatuses = (current: OrderStatus): OrderStatus[] => {
  const index = STATUS_FLOW.indexOf(current);
  if (index < 0) {
    return [current];
  }
  const next = STATUS_FLOW[index + 1];
  return next ? [current, next] : [current];
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

interface OrderTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  updatingOrderId?: string | null;
}

export const OrderTable = ({
  orders,
  onStatusChange,
  updatingOrderId
}: OrderTableProps) => (
  <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/80 shadow-soft">
    <table className="min-w-full text-left text-sm">
      <thead className="bg-mist/70 text-xs uppercase tracking-widest text-slate">
        <tr>
          <th className="px-4 py-3">Order ID</th>
          <th className="px-4 py-3">Customer</th>
          <th className="px-4 py-3">Phone</th>
          <th className="px-4 py-3">Garments</th>
          <th className="px-4 py-3">Total</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Est. Delivery</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/10">
        {orders.map((order) => (
          <tr key={order.orderId} className="bg-white/70">
            <td className="px-4 py-4 font-semibold text-ink">
              {order.orderId}
            </td>
            <td className="px-4 py-4">{order.customerName}</td>
            <td className="px-4 py-4">{order.phoneNumber}</td>
            <td className="px-4 py-4 text-slate">
              {order.garments
                .map((garment) => `${garment.quantity}x ${garment.name}`)
                .join(", ")}
            </td>
            <td className="px-4 py-4 font-semibold">
              {formatCurrency(order.totalAmount)}
            </td>
            <td className="px-4 py-4">
              <StatusBadge status={order.status} />
            </td>
            <td className="px-4 py-4">
              {format(new Date(order.estimatedDeliveryDate), "dd MMM yyyy")}
            </td>
            <td className="px-4 py-4">
              <select
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-xs"
                value={order.status}
                disabled={order.status === "DELIVERED" || updatingOrderId === order.orderId}
                onChange={(event) =>
                  onStatusChange(order.orderId, event.target.value as OrderStatus)
                }
              >
                {getAllowedStatuses(order.status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
