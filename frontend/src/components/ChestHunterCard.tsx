import type { NearbyChest } from "@/api";
import { GameButton } from "@/components/GameButton";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";

interface ChestHunterCardProps {
    nearestChest: NearbyChest;
    dist: number;
    isUnlocked: boolean;
    handleClaim: () => void;
    claimButtonRef: React.RefObject<HTMLDivElement | null>;
}

export const ChestHunterCard = (props: ChestHunterCardProps) => {
    const { nearestChest, dist, isUnlocked, handleClaim, claimButtonRef } = props;
     return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[var(--radius-game)] border-4 border-[var(--color-game-gold)] bg-[var(--color-bg-primary)] shadow-[0_8px_0_var(--color-game-gold-dark)]"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[var(--color-game-gold)] font-black uppercase tracking-wider text-sm mb-1">
              🎯 Chest Hunter
            </p>
            <h3 className="text-xl font-black text-[var(--color-text-primary)]">
              {isUnlocked ? "Ready to open!" : "Treasure is nearby!"}
            </h3>
          </div>
          <Gift
            className={`w-10 h-10 ${isUnlocked ? "text-[var(--color-game-gold)] animate-bounce" : "text-[var(--color-text-muted)]"}`}
          />
        </div>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-6xl font-black text-[var(--color-text-primary)] leading-none">
            {dist}
          </span>
          <span className="text-xl font-black text-[var(--color-text-muted)] uppercase tracking-widest">
            M AWAY
          </span>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)]">
          <p className="font-bold text-[var(--color-text-primary)]">
            {isUnlocked ? nearestChest.content : "Reach nearby to unlock"}
          </p>
        </div>

        <div className="mt-6" ref={claimButtonRef}>
          {isUnlocked ? (
            <GameButton color="gold" onClick={handleClaim} className="w-full">
              CLAIM REWARD (+{nearestChest.xpReward} XP)
            </GameButton>
          ) : (
            <p className="text-sm font-black text-[var(--color-game-green)] uppercase tracking-widest">
              +{nearestChest.xpReward} XP reward when found!
            </p>
          )}
        </div>
      </motion.div>
    );
};