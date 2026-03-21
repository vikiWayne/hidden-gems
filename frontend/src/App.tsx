import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/layouts/AppLayout";
import { ExplorePage } from "@/pages/ExplorePage";
import { MyCollectionPage } from "@/pages/MyCollectionPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { DropMessageModal } from "@/components/DropMessageModal";
import { SettingsModal } from "@/components/SettingsModal";
import { StackItemDetailModal } from "@/components/StackItemDetailModal";
import { ClaimRewardFlyover } from "@/components/ClaimRewardFlyover";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useResolvedTheme } from "@/store/useThemeStore";
import { useGameStore } from "@/store/useGameStore";
import { injectTheme, type ThemeKey } from "@/config/theme";
import { TAB_FROM_PATH, PATH_FROM_TAB, type TabType } from "@/routes";

function AppContent() {
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedTheme = useResolvedTheme();
  const { chestHunterMode } = useGameStore();

  const currentTheme: ThemeKey = chestHunterMode
    ? "chest-hunter"
    : resolvedTheme;
  const activeTab: TabType = TAB_FROM_PATH[location.pathname] ?? "explore";

  const setActiveTab = (tab: TabType) => {
    navigate(PATH_FROM_TAB[tab]);
  };

  useEffect(() => {
    injectTheme(currentTheme);
  }, [currentTheme]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen font-['Nunito']" data-theme={currentTheme}>
        <AppLayout
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onDropClick={() => setIsDropModalOpen(true)}
          modals={
            <AnimatePresence>
              {isDropModalOpen && (
                <DropMessageModal onClose={() => setIsDropModalOpen(false)} />
              )}
              {isSettingsOpen && (
                <SettingsModal
                  isOpen={isSettingsOpen}
                  onClose={() => setIsSettingsOpen(false)}
                />
              )}
              <StackItemDetailModal />
              <ClaimRewardFlyover />
            </AnimatePresence>
          }
        >
          <Routes>
            <Route path="/explore" element={<ExplorePage />} />
            <Route
              path="/my-collection"
              element={
                <ProtectedRoute>
                  <MyCollectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tags"
              element={
                <ProtectedRoute>
                  <MyCollectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mytags"
              element={<Navigate to="/my-tags" replace />}
            />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </AppLayout>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/explore" replace />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
