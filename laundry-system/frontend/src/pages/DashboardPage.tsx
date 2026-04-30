import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { ApiSuccess, DashboardStats } from "../types";
import { DashboardStats as DashboardStatsView } from "../components/DashboardStats";

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiSuccess<DashboardStats>>("/dashboard");
      setStats(response.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message ?? "Failed to load stats");
      } else {
        setError("Failed to load stats");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = window.setInterval(fetchStats, 30000);
    return () => window.clearInterval(interval);
  }, [fetchStats]);

  if (loading && !stats) {
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

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {stats && <DashboardStatsView stats={stats} />}
    </section>
  );
};
