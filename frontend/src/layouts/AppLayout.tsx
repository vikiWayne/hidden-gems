/**
 * App layout - shell for header, tabs, main content, FAB, modals.
 * Business logic stays in App; this is structural only.
 */

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Header, TabNav } from "@/components/Header";
import type { TabType } from "@/routes";

interface AppLayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSettingsClick: () => void;
  onDropClick: () => void;
  children: ReactNode;
  modals: ReactNode;
}

export function AppLayout({
  activeTab,
  onTabChange,
  onSettingsClick,
  onDropClick,
  children,
  modals,
}: AppLayoutProps) {
  return (
    <>
      <Header onSettingsClick={onSettingsClick} />
      <TabNav activeTab={activeTab} onTabChange={onTabChange} />

      <main className="container mx-auto px-4">
        {children}
      </main>

      <div className="fixed bottom-6 right-6">
        <button
          onClick={onDropClick}
          className="w-14 h-14 rounded-full bg-[var(--color-game-purple)] text-white flex items-center justify-center shadow-[0_4px_0_var(--color-game-purple-dark)] active:translate-y-1 active:shadow-none hover:brightness-110 transition-all z-40"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {modals}
    </>
  );
}
