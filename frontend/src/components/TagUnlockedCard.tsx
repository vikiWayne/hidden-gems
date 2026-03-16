import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Share2, ThumbsUp, Trophy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { GameButton } from "@/components/GameButton";
import { useRef } from "react";

export function TagUnlockedCard() {
  const {
    selectedMessage,
    proximityState,
    markMessageOpened,
    isMessageClaimed,
    markMessageClaimed,
    triggerClaimAnimation,
  } = useAppStore();

  const claimButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (proximityState === "unlocked" && selectedMessage) {
      markMessageOpened(selectedMessage.id);
    }
  }, [proximityState, selectedMessage, markMessageOpened]);

  if (proximityState !== "unlocked" || !selectedMessage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="p-6 rounded-[var(--radius-game)] border-4 border-[var(--color-game-blue)] bg-[var(--color-bg-primary)] shadow-[0_8px_0_var(--color-game-blue-dark)]"
    >
      <div className="flex items-center gap-4 mb-4 text-[var(--color-game-blue)]">
        <div className="w-12 h-12 rounded-full bg-[var(--color-game-blue)] text-white flex items-center justify-center">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Tag Unlocked!
        </h2>
      </div>

      <p className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">
        You discovered a hidden spot!
      </p>

      {selectedMessage && isMessageClaimed(selectedMessage.id) ? (
        <p className="text-sm font-black text-[var(--color-game-green)] uppercase tracking-widest mt-1">
          +5 XP claimed
        </p>
      ) : (
        <p className="text-sm font-black text-[var(--color-game-blue)] uppercase tracking-widest mt-1">
          +5 XP available
        </p>
      )}

      {selectedMessage && !isMessageClaimed(selectedMessage.id) && (
        <div className="mt-4">
          <GameButton
            ref={claimButtonRef}
            color="gold"
            className="w-full flex items-center justify-center gap-2 shadow-[0_4px_0_var(--color-game-gold-dark)]"
            onClick={() => {
              if (claimButtonRef.current) {
                triggerClaimAnimation(5, 0, claimButtonRef.current.getBoundingClientRect());
              }
              markMessageClaimed(selectedMessage.id);
            }}
          >
            <Trophy className="w-5 h-5 text-white" />
            Claim +5 XP
          </GameButton>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 font-bold text-xs border-2 border-zinc-300 dark:border-zinc-600">
            ?
          </div>
          <span className="text-sm text-[var(--color-text-muted)] font-bold italic">
            Left by Anonymous
          </span>
        </div>

        {selectedMessage.category && (
          <span className="inline-block px-3 py-1 rounded-lg bg-[var(--color-game-blue)]/10 text-[var(--color-game-blue)] text-xs font-black uppercase tracking-widest mb-4">
            {selectedMessage.category}
          </span>
        )}

        <div className="mt-2">
          {selectedMessage.type === "voice" &&
            (selectedMessage.mediaUrl ||
              selectedMessage.content?.startsWith("data:")) && (
              <audio
                src={selectedMessage.mediaUrl ?? selectedMessage.content}
                controls
                className="w-full mt-2"
              />
            )}
          {selectedMessage.type === "image" &&
            (selectedMessage.mediaUrl ||
              selectedMessage.content?.startsWith("data:")) && (
              <div className="mt-2 rounded-2xl overflow-hidden border-2 border-[var(--color-border)]">
                <img
                  src={selectedMessage.mediaUrl ?? selectedMessage.content}
                  alt=""
                  className="w-full max-h-48 object-cover"
                />
              </div>
            )}
          {selectedMessage.type === "video" &&
            (selectedMessage.mediaUrl ||
              selectedMessage.content?.startsWith("data:")) && (
              <div className="mt-2 rounded-2xl overflow-hidden border-2 border-[var(--color-border)]">
                <video
                  src={selectedMessage.mediaUrl ?? selectedMessage.content}
                  controls
                  className="w-full"
                />
              </div>
            )}
          {(!selectedMessage.type || selectedMessage.type === "text") && (
            <p className="text-[var(--color-text-primary)] leading-relaxed text-lg font-bold">
              {selectedMessage.content}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-8">
        <GameButton
          color="green"
          className="w-full flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share This Tag
        </GameButton>
        <GameButton
          color="gray"
          className="w-full flex items-center justify-center gap-2"
        >
          <ThumbsUp className="w-5 h-5" />
          Upvote (0)
        </GameButton>
      </div>
    </motion.div>
  );
}
