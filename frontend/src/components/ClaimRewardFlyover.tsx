import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useUserStore } from "@/store/useUserStore";
import { useGameStore } from "@/store/useGameStore";
import { useRuntimeConfigStore } from "@/store/useRuntimeConfigStore";
import { claimChest } from "@/services/chestsService/chests.service";
import { Award } from "lucide-react";
import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  GetMapViewportResponse,
  GetMyItemsResponse,
} from "@/api/types/responses";
import { useAuthStore } from "@/store/useAuthStore";

const ANIMATION_DURATION_MS = 1200;
const COIN_COUNT = 8;

function playClaimSound() {
  try {
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    )();
    const now = ctx.currentTime;

    // Gold coin "bling" - two-tone chime
    const playTone = (
      freq: number,
      start: number,
      duration: number,
      gain: number,
    ) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    playTone(880, 0, 0.08, 0.15);
    playTone(1320, 0.05, 0.1, 0.12);
    playTone(1760, 0.1, 0.12, 0.08);
  } catch {
    // Audio not supported
  }
}

const GoldCoin = ({ id }: { id: number }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className="drop-shadow-md"
  >
    <defs>
      <linearGradient id={`goldGrad-${id}`} x1="4" y1="4" x2="20" y2="20">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <circle
      cx="12"
      cy="12"
      r="10"
      fill={`url(#goldGrad-${id})`}
      stroke="#d4a017"
      strokeWidth="1.5"
    />
    <circle
      cx="12"
      cy="12"
      r="6"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="1"
      opacity="0.6"
    />
  </svg>
);

export function ClaimRewardFlyover() {
  const {
    claimAnimation,
    clearClaimAnimation,
    setSelectedMessage,
    setSelectedChestId,
    setProximityState,
    isMessageOpened,
  } = useAppStore();
  const { addXp, addCoins } = useUserStore();
  const { userId } = useAuthStore();
  const { claimChest } = useGameStore();
  const unlockDistance = useRuntimeConfigStore((s) => s.geo.UNLOCK_DISTANCE_M);
  const queryClient = useQueryClient();
  const hasAppliedRef = useRef(false);
  const soundPlayedRef = useRef(false);

  const applyReward = useCallback(async () => {
    if (!claimAnimation || hasAppliedRef.current) return;
    hasAppliedRef.current = true;
    addXp(claimAnimation.xp);
    addCoins(claimAnimation.coins);
    if (claimAnimation.chestId && userId) {
      const { nearbyChests } = useGameStore.getState();
      const claimedChest = nearbyChests.find(
        (c) => c.id === claimAnimation.chestId,
      );

      try {
        await claimChest(claimAnimation.chestId, userId);
        queryClient.setQueriesData(
          { queryKey: ["map"] },
          (prev: GetMapViewportResponse | undefined) =>
            prev
              ? {
                  ...prev,
                  chests: prev.chests.filter(
                    (c) => c.id !== claimAnimation.chestId,
                  ),
                }
              : prev,
        );
        queryClient.setQueriesData(
          { queryKey: ["users", "me", "items"] },
          (prev: GetMyItemsResponse | undefined) => {
            if (!prev || !claimedChest) return prev;
            return {
              ...prev,
              foundChests: [
                {
                  id: `temp-found-${Date.now()}`,
                  itemId: claimedChest.id,
                  content: claimedChest.content,
                  xpReward: claimedChest.xpReward,
                  finderOrdinal: 0,
                  foundAt: new Date().toISOString(),
                },
                ...prev.foundChests,
              ],
            };
          },
        );
      } catch {
        addXp(-claimAnimation.xp);
        addCoins(-claimAnimation.coins);
        clearClaimAnimation();
        return;
      }
      claimChest(claimAnimation.chestId);
      queryClient.invalidateQueries({
        queryKey: ["users", "me", "items", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["map"] });

      // Select next nearest item (message or chest)
      const { nearbyMessages } = useAppStore.getState();
      const unopenedMessages = nearbyMessages.filter(
        (m) => !isMessageOpened(m.id),
      );
      const items = [
        ...unopenedMessages.map((m) => ({
          ...m,
          itemType: "message" as const,
        })),
        ...nearbyChests.map((c) => ({ ...c, itemType: "chest" as const })),
      ]
        .filter((i) => (i.distance ?? Infinity) <= 300)
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      const next = items[0];
      if (next) {
        if (next.itemType === "message") {
          setSelectedChestId(null);
          setSelectedMessage(next);
          const dist = next.distance ?? Infinity;
          setProximityState(
            dist <= unlockDistance
              ? "unlocked"
              : dist <= unlockDistance * 2
                ? "near"
                : "far",
          );
        } else {
          setSelectedMessage(null);
          setSelectedChestId(next.id);
          setProximityState("far");
        }
      } else {
        setSelectedMessage(null);
        setSelectedChestId(null);
        setProximityState("far");
      }
    }
    clearClaimAnimation();
  }, [
    claimAnimation,
    addXp,
    addCoins,
    claimChest,
    clearClaimAnimation,
    userId,
    isMessageOpened,
    setSelectedMessage,
    setSelectedChestId,
    setProximityState,
    unlockDistance,
    queryClient,
  ]);

  useEffect(() => {
    if (!claimAnimation) {
      hasAppliedRef.current = false;
      soundPlayedRef.current = false;
      return;
    }

    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playClaimSound();
    }

    const t = setTimeout(applyReward, ANIMATION_DURATION_MS);
    return () => clearTimeout(t);
  }, [claimAnimation, applyReward]);

  const [coinOffsets] = useState<{ x: number; y: number }[]>(() =>
    Array.from({ length: COIN_COUNT }).map(() => ({
      x: (Math.random() - 0.5) * 24,
      y: (Math.random() - 0.5) * 24,
    })),
  );

  if (!claimAnimation) return null;

  const fromRect = claimAnimation.fromRect;
  const toXp = document
    .getElementById("header-xp-badge")
    ?.getBoundingClientRect();

  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;
  const endX = toXp ? toXp.left + toXp.width / 2 : window.innerWidth * 0.2;
  const endY = toXp ? toXp.top + toXp.height / 2 : 40;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 pointer-events-none z-[9999]"
      >
        {/* Gold coins flying to XP badge */}
        {coinOffsets.map((offset, i) => (
          <motion.div
            key={i}
            initial={{
              left: startX + offset.x,
              top: startY + offset.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              left: endX + (i - COIN_COUNT / 2) * 6,
              top: endY,
              scale: 0.6,
              opacity: 0.95,
            }}
            transition={{
              duration: ANIMATION_DURATION_MS / 1000,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: i * 0.025,
            }}
            className="fixed -translate-x-1/2 -translate-y-1/2"
          >
            <GoldCoin id={i} />
          </motion.div>
        ))}
        {/* XP badge pop-in at destination */}
        <motion.div
          initial={{
            left: endX,
            top: endY,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: ANIMATION_DURATION_MS / 1000 - 0.2,
          }}
          className="fixed -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-game-purple)] text-white font-black text-sm shadow-lg"
        >
          <Award className="w-4 h-4" />+{claimAnimation.xp} XP
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
