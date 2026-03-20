import { Medal, Award } from "lucide-react";

interface LeadCardProps {
  username: string;
  rank: number;
  discoveryCount: number;
  chestCount: number;
  xp: number;
}

const rankColors: Record<number, string> = {
  1: "text-[var(--color-game-gold)] bg-[var(--color-game-gold)]/10 border-[var(--color-game-gold)] shadow-[0_4px_0_var(--color-game-gold-dark)]",
  2: "text-zinc-400 bg-zinc-400/10 border-zinc-400 shadow-[0_4px_0_#a1a1aa]",
  3: "text-amber-700 bg-amber-700/10 border-amber-700 shadow-[0_4px_0_#78350f]",
};

export const LeadCard = ({
  discoveryCount,
  chestCount,
  rank,
  username,
  xp,
}: LeadCardProps) => {
  const rankColor =
    rankColors[rank] ||
    "text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] border-[var(--color-border)] shadow-[0_4px_0_var(--color-border)]";

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:translate-y-[-2px] ${rankColor}`}
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-black text-xl bg-black/5 dark:bg-white/5 border-2 border-inherit">
        {rank === 1 && <Medal className="w-6 h-6" />}
        {rank === 2 && <Medal className="w-6 h-6" />}
        {rank === 3 && <Medal className="w-6 h-6" />}
        {rank > 3 && rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-lg text-[var(--color-text-primary)] truncate uppercase tracking-tight">
          {username}
        </p>
        <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          <span>{discoveryCount} discovered</span>
          <span>•</span>
          <span>{chestCount} chests</span>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-inherit shrink-0">
        <Award className="w-4 h-4 text-[var(--color-game-gold)]" />
        <span className="font-black text-[var(--color-game-gold)]">
          {xp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
};
