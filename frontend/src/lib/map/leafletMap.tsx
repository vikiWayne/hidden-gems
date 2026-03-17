/**
 * Leaflet implementation with game-style icons.
 * Swap this file to change map provider.
 */
import { useMemo, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { MapMarkerPopupItem, MapMarkerItemType } from "./types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapLocation, MapMarkerConfig, MapConfig } from "./types";
import { getThemeColors } from "@/config/theme";

const MAP_ZOOM = { MAX: 18, MIN: 5 };

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function getMarkerColors(config: MapConfig): Record<string, string> {
  return (
    config.themeColors?.marker ?? {
      ...Object.fromEntries(Object.entries(getThemeColors("light").marker)),
    }
  );
}

function createGameIcon(
  iconType: string,
  color: string,
  pulse: boolean = false,
) {
  const size = 36;
  const border = 3;
  const icons: Record<string, string> = {
    // Locked - padlock for private messages
    locked:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    // Envelope closed
    "envelope-unopened":
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    // Envelope open
    "envelope-opened":
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z"/><path d="M22 8 12 12 2 8"/></svg>',
    // Chest - treasure box
    chest:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9h18v12H3z"/><path d="M3 9l2.5-5h13L21 9"/><path d="M12 9v12"/></svg>',
    bomb: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9h18v12H3z"/><path d="M3 9l2.5-5h13L21 9"/><path d="M12 9v12"/></svg>',
    snake:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9h18v12H3z"/><path d="M3 9l2.5-5h13L21 9"/><path d="M12 9v12"/></svg>',
    // Chest opened
    "chest-opened":
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9h18v12H3z"/><path d="M3 9l2.5-5h13L21 9"/><path d="M12 9v12"/><path d="M8 12h8" stroke="gold"/></svg>',
    // Stack - multiple items at same location
    stack:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M2 14h20"/></svg>',
    // Loot item icons
    avatar:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>',
    diamond:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 8l10 14 10-14L12 2z"/><path d="M2 8h20"/><path d="M12 2v20"/></svg>',
    cash_chest:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M2 14h20"/><path d="M8 12h8"/></svg>',
    loot_box:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="1"/><path d="M12 8v12"/><path d="M3 12h18"/></svg>',
    surprise:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/></svg>',
    powerup:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    // bomb:
    //   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="10" r="6"/><path d="M8 4h8"/><path d="M12 16v4"/><path d="M10 20h4"/></svg>',
    // snake:
    //   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 4c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4z"/><path d="M12 12v8"/><path d="M8 16c-2 2 0 4 2 4h4c2 0 4-2 2-4"/></svg>',
  };
  const svg = icons[iconType] ?? icons["envelope-unopened"];
  return L.divIcon({
    className: "game-marker",
    html: `<div class="game-marker-inner ${pulse ? "pulse-active" : ""}" style="
      --pulse-color: ${color};
      width:${size}px;height:${size}px;
      background:${color};
      border:${border}px solid #fff;
      border-radius:8px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
      image-rendering: pixelated;
    ">${svg}</div>`,
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, size + 8],
  });
}

function createUserIcon(
  chestHunter: boolean,
  themeColors: { gold: string; blue: string },
) {
  const bg = chestHunter ? themeColors.gold : themeColors.blue;
  return L.divIcon({
    className: "user-marker",
    html: `<div style="
      width:20px;height:20px;
      background:${bg};
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 4px 12px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

const iconCache: Record<string, L.DivIcon> = {};
function getIcon(
  iconType: string,
  color: string,
  chestHunter: boolean,
  themeColors: { gold: string; blue: string },
  pulse: boolean = false,
  stackCount?: number,
) {
  if (iconType === "user") return createUserIcon(chestHunter, themeColors);
  if (iconType === "stack" && stackCount != null) {
    const key = `stack-${color}-${stackCount}-${pulse}`;
    if (!iconCache[key])
      iconCache[key] = createStackIcon(color, stackCount, pulse, themeColors);
    return iconCache[key];
  }
  const key = `${iconType}-${color}-${pulse}`;
  if (!iconCache[key]) iconCache[key] = createGameIcon(iconType, color, pulse);
  return iconCache[key];
}

function createStackIcon(
  color: string,
  count: number,
  pulse: boolean = false,
  themeColors: { gold: string; blue: string },
) {
  const size = 40;
  const border = 3;
  const badgeSize = 18;
  const badgeBg = themeColors.gold;
  return L.divIcon({
    className: "game-marker stack-marker",
    html: `<div class="game-marker-inner ${pulse ? "pulse-active" : ""}" style="
      --pulse-color: ${color};
      width:${size}px;height:${size}px;
      background:${color};
      border:${border}px solid #fff;
      border-radius:10px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
      position:relative;
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M2 14h20"/></svg>
      <div style="
        position:absolute;top:-6px;right:-6px;
        min-width:${badgeSize}px;height:${badgeSize}px;
        background:${badgeBg};color:#000;
        border-radius:50%;border:2px solid #fff;
        display:flex;align-items:center;justify-content:center;
        font-size:11px;font-weight:bold;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      ">${count}</div>
    </div>`,
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, size + 8],
  });
}

function MapUpdater({
  center,
  flyToPosition,
}: {
  center: MapLocation;
  flyToPosition: { lat: number; lng: number } | null | undefined;
}) {
  const map = useMap();
  const lastCenterRef = useRef(center);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    // Don't override view when user clicked a card and we're flying to a marker
    if (flyToPosition) return;

    const latDiff = Math.abs(center.lat - lastCenterRef.current.lat);
    const lngDiff = Math.abs(center.lng - lastCenterRef.current.lng);

    // Snap only if it's the first load or user moved > 50m (approx 0.0005 deg)
    if (isFirstLoadRef.current || latDiff > 0.0005 || lngDiff > 0.0005) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
      lastCenterRef.current = center;
      isFirstLoadRef.current = false;
    }
  }, [center, map, flyToPosition]);

  return null;
}

function MapFlyTo({
  position,
  onComplete,
}: {
  position: { lat: number; lng: number } | null;
  onComplete: () => void;
}) {
  const map = useMap();
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!position) return;
    if (
      lastPosRef.current &&
      lastPosRef.current.lat === position.lat &&
      lastPosRef.current.lng === position.lng
    ) {
      return;
    }
    lastPosRef.current = position;
    const durationMs = 800;
    // Zoom in slightly (18) when flying to a marker so the location is clearly visible
    const targetZoom = Math.max(map.getZoom(), MAP_ZOOM.MAX);
    map.flyTo([position.lat, position.lng], targetZoom, {
      duration: 1, // in seconds
      animate: true,
    });

    const t = setTimeout(onComplete, durationMs);
    return () => clearTimeout(t);
  }, [position, map, onComplete]);

  return null;
}

function MapResizeOnFullscreen() {
  const map = useMap();

  useEffect(() => {
    const onFullscreenChange = () => {
      setTimeout(() => map.invalidateSize(), 100);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [map]);

  return null;
}

function MapViewportReporter({
  onViewportChange,
}: {
  onViewportChange?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
}) {
  const map = useMap();

  const reportBounds = useCallback(() => {
    if (!onViewportChange) return;
    const b = map.getBounds();
    onViewportChange({
      minLat: b.getSouth(),
      maxLat: b.getNorth(),
      minLng: b.getWest(),
      maxLng: b.getEast(),
    });
  }, [map, onViewportChange]);

  useMapEvents({
    moveend: reportBounds,
  });

  useEffect(() => {
    reportBounds();
  }, [reportBounds]);

  return null;
}

function LocateMeButton({
  userPosition,
}: {
  userPosition: MapLocation | null;
}) {
  const map = useMap();

  if (!userPosition) return null;

  const handleClick = () => {
    map.flyTo([userPosition.lat, userPosition.lng], MAP_ZOOM.MAX, {
      duration: 1,
      animate: true,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute top-2 right-2 z-[1000] p-2.5 rounded-xl bg-[var(--color-bg-primary)] border-2 border-[var(--color-border)] shadow-lg hover:border-[var(--color-game-blue)] hover:bg-[var(--color-bg-secondary)] transition-all active:scale-95"
      title="Locate me"
      aria-label="Locate me"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--color-game-blue)]"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    </button>
  );
}

interface LeafletMapProps {
  config: MapConfig;
  markers: MapMarkerConfig[];
  userPosition: MapLocation | null;
  onStackItemSelect?: (id: string, type: MapMarkerItemType) => void;
  onFlyComplete?: () => void;
  onViewportChange?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
  className?: string;
}

function StackPopupContent({
  items,
  onSelect,
}: {
  items: MapMarkerPopupItem[];
  onSelect: (id: string, type: MapMarkerItemType) => void;
}) {
  const map = useMap();

  const handleClick = (id: string, type: MapMarkerItemType) => {
    onSelect(id, type);
    map.closePopup();
  };

  return (
    <div className="space-y-2 min-w-[180px]">
      <div className="font-semibold text-sm border-b border-white/20 pb-1">
        {items.length} item{items.length > 1 ? "s" : ""} here
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleClick(item.id, item.type)}
          className="w-full text-left text-sm py-1.5 px-2 rounded bg-black/30 border border-white/10 hover:bg-black/50 hover:border-amber-500/40 transition-colors cursor-pointer"
        >
          <div className="font-semibold text-amber-400/95">
            {item.itemName ?? item.type}
            {item.distance != null && (
              <span className="ml-1.5 text-white/80 font-normal">
                — {Math.round(item.distance)}m away
              </span>
            )}
          </div>
          <div className="font-medium truncate text-white/90 mt-0.5">
            {item.title}
          </div>
        </button>
      ))}
    </div>
  );
}

export function LeafletMap({
  config,
  markers,
  userPosition,
  onStackItemSelect,
  onFlyComplete,
  onViewportChange,
  className = "",
}: LeafletMapProps) {
  const center = useMemo<[number, number]>(
    () => [config.center.lat, config.center.lng],
    [config.center.lat, config.center.lng],
  );
  const chestHunter = config.chestHunterMode ?? false;
  const themeColors = config.themeColors ?? {
    game: getThemeColors("light").game,
    marker: getThemeColors("light").marker as Record<string, string>,
  };
  const markerColors = getMarkerColors(config);

  // Gaming map theme: Stadia Alidade Smooth Dark (atmospheric, game-like)
  const tileUrl = chestHunter
    ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
    : config.darkMode
      ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      : "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";
  return (
    <div
      className={`h-full w-full rounded-xl overflow-hidden border-2 border-[var(--color-border)] relative ${className}`}
    >
      <MapContainer
        center={center}
        zoom={config.zoom}
        className="h-full w-full"
        zoomControl={false}
        dragging
        scrollWheelZoom
        minZoom={MAP_ZOOM.MIN}
        maxZoom={MAP_ZOOM.MAX}
        preferCanvas
      >
        <TileLayer
          attribution={
            config.darkMode ? "&copy; CARTO" : "&copy; OpenStreetMap"
          }
          url={tileUrl}
        />
        <MapUpdater
          center={config.center}
          flyToPosition={config.flyToPosition}
        />
        {config.flyToPosition && onFlyComplete && (
          <MapFlyTo
            position={config.flyToPosition}
            onComplete={onFlyComplete}
          />
        )}
        <MapResizeOnFullscreen />
        <MapViewportReporter onViewportChange={onViewportChange} />
        <LocateMeButton userPosition={userPosition} />
        {userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
            icon={createUserIcon(chestHunter, themeColors.game)}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}
        {markers.map((m) => {
          const isUser = m.icon === "user";
          const showPulse = !isUser && m.isSelected === true;
          const colorKey = m.color ?? "purple";
          const colorHex =
            markerColors[colorKey] ?? markerColors.purple ?? "#ce82ff";
          const icon = getIcon(
            m.icon,
            colorHex,
            chestHunter,
            themeColors.game,
            showPulse,
            m.items?.length,
          );

          return (
            <Marker
              key={m.id}
              position={[m.position.lat, m.position.lng]}
              icon={icon}
            >
              {m.items && m.items.length > 0 ? (
                <Popup className="map-stack-popup">
                  <StackPopupContent
                    items={m.items}
                    onSelect={onStackItemSelect ?? (() => {})}
                  />
                </Popup>
              ) : m.popup ? (
                <Popup>
                  <div className="min-w-[160px]">
                    <div className="font-semibold text-amber-400/95">
                      {m.popup.itemName ?? "Item"}
                      {m.popup.distance != null && (
                        <span className="text-white/80 font-normal ml-1">
                          — {Math.round(m.popup.distance)}m away
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-white/90">
                      {m.popup.title}
                    </div>
                  </div>
                </Popup>
              ) : null}
            </Marker>
          );
        })}
      </MapContainer>
      <div className="absolute z-[999] bottom-2 left-2 text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-black/60 border border-amber-500/30 text-amber-400/90">
        {chestHunter ? "🗺️ CHEST HUNTER MODE" : "🗺️ LIVE MAP"}
      </div>
    </div>
  );
}
