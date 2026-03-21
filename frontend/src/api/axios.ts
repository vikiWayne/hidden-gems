/**
 * Axios instance - centralized HTTP client configuration
 */

import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE = "/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message =
      err.response?.data?.message ?? err.message ?? "Request failed";
    return Promise.reject(new Error(message));
  },
);
