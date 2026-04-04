import { LeadCard, Spinner } from "@/components/ui";
import { useGetLeaderboard } from "@/services";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export function LeaderboardPage() {
  const { data, isLoading } = useGetLeaderboard();
  const leaderboard = (data?.data as any[]) ?? [];
  console.log("Leaderboard data:", data);

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
        {leaderboard.map((entry, i) => (
          <motion.div
            key={entry.username}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <LeadCard
              discoveryCount={entry.discovered}
              chestCount={entry.chestsFound}
              rank={entry.rank}
              username={entry.username}
              xp={entry.xp}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
