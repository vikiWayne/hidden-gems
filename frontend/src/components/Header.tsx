import { Settings, Award, Coins } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { useAppStore } from "@/store/useAppStore";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import type { TabType } from "@/routes";

interface HeaderProps {
  onSettingsClick?: () => void;
}

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const { chestHunterMode } = useGameStore();
  const { xp, coins } = useUserStore();
  const { triggerClaimAnimation } = useAppStore();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-col">
          <h1
            className={`text-2xl font-black tracking-tight ${chestHunterMode ? "text-[var(--color-game-gold)]" : "text-[var(--color-game-blue)]"}`}
          >
            {chestHunterMode ? "🗺️ TAPTAG" : "TAPTAG"}
          </h1>
          <div className="flex gap-3 mt-1">
            <div
              id="header-xp-badge"
              className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-black/5 dark:border-white/5"
            >
              <Award className="w-3.5 h-3.5 text-[var(--color-game-purple)]" />
              <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">
                {xp} XP
              </span>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={coins}
                id="header-coins-badge"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-black/5 dark:border-white/5"
              >
                <Coins className="w-3.5 h-3.5 text-[var(--color-game-gold)]" />
                <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">
                  {coins}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              triggerClaimAnimation(50, 10, rect);
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--color-game-green)] text-white text-xs font-black uppercase tracking-wider shadow-[0_3px_0_var(--color-game-green-dark)] active:translate-y-1 active:shadow-none transition-all"
          >
            Test XP
          </button>

          <button
            onClick={onSettingsClick}
            className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] border-2 border-transparent transition-all active:translate-y-0.5"
          >
            <Settings className="w-6 h-6 text-[var(--color-text-muted)]" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const { proximityState } = useAppStore();
  const { chestHunterMode } = useGameStore();

  const tabs: { id: TabType; label: string }[] = [
    { id: "explore", label: "Explore" },
    { id: "mycollection", label: "My Collection" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  const isAlert =
    proximityState === "near" ||
    proximityState === "unlocked" ||
    chestHunterMode;

  return (
    <nav className="sticky top-[73px] z-40 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] mb-4">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            let activeColor = "bg-[var(--color-game-blue)]";
            let shadowColor = "shadow-[0_4px_0_var(--color-game-blue-dark)]";

            if (isActive && isAlert) {
              if (chestHunterMode) {
                activeColor = "bg-[var(--color-game-gold)]";
                shadowColor = "shadow-[0_4px_0_var(--color-game-gold-dark)]";
              } else {
                activeColor = "bg-[var(--color-game-orange)]";
                shadowColor = "shadow-[0_4px_0_var(--color-game-orange-dark)]";
              }
            } else if (isActive) {
              activeColor = "bg-[var(--color-game-purple)]";
              shadowColor = "shadow-[0_4px_0_var(--color-game-purple-dark)]";
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex-1 min-w-[100px] px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all
                  ${isActive
                    ? `${activeColor} text-white ${shadowColor} translate-y-[-2px]`
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] active:translate-y-0.5"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
