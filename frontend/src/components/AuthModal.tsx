/**
 * Authentication Modal
 * Tabbed interface for login and signup with username availability checking
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = "login",
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  const { isLoading } = useAuthStore();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ username: "", password: "", fullName: "" });
      setErrors({});
      setUsernameAvailable(null);
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Check username availability with debouncing
  useEffect(() => {
    if (!formData.username || activeTab !== "signup") {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const available = await authService.checkUsernameAvailable(
          formData.username,
        );
        setUsernameAvailable(available);
      } catch (error) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, activeTab]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (activeTab === "signup") {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (usernameAvailable === false) {
        newErrors.username = "Username is already taken";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (activeTab === "login") {
        await authService.login(formData.username, formData.password);
      } else {
        await authService.register(
          formData.username,
          formData.password,
          formData.fullName,
        );
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Authentication failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="w-full max-w-md rounded-[var(--radius-game)] bg-[var(--color-bg-primary)] border-4 border-[var(--color-border)] shadow-[0_20px_30px_rgba(0,0,0,0.35)] p-6 mx-0 md:mx-4 text-[var(--color-text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            id="auth-modal-title"
            className="text-2xl font-black tracking-wider text-[var(--color-text-primary)]"
          >
            {activeTab === "login" ? "🚀 TAPTAG Login" : "🌟 TAPTAG Sign Up"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            aria-label="Close auth modal"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 px-4 text-center rounded-l-lg ${
              activeTab === "login"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2 px-4 text-center rounded-r-lg ${
              activeTab === "signup"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.username
                  ? "border-red-500 focus:ring-red-200"
                  : usernameAvailable === false
                    ? "border-red-500 focus:ring-red-200"
                    : usernameAvailable === true
                      ? "border-green-500 focus:ring-green-200"
                      : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter username"
            />
            {checkingUsername && (
              <p className="text-sm text-gray-500 mt-1">
                Checking availability...
              </p>
            )}
            {usernameAvailable === true && activeTab === "signup" && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Username available
              </p>
            )}
            {usernameAvailable === false && activeTab === "signup" && (
              <p className="text-sm text-red-600 mt-1">✗ Username taken</p>
            )}
            {errors.username && (
              <p className="text-sm text-red-600 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Full Name (signup only) */}
          {activeTab === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
              )}
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoading ||
              (activeTab === "signup" && usernameAvailable === false)
            }
            className="w-full bg-[var(--color-game-purple)] text-white py-2 px-4 rounded-xl shadow-[0_6px_0_var(--color-game-purple-dark)] hover:bg-[var(--color-game-pink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-game-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting || isLoading
              ? "Please wait..."
              : activeTab === "login"
                ? "Login"
                : "Sign Up"}
          </button>
        </form>

        {/* Tab Switch Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setActiveTab(activeTab === "login" ? "signup" : "login")
            }
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {activeTab === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
