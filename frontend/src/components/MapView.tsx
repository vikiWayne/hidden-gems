import { useMemo, useCallback, useRef, useEffect } from "react";
import { LeafletMap } from "@/lib/map";
import type { MapMarkerConfig, MapMarkerPopupItem } from "@/lib/map";
import { useAppStore } from "@/store/useAppStore";
import { useGameStore } from "@/store/useGameStore";
import { useViewportStore } from "@/store/useViewportStore";
import { useResolvedTheme } from "@/store/useThemeStore";
import { useRuntimeConfigStore } from "@/store/useRuntimeConfigStore";
import { getThemeColors } from "@/config/theme";
import { LOOT_ITEM_ICONS } from "@/config/mapItems";
import type { ThemeKey } from "@/config/theme";

const LOC_PRECISION = 6;
function locKey(lat: number, lng: number) {
  return `${lat.toFixed(LOC_PRECISION)}_${lng.toFixed(LOC_PRECISION)}`;
}

function isInBounds(
  lat: number,
  lng: number,
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null,
): boolean {
  if (!bounds) return true;
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}

/** Merge and dedupe: prefer nearby (has distance from user) when id exists in both */
function mergeById<T extends { id: string }>(nearby: T[], viewport: T[]): T[] {
  const byId = new Map<string, T>();
  viewport.forEach((v) => byId.set(v.id, v));
  nearby.forEach((n) => byId.set(n.id, n)); // nearby overwrites - prefer user-based data
  return Array.from(byId.values());
}

export function MapView() {
  const {
    userLocation,
    nearbyMessages,
    proximityState,
    selectedMessage,
    selectedChestId,
    isMessageOpened,
    setSelectedStackItem,
    flyToMarkerPosition,
    setFlyToMarkerPosition,
  } = useAppStore();
  const { nearbyChests, nearbyLootItems, chestHunterMode, claimedChestIds } = useGameStore();
  const unlockDistance = useRuntimeConfigStore((s) => s.geo.UNLOCK_DISTANCE_M);
  const {
    viewportBounds,
    viewportMessages,
    viewportChests,
    viewportLootItems,
    setViewportBounds,
  } = useViewportStore();

  const mergedMessages = useMemo(
    () =>
      mergeById(nearbyMessages, viewportMessages).filter((m) =>
        isInBounds(m.location.latitude, m.location.longitude, viewportBounds),
      ),
    [nearbyMessages, viewportMessages, viewportBounds],
  );
  const mergedChests = useMemo(
    () =>
      mergeById(nearbyChests, viewportChests).filter((c) =>
        isInBounds(c.location.latitude, c.location.longitude, viewportBounds),
      ),
    [nearbyChests, viewportChests, viewportBounds],
  );
  const mergedLootItems = useMemo(
    () =>
      mergeById(nearbyLootItems, viewportLootItems).filter((l) =>
        isInBounds(l.location.latitude, l.location.longitude, viewportBounds),
      ),
    [nearbyLootItems, viewportLootItems, viewportBounds],
  );

  const handleStackItemSelect = useCallback(
    (id: string, type: "message" | "chest" | "loot") => {
      if (type === "message") {
        const msg = mergedMessages.find((m) => m.id === id);
        if (msg) setSelectedStackItem({ type: "message", data: msg });
      } else if (type === "chest") {
        const chest = mergedChests.find((c) => c.id === id);
        if (chest) setSelectedStackItem({ type: "chest", data: chest });
      } else if (type === "loot") {
        const loot = mergedLootItems.find((l) => l.id === id);
        if (loot) setSelectedStackItem({ type: "loot", data: loot });
      }
    },
    [mergedMessages, mergedChests, mergedLootItems, setSelectedStackItem],
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleViewportChange = useCallback(
    (bounds: {
      minLat: number;
      maxLat: number;
      minLng: number;
      maxLng: number;
    }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setViewportBounds(bounds);
        debounceRef.current = null;
      }, 150);
    },
    [setViewportBounds],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );
  const resolvedTheme = useResolvedTheme();
  const currentTheme: ThemeKey = chestHunterMode
    ? "chest-hunter"
    : resolvedTheme;
  const themeColors = useMemo(
    () => getThemeColors(currentTheme),
    [currentTheme],
  );

  const config = useMemo(
    () => ({
      center: userLocation
        ? {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
            alt: userLocation.altitude,
          }
        : { lat: 8.5241, lng: 76.9366 },
      zoom: 17,
      darkMode: resolvedTheme === "dark" && !chestHunterMode,
      chestHunterMode,
      flyToPosition: flyToMarkerPosition,
      themeColors: {
        game: { gold: themeColors.game.gold, blue: themeColors.game.blue },
        marker: themeColors.marker as Record<string, string>,
      },
    }),
    [
      userLocation,
      resolvedTheme,
      chestHunterMode,
      flyToMarkerPosition,
      themeColors,
    ],
  );

  const userPosition = userLocation
    ? {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        alt: userLocation.altitude,
      }
    : null;

  const markers: MapMarkerConfig[] = useMemo(() => {
    type GroupItem = {
      id: string;
      lat: number;
      lng: number;
      alt?: number;
      icon: MapMarkerConfig["icon"];
      color: MapMarkerConfig["color"];
      popupItem: MapMarkerPopupItem;
      isSelected?: boolean;
    };
    const groups = new Map<string, GroupItem[]>();

    const add = (item: GroupItem) => {
      const key = locKey(item.lat, item.lng);
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    };

    mergedMessages.forEach((msg) => {
      const isOwn = msg.isOwn === true;
      const isPrivate = msg.visibility === "private";
      const dist = msg.distance ?? Infinity;
      const isBeyondLocked = dist > unlockDistance * 5;
      const isUnlocked =
        proximityState === "unlocked" && selectedMessage?.id === msg.id;
      const isNear =
        proximityState === "near" && selectedMessage?.id === msg.id;
      const opened = isMessageOpened(msg.id) || isUnlocked;
      const isHidden = (isPrivate && !opened) || isBeyondLocked;
      const isSelected = selectedMessage?.id === msg.id && !opened;

      let icon: MapMarkerConfig["icon"] = "envelope-unopened";
      if (isHidden) {
        icon = "locked";
      } else {
        icon = opened ? "envelope-opened" : "envelope-unopened";
      }

      const userColor = (msg as { markerColor?: MapMarkerConfig["color"] })
        .markerColor;
      const baseColor: MapMarkerConfig["color"] =
        isHidden || opened
          ? "grey"
          : isUnlocked
            ? "green"
            : isNear
              ? "orange"
              : "purple";
      const color: MapMarkerConfig["color"] =
        isHidden || opened
          ? "grey"
          : (userColor ?? (isOwn ? "teal" : baseColor));

      add({
        id: msg.id,
        lat: msg.location.latitude,
        lng: msg.location.longitude,
        alt: msg.location.altitude,
        icon,
        color,
        isSelected,
        popupItem: {
          id: msg.id,
          type: "message",
          itemName: "Explorer Tag",
          title:
            isPrivate && !opened
              ? "Reach nearby to unlock"
              : isBeyondLocked && !opened
                ? "Reach nearby to unlock"
                : msg.content.slice(0, 50) +
                  (msg.content.length > 50 ? "..." : ""),
          distance: msg.distance,
        },
      });
    });

    mergedChests.forEach((chest) => {
      const dist = chest.distance ?? 0;
      const isBeyondLocked = dist > unlockDistance * 5;
      const isClaimable = dist <= unlockDistance;
      const isOwn = chest.isOwn === true;
      const isClaimed = claimedChestIds.includes(chest.id);

      const icon: MapMarkerConfig["icon"] = isClaimed
        ? "chest-opened"
        : isBeyondLocked
          ? "locked"
          : isClaimable
            ? "chest-opened"
            : "chest";

      add({
        id: `chest-${chest.id}`,
        lat: chest.location.latitude,
        lng: chest.location.longitude,
        alt: chest.location.altitude,
        icon,
        color: isClaimed
          ? "grey"
          : isBeyondLocked
            ? "grey"
            : isOwn
              ? "teal"
              : "gold",
        isSelected: selectedChestId === chest.id && !isClaimed,
        popupItem: {
          id: chest.id,
          type: "chest",
          itemName:
            chest.variant === "snake" ? "Snake Chest" : "Treasure Chest",
          title:
            isBeyondLocked && !isClaimed
              ? "Reach nearby to unlock"
              : chest.content,
          distance: chest.distance,
        },
      });
    });

    mergedLootItems.forEach((loot) => {
      const dist = loot.distance ?? 0;
      const isBeyondLocked = dist > unlockDistance * 5;
      const iconConfig = LOOT_ITEM_ICONS[loot.type] ?? LOOT_ITEM_ICONS.diamond;
      const icon: MapMarkerConfig["icon"] = loot.type;
      add({
        id: `loot-${loot.id}`,
        lat: loot.location.latitude,
        lng: loot.location.longitude,
        alt: loot.location.altitude,
        icon,
        color: isBeyondLocked ? "grey" : loot.isOwn ? "teal" : iconConfig.color,
        isSelected: false,
        popupItem: {
          id: loot.id,
          type: "loot",
          itemName: loot.type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          title: isBeyondLocked ? "Reach nearby to unlock" : loot.content,
          distance: loot.distance,
        },
      });
    });

    const result: MapMarkerConfig[] = [];
    groups.forEach((items, key) => {
      const first = items[0]!;
      const pos = { lat: first.lat, lng: first.lng, alt: first.alt };
      if (items.length === 1) {
        result.push({
          id: first.id,
          position: pos,
          icon: first.icon,
          color: first.color,
          isSelected: first.isSelected,
          popup: {
            title: first.popupItem.title,
            itemName: first.popupItem.itemName,
            distance: first.popupItem.distance,
          },
        });
      } else {
        const selectedMsgInStack =
          selectedMessage &&
          items.some(
            (i) =>
              i.popupItem.id === selectedMessage.id &&
              i.popupItem.type === "message",
          );
        const selectedChestInStack =
          selectedChestId &&
          items.some(
            (i) =>
              i.popupItem.id === selectedChestId &&
              i.popupItem.type === "chest",
          );
        const selectedInStack = Boolean(
          selectedMsgInStack || selectedChestInStack,
        );
        const firstSelected = selectedInStack
          ? items.find(
              (i) =>
                (selectedMessage &&
                  i.popupItem.id === selectedMessage.id &&
                  i.popupItem.type === "message") ||
                (selectedChestId &&
                  i.popupItem.id === selectedChestId &&
                  i.popupItem.type === "chest"),
            )
          : null;
        const shouldHighlight = Boolean(
          selectedInStack &&
          firstSelected &&
          !(
            firstSelected.popupItem.type === "message" &&
            isMessageOpened(firstSelected.popupItem.id)
          ),
        );
        let stackColor: MapMarkerConfig["color"] = "purple";
        if (selectedInStack && firstSelected) {
          const popupType = firstSelected.popupItem.type;
          const isMsg =
            popupType === "message"
              ? mergedMessages.find((m) => m.id === firstSelected.popupItem.id)
              : null;
          const isChestItem = popupType === "chest";
          const isLootItem = popupType === "loot";
          const lootItem = isLootItem
            ? mergedLootItems.find((l) => l.id === firstSelected.popupItem.id)
            : null;
          if (isMsg?.isOwn) stackColor = "teal";
          else if (isChestItem) stackColor = "gold";
          else if (isLootItem && lootItem)
            stackColor = lootItem.isOwn
              ? "teal"
              : (LOOT_ITEM_ICONS[lootItem.type]?.color ?? "purple");
          else if (
            proximityState === "unlocked" &&
            selectedMessage?.id === firstSelected.id
          )
            stackColor = "green";
          else if (
            proximityState === "near" &&
            selectedMessage?.id === firstSelected.id
          )
            stackColor = "orange";
        }
        result.push({
          id: `stack-${key}`,
          position: pos,
          icon: "stack",
          color: stackColor,
          isSelected: shouldHighlight,
          items: items.map((i) => i.popupItem),
        });
      }
    });
    return result;
  }, [
    mergedMessages,
    mergedChests,
    mergedLootItems,
    proximityState,
    selectedMessage,
    selectedChestId,
    isMessageOpened,
    claimedChestIds,
    unlockDistance,
  ]);

  return (
    <LeafletMap
      config={config}
      markers={markers}
      userPosition={userPosition}
      onStackItemSelect={handleStackItemSelect}
      onFlyComplete={() => setFlyToMarkerPosition(null)}
      onViewportChange={handleViewportChange}
    />
  );
}
