import axios from "axios";

const TOKEN_KEY = "laundryToken";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  },
);
