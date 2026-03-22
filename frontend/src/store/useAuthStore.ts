/**
 * Authentication Store
 * Manages user authentication state (user, token, login status)
 * Persists to localStorage for session continuity
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  userId: string;
  username: string;
  fullName: string;
}

interface AuthState {
  // State
  userId: string | null;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          userId: user?.userId || null,
        });
      },
      setToken: (token) => set({ token }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          userId: null,
        }),
    }),
    {
      name: "postbox-auth", // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        userId: state.userId,
      }), // Only persist user and token
    },
  ),
);
