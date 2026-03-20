import { motion } from "framer-motion";
import { X, Award, Coins, MapPin, Package, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useRuntimeConfigStore } from "@/store/useRuntimeConfigStore";
import { GameButton } from "@/components/GameButton";

export function StackItemDetailModal() {
  const { selectedStackItem, setSelectedStackItem } = useAppStore();
  const unlockDistance = useRuntimeConfigStore((s) => s.geo.UNLOCK_DISTANCE_M);
  const penalty = useRuntimeConfigStore((s) => s.penalty);
  if (!selectedStackItem) return null;

  const item =
    selectedStackItem.type === "message"
      ? selectedStackItem.data
      : selectedStackItem.type === "chest"
        ? selectedStackItem.data
        : selectedStackItem.type === "loot"
          ? selectedStackItem.data
          : null;

  if (!item) return null;
  const type = selectedStackItem.type;
  const dist = "distance" in item ? item.distance : 0;
  const isUnlocked = dist != null && dist <= unlockDistance;
  const date = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={() => setSelectedStackItem(null)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[var(--radius-game)] bg-[var(--color-bg-primary)] border-4 border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${type === "chest" ? "bg-[var(--color-game-gold)]/10 text-[var(--color-game-gold)]" : type === "loot" ? "bg-[var(--color-game-green)]/10 text-[var(--color-game-green)]" : "bg-[var(--color-game-purple)]/10 text-[var(--color-game-purple)]"}`}
            >
              {type === "chest" ? (
                <Package className="w-6 h-6" />
              ) : type === "loot" ? (
                <Award className="w-6 h-6" />
              ) : (
                <MapPin className="w-6 h-6" />
              )}
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">
              {type === "chest" ? "Treasure Chest" : type === "loot" ? (item as { type?: string }).type?.replace(/_/g, " ") ?? "Loot" : "Explorer Tag"}
            </h2>
          </div>
          <button
            onClick={() => setSelectedStackItem(null)}
            className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] border-2 border-transparent hover:border-[var(--color-border)] transition-all"
          >
            <X className="w-6 h-6 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)]">
              <p className="text-xl font-bold text-[var(--color-text-primary)] leading-relaxed italic">
                {isUnlocked
                  ? `"${item.content}"`
                  : "Reach nearby to unlock"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <Clock className="w-4 h-4" />
                <span className="text-[var(--color-text-primary)]">{date}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <Award className="w-4 h-4 text-[var(--color-game-purple)]" />
                <span className="text-[var(--color-text-primary)]">
                  {"xpReward" in item ? item.xpReward : 10} XP Possible
                </span>
              </div>
            </div>

            {type === "chest" && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-game-gold)]/10 border-2 border-[var(--color-game-gold)]/20">
                <Coins className="w-8 h-8 text-[var(--color-game-gold)]" />
                <div>
                  <p className="font-black text-[var(--color-game-gold)] uppercase tracking-widest text-xs">
                    Bonus Loot
                  </p>
                  <p className="text-[var(--color-text-primary)] font-bold text-sm">
                    Contains {(item as { coinReward?: number }).coinReward ?? 10} Coins & Bonus Loot
                  </p>
                </div>
              </div>
            )}

            {type === "loot" && "xpReward" in item && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-game-green)]/10 border-2 border-[var(--color-game-green)]/20">
                <Award className="w-8 h-8 text-[var(--color-game-green)]" />
                <div>
                  <p className="font-black text-[var(--color-game-green)] uppercase tracking-widest text-xs">
                    {"isPenalty" in item && item.isPenalty ? "Penalty!" : "Reward"}
                  </p>
                  <p className="text-[var(--color-text-primary)] font-bold text-sm">
                    {"isPenalty" in item && item.isPenalty
                      ? `Penalty: -${penalty.xpDrop} XP, -${penalty.coinDrop} Coins`
                      : `+${item.xpReward} XP, +${item.coinReward} Coins`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <GameButton
              color={type === "chest" ? "gold" : type === "loot" ? "green" : "purple"}
              className="w-full"
              onClick={() => setSelectedStackItem(null)}
            >
              Back to Explorer
            </GameButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
