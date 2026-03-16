import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { useLeaderboardQuery } from "@/services";
import { Spinner } from "@/components/ui";

export function LeaderboardPage() {
  const { data, isLoading } = useLeaderboardQuery();
  const leaderboard = data?.leaderboard ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-6 pb-24"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-game-gold)]/10 border-4 border-[var(--color-game-gold)]/20 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-[var(--color-game-gold)]" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
            World Rankings
          </h2>
          <p className="text-sm font-bold text-[var(--color-text-muted)]">
            Top explorers across the globe
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, i) => {
          const rankColors =
            {
              1: "text-[var(--color-game-gold)] bg-[var(--color-game-gold)]/10 border-[var(--color-game-gold)] shadow-[0_4px_0_var(--color-game-gold-dark)]",
              2: "text-zinc-400 bg-zinc-400/10 border-zinc-400 shadow-[0_4px_0_#a1a1aa]",
              3: "text-amber-700 bg-amber-700/10 border-amber-700 shadow-[0_4px_0_#78350f]",
            }[entry.rank] ||
            "text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] border-[var(--color-border)] shadow-[0_4px_0_var(--color-border)]";

          return (
            <motion.div
              key={entry.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:translate-y-[-2px] ${rankColors}`}
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-black text-xl bg-black/5 dark:bg-white/5 border-2 border-inherit">
                {entry.rank === 1 && <Medal className="w-6 h-6" />}
                {entry.rank === 2 && <Medal className="w-6 h-6" />}
                {entry.rank === 3 && <Medal className="w-6 h-6" />}
                {entry.rank > 3 && entry.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-lg text-[var(--color-text-primary)] truncate uppercase tracking-tight">
                  {entry.username}
                </p>
                <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                  <span>{entry.discovered} discovered</span>
                  <span>•</span>
                  <span>{entry.chestsFound} chests</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-inherit shrink-0">
                <Award className="w-4 h-4 text-[var(--color-game-gold)]" />
                <span className="font-black text-[var(--color-game-gold)]">
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
