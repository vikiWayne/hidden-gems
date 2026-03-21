/**
 * Protected Route Component
 * Redirects unauthenticated users or shows auth modal
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showModal?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/explore",
  showModal = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated && showModal) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, showModal]);

  if (!isAuthenticated) {
    if (showModal) {
      return (
        <>
          {children}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => setShowAuthModal(false)}
          />
        </>
      );
    } else {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};
