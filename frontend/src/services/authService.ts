/**
 * Authentication Service
 * Wrapper around auth API methods with state management integration
 */
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/api/client";

export const authService = {
  /**
   * Register a new user
   */
  async register(username: string, password: string, fullName: string) {
    try {
      useAuthStore.getState().setIsLoading(true);
      const result = await api.register(username, password, fullName);

      // Update auth store
      useAuthStore.getState().setUser(result.user);
      useAuthStore.getState().setToken(result.token);

      return result;
    } finally {
      useAuthStore.getState().setIsLoading(false);
    }
  },

  /**
   * Login user
   */
  async login(username: string, password: string) {
    try {
      useAuthStore.getState().setIsLoading(true);
      const result = await api.login(username, password);

      // Update auth store
      useAuthStore.getState().setUser(result.user);
      useAuthStore.getState().setToken(result.token);

      return result;
    } finally {
      useAuthStore.getState().setIsLoading(false);
    }
  },

  /**
   * Logout user
   */
  logout() {
    useAuthStore.getState().logout();
  },

  /**
   * Check if username is available
   */
  async checkUsernameAvailable(username: string): Promise<boolean> {
    try {
      const result = await api.checkUsernameAvailable(username);
      return result.available;
    } catch (error) {
      // If API fails, assume available (fail open)
      console.warn("Failed to check username availability:", error);
      return true;
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const user = await api.getCurrentUser();
      // Update store with fresh data
      useAuthStore.getState().setUser(user);
      return user;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  },
};
