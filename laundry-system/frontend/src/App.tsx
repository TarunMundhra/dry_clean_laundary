import { ReactElement, ReactNode } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { clearToken, getToken } from "./api/client";

const Shell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper text-ink relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-10 h-72 w-72 rounded-full bg-coral/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-40 -left-24 h-64 w-64 rounded-full bg-teal/20 blur-3xl animate-float-slow" />

      <header className="relative z-10 px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate/70">Laundry Desk</p>
            <h1 className="font-display text-2xl md:text-3xl">Mini Laundry OMS</h1>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? "bg-ink text-paper" : "bg-mist text-ink"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? "bg-ink text-paper" : "bg-mist text-ink"
                }`
              }
            >
              Orders
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-ink/20 px-4 py-2 text-ink transition hover:border-ink/60"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-16 md:px-10">
        {children}
      </main>
    </div>
  );
};

const RequireAuth = ({ children }: { children: ReactElement }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={<Navigate to="/dashboard" replace />}
    />
    <Route
      path="/dashboard"
      element={
        <RequireAuth>
          <Shell>
            <DashboardPage />
          </Shell>
        </RequireAuth>
      }
    />
    <Route
      path="/orders"
      element={
        <RequireAuth>
          <Shell>
            <OrdersPage />
          </Shell>
        </RequireAuth>
      }
    />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
