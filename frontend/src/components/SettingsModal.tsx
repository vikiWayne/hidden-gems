import { motion } from "framer-motion";
import { X, Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import type { Theme } from "@/store/useThemeStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useThemeStore();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[var(--radius-game)] bg-[var(--color-bg-primary)] border-4 border-[var(--color-border)] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-[var(--color-border)]">
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] border-2 border-transparent hover:border-[var(--color-border)] transition-all active:translate-y-0.5"
          >
            <X className="w-6 h-6 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4 ml-1">
              Appearance
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: "light",
                  label: "Light",
                  icon: Sun,
                  color: "text-[var(--color-game-orange)]",
                  activeBg: "bg-[var(--color-game-orange)]",
                  activeShadow:
                    "shadow-[0_4px_0_var(--color-game-orange-dark)]",
                },
                {
                  id: "dark",
                  label: "Dark",
                  icon: Moon,
                  color: "text-[var(--color-game-blue)]",
                  activeBg: "bg-[var(--color-game-blue)]",
                  activeShadow: "shadow-[0_4px_0_var(--color-game-blue-dark)]",
                },
                {
                  id: "system",
                  label: "System",
                  icon: Monitor,
                  color: "text-[var(--color-game-purple)]",
                  activeBg: "bg-[var(--color-game-purple)]",
                  activeShadow:
                    "shadow-[0_4px_0_var(--color-game-purple-dark)]",
                },
              ].map((item) => {
                const isActive = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as Theme)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all group
                      ${isActive
                        ? `${item.activeBg} text-white border-transparent ${item.activeShadow} translate-y-[-2px]`
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-text-muted)] active:translate-y-0.5"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-8 h-8 ${isActive ? "text-white" : item.color} transition-colors group-hover:scale-110 duration-200`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
