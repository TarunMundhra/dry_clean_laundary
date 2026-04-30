import { OrderStatus } from "../types";

interface FilterBarProps {
  status: OrderStatus | "ALL";
  search: string;
  onStatusChange: (value: OrderStatus | "ALL") => void;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export const FilterBar = ({
  status,
  search,
  onStatusChange,
  onSearchChange,
  onCreate
}: FilterBarProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft md:flex-row md:items-center md:justify-between">
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as OrderStatus | "ALL")}
        className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm"
      >
        <option value="ALL">All statuses</option>
        <option value="RECEIVED">Received</option>
        <option value="PROCESSING">Processing</option>
        <option value="READY">Ready</option>
        <option value="DELIVERED">Delivered</option>
      </select>
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="min-w-[200px] rounded-full border border-ink/20 bg-white px-4 py-2 text-sm"
        placeholder="Search by name, phone, or order ID"
      />
    </div>
    <button
      type="button"
      onClick={onCreate}
      className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper"
    >
      Create Order
    </button>
  </div>
);
