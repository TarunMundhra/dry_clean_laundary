import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api/client";
import { ApiSuccess, LoginRequest, LoginResponse } from "../types";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      const response = await api.post<ApiSuccess<LoginResponse>>(
        "/auth/login",
        values as LoginRequest,
      );
      setToken(response.data.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message ?? "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-slate/70">Welcome back</p>
        <h2 className="mt-2 font-display text-3xl">Laundry Admin</h2>
        <p className="mt-3 text-sm text-slate">
          Use the admin credentials to access orders and dashboards.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate">Username</label>
            <input
              {...register("username")}
              className="mt-2 w-full rounded-xl border border-ink/20 px-4 py-2"
              placeholder="admin"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate">Password</label>
            <input
              type="password"
              {...register("password")}
              className="mt-2 w-full rounded-xl border border-ink/20 px-4 py-2"
              placeholder="admin123"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};
