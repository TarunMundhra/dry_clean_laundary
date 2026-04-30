import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGoogleLogin } from "@react-oauth/google";
import { axiosInstance } from "../api/axios";

const formatAuthError = (error) => {
  if (!error) return null;

  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach backend server at localhost:8000. Please start the backend service.";
  }

  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;

  if (status === 400 && typeof detail === "string") {
    if (detail.includes("Google token validation failed")) {
      return "Google sign-in failed. Please try again.";
    }
    if (detail.includes("GitHub token exchange failed")) {
      return "GitHub sign-in failed. Please try again.";
    }
    if (detail.includes("Google OAuth configuration mismatch")) {
      return "Google sign-in is temporarily unavailable due to backend configuration.";
    }
    if (detail.includes("GitHub OAuth is not configured")) {
      return "GitHub sign-in is not configured on the backend yet.";
    }
    return detail;
  }

  if (status >= 500) {
    return "Server error during sign-in. Please try again in a moment.";
  }

  return detail || error?.message || "Authentication failed.";
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [oauthError, setOauthError] = useState(null);

  // Fetch user profile (restoration)
  const {
    data: user,
    isLoading: loadingAuth,
    error: profileError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("auth/user/");
        return res.data;
      } catch (err) {
        // Missing/expired auth cookies are expected for signed-out users.
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (tokenResponse) => {
      const res = await axiosInstance.post("auth/google/", {
        access_token: tokenResponse.access_token,
      });
      return res.data.user;
    },
    onSuccess: (userData) => {
      setOauthError(null);
      queryClient.setQueryData(["user"], userData);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post("auth/logout-safe/");
    },
    onSuccess: () => {
      setOauthError(null);
      queryClient.setQueryData(["user"], null);
    },
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setOauthError(null);
      loginMutation.mutate(tokenResponse);
    },
    onError: () => setOauthError("Google login was closed or failed."),
  });

  const loginWithGitHub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) {
      setOauthError("Missing GitHub OAuth client id in frontend environment.");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const state =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`;

    sessionStorage.setItem("github_oauth_state", state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read:user user:email",
      state,
    });

    window.location.assign(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
    );
  };

  const logout = () => logoutMutation.mutate();

  const authError =
    oauthError ||
    formatAuthError(loginMutation.error) ||
    formatAuthError(logoutMutation.error) ||
    formatAuthError(profileError) ||
    null;

  return {
    user,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    loadingAuth,
    authError,
  };
};
