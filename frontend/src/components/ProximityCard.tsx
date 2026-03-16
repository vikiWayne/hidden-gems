import { UNLOCK_DISTANCE_M } from "@/hooks/useLocation";
import { useAppStore } from "@/store/useAppStore";
import { useGameStore } from "@/store/useGameStore";
import { motion } from "framer-motion";
import { Gift, Lock, Mail, MapPin } from "lucide-react";
import { useRef } from "react";
import { ChestHunterCard } from "./ChestHunterCard";

export function ProximityCard() {
  const {
    selectedMessage,
    selectedChestId,
    setSelectedMessage,
    setSelectedChestId,
    setFlyToMarkerPosition,
    triggerClaimAnimation,
    proximityState,
    nearbyMessages,
  } = useAppStore();
  const { nearbyChests, chestHunterMode } = useGameStore();
  const claimButtonRef = useRef<HTMLDivElement>(null);

  const hiddenCount = nearbyMessages.filter(
    (m) => m.visibility === "private",
  ).length;
  const nearestChest = nearbyChests[0];

  const nearbyItems = [
    ...nearbyMessages.map((m) => ({ ...m, itemType: "message" as const })),
    ...nearbyChests.map((c) => ({ ...c, itemType: "chest" as const })),
  ]
    .filter((item) => (item.distance ?? Infinity) <= 300)
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    .slice(0, 5);

  const handleClaim = () => {
    if (nearestChest && claimButtonRef.current) {
      const rect = claimButtonRef.current.getBoundingClientRect();
      triggerClaimAnimation(nearestChest.xpReward, 10, rect, nearestChest.id);
    }
  };

  if (chestHunterMode && nearestChest && !selectedMessage) {
    const dist = Math.round(nearestChest.distance);
    const isUnlocked = dist <= UNLOCK_DISTANCE_M;

    return (
      <ChestHunterCard
        nearestChest={nearestChest}
        dist={dist}
        isUnlocked={isUnlocked}
        handleClaim={handleClaim}
        claimButtonRef={claimButtonRef}
      />
    );
  }

  if (!selectedMessage) {
    return (
      <div className="p-6 rounded-[var(--radius-game)] border-4 border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-[0_4px_0_var(--color-border)]">
        <h3 className="text-xl font-black text-[var(--color-text-muted)]">
          No tags detected...
        </h3>
        <p className="text-[var(--color-text-muted)] mt-2 font-medium">
          Keep exploring the world to unlock hidden messages!
        </p>
      </div>
    );
  }

  const dist = Math.round(selectedMessage.distance ?? 0);
  const progress = Math.min(100, 100 - (dist / 200) * 100);
  const isNear = proximityState === "near" || proximityState === "unlocked";
  const isUnlocked = proximityState === "unlocked";

  const statusColors = isUnlocked
    ? {
        border: "border-[var(--color-game-green)]",
        text: "text-[var(--color-game-green)]",
        shadow: "shadow-[0_8px_0_var(--color-game-green-dark)]",
        label: "✨ Tag Unlocked!",
      }
    : isNear
      ? {
          border: "border-[var(--color-game-orange)]",
          text: "text-[var(--color-game-orange)]",
          shadow: "shadow-[0_8px_0_var(--color-game-orange-dark)]",
          label: "🔥 Almost There!",
        }
      : {
          border: "border-[var(--color-game-blue)]",
          text: "text-[var(--color-game-blue)]",
          shadow: "shadow-[0_8px_0_var(--color-game-blue-dark)]",
          label: "📡 Tag Detected",
        };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div
        className={`p-6 rounded-[var(--radius-game)] border-4 ${statusColors.border} bg-[var(--color-bg-primary)] ${statusColors.shadow} transition-all duration-300`}
      >
        <p
          className={`font-black uppercase tracking-widest text-sm ${statusColors.text} mb-2`}
        >
          {statusColors.label}
        </p>

        <div className="flex items-baseline gap-2 mb-4 text-[var(--color-text-primary)]">
          <span className="text-6xl font-black leading-none">{dist}</span>
          <span className="text-xl font-black opacity-60 uppercase tracking-widest">
            M
          </span>
        </div>

        <div className="h-4 rounded-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${isUnlocked ? "bg-[var(--color-game-green)]" : isNear ? "bg-[var(--color-game-orange)]" : "bg-[var(--color-game-blue)]"}`}
          />
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)]">
          <p className="font-bold text-[var(--color-text-primary)]">
            {isUnlocked
              ? selectedMessage.content.length > 60
                ? `${selectedMessage.content.slice(0, 60)}...`
                : selectedMessage.content
              : "Reach nearby to unlock"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: MapPin,
            value: nearbyMessages.length,
            label: "Nearby",
            color: "text-[var(--color-game-purple)]",
          },
          {
            icon: Lock,
            value: hiddenCount,
            label: "To Unlock",
            color: "text-[var(--color-game-orange)]",
          },
          {
            icon: MapPin,
            value: 0,
            label: "Found",
            color: "text-[var(--color-game-green)]",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-[var(--color-bg-primary)] border-2 border-[var(--color-border)] rounded-2xl p-3 text-center shadow-[0_4px_0_var(--color-border)] active:translate-y-1 active:shadow-none transition-all"
          >
            <item.icon className={`w-5 h-5 mx-auto ${item.color} mb-1`} />
            <div className="text-xl font-black text-[var(--color-text-primary)]">
              {item.value}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {nearbyItems.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] ml-1">
            Explore Nearby
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {nearbyItems.map((item) => {
              const isChest = item.itemType === "chest";

              const isSelected =
                (item.itemType === "message" &&
                  selectedMessage?.id === item.id) ||
                (isChest && selectedChestId === item.id);
              const Icon = isChest ? Gift : Mail;
              const colorClass = isChest
                ? "text-[var(--color-game-gold)]"
                : "text-[var(--color-game-blue)]";
              const bgClass = isChest
                ? "bg-[var(--color-game-gold)]/10"
                : "bg-[var(--color-game-blue)]/10";

              return (
                <motion.div
                  key={`${item.itemType}-${item.id}`}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    if (item.itemType === "message") {
                      setSelectedMessage(item);
                    } else {
                      setSelectedChestId(item.id);
                    }
                    setFlyToMarkerPosition({
                      lat: item.location.latitude,
                      lng: item.location.longitude,
                    });
                  }}
                  className={`bg-[var(--color-bg-primary)] border-2 rounded-[1rem] p-3 flex flex-col gap-2 shadow-[0_4px_0_var(--color-border)] cursor-pointer group transition-all active:translate-y-1 active:shadow-none ${
                    isSelected
                      ? "border-[var(--color-game-purple)] shadow-[0_4px_0_var(--color-game-purple-dark)] ring-2 ring-[var(--color-game-purple)]/30"
                      : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-xl ${bgClass} ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-[10px] font-black tracking-wider text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-2 py-1 rounded-lg">
                      {Math.round(item.distance ?? 0)}m
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="font-bold text-sm text-[var(--color-text-primary)] leading-tight">
                      {isChest
                        ? "Reach nearby to unlock"
                        : "Reach nearby to unlock"}
                    </p>
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      Tap to locate
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
