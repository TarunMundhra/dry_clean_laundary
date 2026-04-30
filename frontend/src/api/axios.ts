// @ts-nocheck
import axios from "axios";

// Route API traffic through Nginx so edge features (rate limiting, logging) apply.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/api/";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // THIS IS THE MAGIC LINE: It tells the browser to send your secure JWT cookies
  // with every single request to the backend.
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Optional but highly recommended: Add an interceptor to catch 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Authentication required. Redirecting to login...");
      // You can add logic here later to clear the user's local state
      // or redirect them to the home page if their token expires.
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
