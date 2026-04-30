import { DashboardStats as DashboardStatsType } from "../types";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const pending = stats.ordersByStatus.RECEIVED + stats.ordersByStatus.PROCESSING;
  const cards = [
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue) },
    { label: "Orders Today", value: stats.ordersToday },
    { label: "Revenue Today", value: formatCurrency(stats.revenueToday) },
    { label: "Pending Orders", value: pending }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="rounded-2xl border border-ink/10 bg-white/80 px-5 py-4 shadow-soft animate-fade-up"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate/70">
            {card.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-ink">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};
