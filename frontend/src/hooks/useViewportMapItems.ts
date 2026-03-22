import { api } from "@/api/client";
import { useViewportStore } from "@/store/useViewportStore";
import { useCallback, useEffect, useRef } from "react";

import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";

/** Padding factor to expand viewport when fetching (1.2 = 20% extra) */
const VIEWPORT_PADDING = 1.2;

/** Debounce ms for viewport fetch */
const VIEWPORT_DEBOUNCE_MS = 300;

function expandBounds(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  padding: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latSpan = (maxLat - minLat) * (padding - 1) * 0.5;
  const lngSpan = (maxLng - minLng) * (padding - 1) * 0.5;
  return {
    minLat: minLat - latSpan,
    maxLat: maxLat + latSpan,
    minLng: minLng - lngSpan,
    maxLng: maxLng + lngSpan,
  };
}

/**
 * Fetches items in the current map viewport for display when user pans.
 * Does NOT update proximity, theme, or nearby list - those are driven by useUserNearbyItems.
 */
export function useViewportMapItems() {
  const { viewportBounds, setViewportData, setViewportLoading } =
    useViewportStore();
  const { userId } = useAuthStore();
  const mapFilter = useAppStore((s) => s.mapFilter);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchViewport = useCallback(async () => {
    if (!viewportBounds || !userId) return;

    setViewportLoading(true);
    try {
      const expanded = expandBounds(
        viewportBounds.minLat,
        viewportBounds.maxLat,
        viewportBounds.minLng,
        viewportBounds.maxLng,
        VIEWPORT_PADDING,
      );

      const { messages, chests, lootItems } = await api.getMapViewport({
        minLat: expanded.minLat,
        maxLat: expanded.maxLat,
        minLng: expanded.minLng,
        maxLng: expanded.maxLng,
        userId,
        filter: mapFilter,
      });

      setViewportData({ messages, chests, lootItems });
    } catch {
      setViewportData({
        messages: [],
        chests: [],
        lootItems: [],
      });
    } finally {
      setViewportLoading(false);
    }
  }, [viewportBounds, userId, mapFilter, setViewportData, setViewportLoading]);

  useEffect(() => {
    if (!viewportBounds) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchViewport();
      debounceRef.current = null;
    }, VIEWPORT_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [viewportBounds, fetchViewport]);
}
