/**
 * Axios instance - centralized HTTP client configuration
 */

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE = "/api";

// TODO - this export is temporary
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

const responseBody = (response: AxiosResponse) => response.data;
const errorBody = (error: AxiosError) => Promise.reject(error?.response);

const createRequests = () => {
  return {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
      apiClient.get<T>(url, config).then(responseBody).catch(errorBody),
    post: <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
      apiClient.post<T>(url, body, config).then(responseBody).catch(errorBody),
    put: <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
      apiClient.put<T>(url, body, config).then(responseBody).catch(errorBody),
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
      apiClient.delete<T>(url, config).then(responseBody).catch(errorBody),
    patch: <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
      apiClient.patch<T>(url, body, config).then(responseBody).catch(errorBody),
  };
};

export const requests = createRequests();
