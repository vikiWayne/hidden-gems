import { useRef, useCallback } from "react";
import { useLocation } from "@/hooks/useLocation";
import { useUserNearbyItems } from "@/hooks/useUserNearbyItems";
import { useViewportMapItems } from "@/hooks/useViewportMapItems";
import { useSeedNearby } from "@/hooks/useSeedNearby";
import { useAppStore } from "@/store/useAppStore";
import { useGameStore } from "@/store/useGameStore";
import { MapView } from "@/components/MapView";
import { ProximityCard } from "@/components/ProximityCard";
import { TagUnlockedCard } from "@/components/TagUnlockedCard";
import { AnimatePresence, motion } from "framer-motion";
import { LocationError, Spinner } from "@/components/ui";

export function ExplorePage() {
  const { userLocation } = useLocation();
  const { proximityState, isLocationLoading, locationError } = useAppStore();
  const { chestHunterMode } = useGameStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // User-nearby: drives proximity, theme, nearby list (stable when panning)
  useUserNearbyItems();
  // Viewport: fetches items in map view when user pans (for exploration)
  useViewportMapItems();
  useSeedNearby(userLocation);

  const handleFullscreen = useCallback(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);


  if (locationError) {
    return (
      <LocationError errorMessage={locationError} />
    );
  }

  if (isLocationLoading || !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner className="mb-4" size="lg" />
        <p className="text-[var(--color-text-muted)] animate-pulse font-black uppercase tracking-widest text-xs">
          Locating Explorer...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20">
      {/* Left column: Map */}
      <div
        ref={mapContainerRef}
        className="map-fullscreen-container relative z-0 isolate min-h-[50vh] lg:min-h-[70vh] rounded-3xl overflow-hidden border-4 border-[var(--color-border)] shadow-2xl order-1"
      >
        <MapView />

        {/* Overlay pulse for nearest item if any */}
        {proximityState === "near" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-[var(--color-game-orange)] text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg animate-bounce">
              Something is close!
            </div>
          </div>
        )}
      </div>

      {/* Right column: Proximity card + CTA */}
      <div className="flex flex-col gap-4 order-2">
        <div className="flex-1 space-y-4">
          <AnimatePresence mode="wait">
            {proximityState === "unlocked" ? (
              <motion.div
                key="unlocked-card"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <TagUnlockedCard />
              </motion.div>
            ) : (
              <motion.div
                key="proximity-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <ProximityCard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className={`p-6 rounded-3xl border-4 ${chestHunterMode ? "bg-[var(--color-game-gold)]/10 border-[var(--color-game-gold)]" : "bg-[var(--color-game-blue)]/10 border-[var(--color-game-blue)]"}`}
        >
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">
            {chestHunterMode ? "Golden Chests Nearby!" : "Explore Your World"}
          </h3>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4">
            {chestHunterMode
              ? "Find hidden golden chests on the map to earn massive amounts of XP and rare badges!"
              : "Walk around to discover messages left by other explorers. Get within 20 meters to unlock them."}
          </p>
          <button
            onClick={handleFullscreen}
            className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest text-white transition-all active:translate-y-1 ${chestHunterMode
              ? "bg-[var(--color-game-gold)] shadow-[0_4px_0_var(--color-game-gold-dark)]"
              : "bg-[var(--color-game-blue)] shadow-[0_4px_0_var(--color-game-blue-dark)]"
              }`}
          >
            View Map Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}
