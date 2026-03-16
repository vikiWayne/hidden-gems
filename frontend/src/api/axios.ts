/**
 * Axios instance - centralized HTTP client configuration
 */

import axios, { type AxiosError } from "axios";

const API_BASE = "/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message =
      err.response?.data?.message ?? err.message ?? "Request failed";
    return Promise.reject(new Error(message));
  }
);
