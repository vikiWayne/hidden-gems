/**
 * Authentication Context Provider
 * Provides auth state and methods throughout the app
 */
import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: { userId: string; username: string; fullName: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<any>;
  register: (
    username: string,
    password: string,
    fullName: string,
  ) => Promise<any>;
  logout: () => void;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Load auth state from localStorage on mount
  useEffect(() => {
    // The persist middleware should handle this automatically
    // But we can add additional initialization logic here if needed
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
    checkUsernameAvailable: authService.checkUsernameAvailable,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
