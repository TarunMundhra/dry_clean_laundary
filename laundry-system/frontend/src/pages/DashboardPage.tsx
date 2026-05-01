import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { ApiSuccess, DashboardStats } from "../types";
import { DashboardStats as DashboardStatsView } from "../components/DashboardStats";

export const DashboardPage = () => {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get<ApiSuccess<DashboardStats>>("/dashboard");
      return response.data.data;
    },
    staleTime: 15000,
    refetchInterval: 30000,
    refetchOnWindowFocus: false
  });

  const errorMessage = (() => {
    if (!query.error) {
      return null;
    }
    if (axios.isAxiosError(query.error)) {
      return query.error.response?.data?.error?.message ?? "Failed to load stats";
    }
    return "Failed to load stats";
  })();

  if (query.isLoading && !query.data) {
    return <p className="text-slate">Loading dashboard...</p>;
  }

  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-slate/70">
          Daily overview
        </p>
        <h2 className="mt-2 font-display text-3xl">Laundry performance snapshot</h2>
        <p className="mt-3 text-sm text-slate">
          Monitor revenue, workload, and order flow in real-time. Stats refresh every 30 seconds.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {query.data && <DashboardStatsView stats={query.data} />}
    </section>
  );
};
