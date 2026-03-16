import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ChevronDown,
  Copy,
  MapPin,
  Pencil,
  Trash2,
  X,
  MessageSquare,
  Package,
  Trophy,
  Gift,
} from "lucide-react";
import { MiniMap } from "@/components/MiniMap";
import { MentionInput } from "@/components/MentionInput";
import { GameButton } from "@/components/GameButton";
import { gameColors, markerColors } from "@/config/theme";
import {
  useMyItemsQuery,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useDeleteChestMutation,
} from "@/services";
import { useUserStore } from "@/store/useUserStore";
import type {
  CreatedMessageItem,
  CreatedChestItem,
  FoundChestItem,
  FoundLootItem,
} from "@/api/types/responses";
import type { MarkerColor } from "@/types";

function createTagIcon(color: string) {
  return L.divIcon({
    className: "tag-pin",
    html: `<div style="
      width: 20px; height: 20px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

function ExpandedMapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 17);
  }, [map, center]);
  return null;
}

function CopyCoordsButton({ lat, lng }: { lat: number; lng: number }) {
  const [copied, setCopied] = useState(false);
  const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-game-purple)] transition-all text-[10px] font-bold"
    >
      <Copy className="w-3 h-3" />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

type CollectionItem =
  | { kind: "created-message"; data: CreatedMessageItem }
  | { kind: "created-chest"; data: CreatedChestItem }
  | { kind: "found-chest"; data: FoundChestItem }
  | { kind: "found-loot"; data: FoundLootItem };

function getItemLabel(item: CollectionItem): string {
  switch (item.kind) {
    case "created-message":
      return "Message";
    case "created-chest":
      return "Chest";
    case "found-chest":
      return "Chest found";
    case "found-loot":
      return `Loot: ${item.data.type}`;
  }
}

function getItemPreview(item: CollectionItem): string {
  switch (item.kind) {
    case "created-message":
      return item.data.content.slice(0, 60) + (item.data.content.length > 60 ? "…" : "");
    case "created-chest":
    case "found-chest":
      return item.data.content.slice(0, 60) + (item.data.content.length > 60 ? "…" : "");
    case "found-loot":
      return item.data.content.slice(0, 60) + (item.data.content.length > 60 ? "…" : "");
  }
}

function getItemLocation(item: CollectionItem): { latitude: number; longitude: number } | null {
  switch (item.kind) {
    case "created-message":
      return { latitude: item.data.latitude, longitude: item.data.longitude };
    case "created-chest":
      return { latitude: item.data.latitude, longitude: item.data.longitude };
    default:
      return null;
  }
}

function ItemDetailModal({
  item,
  onClose,
  onEdit,
  onDelete,
  isCreator,
}: {
  item: CollectionItem;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCreator: boolean;
}) {
  const loc = getItemLocation(item);
  const isFirstFinder =
    (item.kind === "found-chest" || item.kind === "found-loot") && item.data.finderOrdinal === 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[var(--radius-game)] bg-[var(--color-bg-primary)] border-4 border-[var(--color-border)] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-[var(--color-border)]">
          <h2 className="text-xl font-black uppercase tracking-tight">{getItemLabel(item)}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] border-2 border-transparent hover:border-[var(--color-border)] transition-all"
          >
            <X className="w-6 h-6 text-[var(--color-text-muted)]" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {isFirstFinder && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-game-gold)]/20 border-2 border-[var(--color-game-gold)]/40">
              <Trophy className="w-5 h-5 text-[var(--color-game-gold)]" />
              <span className="font-black text-[var(--color-game-gold)] uppercase text-sm">
                First finder!
              </span>
            </div>
          )}
          <div>
            <p className="text-[var(--color-text-primary)] font-bold leading-relaxed whitespace-pre-wrap">
              {item.kind === "created-message"
                ? item.data.content
                : item.kind === "created-chest"
                  ? item.data.content
                  : item.data.content}
            </p>
          </div>
          {(item.kind === "found-chest" || item.kind === "found-loot") && (
            <p className="text-[var(--color-text-muted)] text-sm font-bold">
              Found {new Date(item.data.foundAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              {item.data.finderOrdinal > 1 && (
                <span className="ml-1">(#{item.data.finderOrdinal} to find)</span>
              )}
            </p>
          )}
          {(item.kind === "created-message" || item.kind === "created-chest") && (
            <p className="text-[var(--color-text-muted)] text-sm font-bold">
              Created {new Date(item.data.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
          {loc && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-game-purple)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                  {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                </span>
              </div>
              <CopyCoordsButton lat={loc.latitude} lng={loc.longitude} />
            </div>
          )}
          {(item.kind === "found-chest" || item.kind === "found-loot") && (
            <p className="text-[var(--color-text-muted)] text-xs">
              +{item.data.xpReward} XP
              {"coinReward" in item.data && item.data.coinReward
                ? `, +${item.data.coinReward} coins`
                : ""}
            </p>
          )}
          {isCreator && (item.kind === "created-message" || item.kind === "created-chest") && (
            <div className="flex gap-3 pt-2">
              {onEdit && item.kind === "created-message" && (
                <GameButton type="button" color="purple" onClick={onEdit} className="flex-1">
                  Edit
                </GameButton>
              )}
              {onDelete && (
                <GameButton type="button" color="red" onClick={onDelete} className="flex-1">
                  Delete
                </GameButton>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function EditMessageModal({
  msg,
  onClose,
  onSaved,
}: {
  msg: CreatedMessageItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState(msg.content);
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>(msg.allowedUserIds ?? []);
  const [visibility, setVisibility] = useState<"public" | "private">(msg.visibility);
  const [category, setCategory] = useState(msg.category ?? "");
  const [markerColor, setMarkerColor] = useState<MarkerColor>(
    (msg.markerColor as MarkerColor) ?? "purple"
  );
  const [error, setError] = useState<string | null>(null);
  const updateMessageMutation = useUpdateMessageMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (visibility === "private" && allowedUserIds.length === 0) {
      setError("Private messages must tag at least one user. Type @ to add friends.");
      return;
    }
    setError(null);
    updateMessageMutation.mutate(
      {
        id: msg.id,
        data: {
          content: msg.type === "text" ? content.trim() : undefined,
          visibility,
          allowedUserIds: visibility === "private" ? allowedUserIds : undefined,
          category: category.trim() || undefined,
          markerColor,
        },
      },
      {
        onSuccess: () => {
          onSaved();
          onClose();
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to update message");
        },
      }
    );
  };

  const loading = updateMessageMutation.isPending;
  const colors: MarkerColor[] = ["purple", "orange", "green", "gold", "teal", "blue", "red", "pink"];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[var(--radius-game)] bg-[var(--color-bg-primary)] border-4 border-[var(--color-border)] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-[var(--color-border)]">
          <h2 className="text-xl font-black uppercase tracking-tight">Edit Message</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] border-2 border-transparent hover:border-[var(--color-border)] transition-all"
          >
            <X className="w-6 h-6 text-[var(--color-text-muted)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/20 text-red-500 text-sm font-bold">
              {error}
            </div>
          )}

          {msg.type === "text" && (
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                Message
              </label>
              <MentionInput
                value={content}
                onChange={(v, tagged) => {
                  setContent(v);
                  setAllowedUserIds(tagged);
                }}
                placeholder="Type @ to tag friends"
                className="w-full p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-[var(--color-game-purple)] transition-all resize-none font-bold"
                rows={4}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
              Marker color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setMarkerColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    markerColor === c
                      ? "border-white ring-2 ring-[var(--color-game-purple)]"
                      : "border-[var(--color-border)]"
                  }`}
                  style={{ backgroundColor: markerColors[c as keyof typeof markerColors] ?? c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["public", "private"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border-4 ${
                    visibility === v
                      ? "bg-[var(--color-game-purple)] text-white border-transparent shadow-[0_4px_0_var(--color-game-purple-dark)] translate-y-[-2px]"
                      : "bg-zinc-100 dark:bg-zinc-800 text-[var(--color-text-muted)] border-transparent"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food, Photo Spot"
              className="w-full p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-[var(--color-game-purple)] transition-all font-bold"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <GameButton type="button" color="gray" onClick={onClose} className="flex-1">
              Cancel
            </GameButton>
            <GameButton type="submit" color="purple" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save"}
            </GameButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function CollectionCard({
  item,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onDetail,
}: {
  item: CollectionItem;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDetail: () => void;
}) {
  const loc = getItemLocation(item);
  const isCreator = item.kind === "created-message" || item.kind === "created-chest";
  const center: [number, number] | null = loc
    ? [loc.latitude, loc.longitude]
    : null;

  const Icon =
    item.kind === "created-message"
      ? MessageSquare
      : item.kind === "created-chest"
        ? Package
        : item.kind === "found-chest"
          ? Gift
          : Trophy;

  const color =
    item.kind === "created-message" && "markerColor" in item.data && item.data.markerColor
      ? markerColors[item.data.markerColor as keyof typeof markerColors] ?? gameColors.purple
      : item.kind === "created-chest"
        ? gameColors.gold
        : item.kind === "found-chest"
          ? gameColors.gold
          : gameColors.purple;

  const tagIcon = createTagIcon(color);

  return (
    <motion.div
      layout
      initial={false}
      animate={{ height: "auto" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className={`rounded-2xl border-4 transition-all duration-200 overflow-hidden ${
        isExpanded
          ? "border-[var(--color-game-purple)] shadow-[0_8px_0_var(--color-game-purple-dark)] mb-4"
          : "border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-[0_4px_0_var(--color-border)]"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left transition-colors duration-200"
      >
        <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          {center ? (
            <MiniMap location={{ latitude: center[0], longitude: center[1] }} className="h-full w-full" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-[var(--color-bg-secondary)]">
              <Icon className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[var(--color-text-primary)] truncate">
            {getItemLabel(item)}
          </p>
          <p className="text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-widest mt-0.5 truncate">
            {getItemPreview(item)}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            className={`w-6 h-6 ${isExpanded ? "text-[var(--color-game-purple)]" : "text-[var(--color-text-muted)]"}`}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-[var(--color-border)] p-4 space-y-4">
              {center && (
                <div className="h-40 rounded-2xl overflow-hidden border-2 border-[var(--color-border)]">
                  <MapContainer
                    center={center}
                    zoom={17}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution=""
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ExpandedMapUpdater center={center} />
                    <Marker position={center} icon={tagIcon} />
                  </MapContainer>
                </div>
              )}
              <div className="space-y-3">
                {loc && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-game-purple)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                        {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyCoordsButton lat={loc.latitude} lng={loc.longitude} />
                      {isCreator && onEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                          }}
                          className="p-2 rounded-xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] hover:border-[var(--color-game-purple)] group transition-all"
                        >
                          <Pencil className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-game-purple)]" />
                        </button>
                      )}
                      {isCreator && onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                          }}
                          className="p-2 rounded-xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] hover:border-[var(--color-game-red)] group transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-game-red)]" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetail();
                  }}
                  className="w-full py-2 rounded-xl bg-[var(--color-game-purple)]/10 border-2 border-[var(--color-game-purple)]/30 text-[var(--color-game-purple)] font-black uppercase text-sm hover:bg-[var(--color-game-purple)]/20 transition-all"
                >
                  View details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MyCollectionPage() {
  const { userId } = useUserStore();
  const { data, isLoading } = useMyItemsQuery(userId ?? undefined);
  const deleteMessageMutation = useDeleteMessageMutation();
  const deleteChestMutation = useDeleteChestMutation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<CollectionItem | null>(null);
  const [editingMsg, setEditingMsg] = useState<CreatedMessageItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    item: CollectionItem;
    resolve: () => void;
  } | null>(null);

  const items: CollectionItem[] = [];
  if (data) {
    data.createdMessages.forEach((m) =>
      items.push({ kind: "created-message", data: m })
    );
    data.createdChests.forEach((c) => items.push({ kind: "created-chest", data: c }));
    data.foundChests.forEach((f) => items.push({ kind: "found-chest", data: f }));
    data.foundLoot.forEach((f) => items.push({ kind: "found-loot", data: f }));
  }

  const getItemId = (item: CollectionItem) =>
    item.kind === "created-message" || item.kind === "created-chest"
      ? item.data.id
      : `${item.kind}-${item.data.itemId}`;

  const handleDelete = (item: CollectionItem) => {
    return new Promise<void>((resolve) => {
      setDeleteConfirm({ item, resolve });
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirm || !userId) return;
    const { item, resolve } = deleteConfirm;
    if (item.kind === "created-message") {
      deleteMessageMutation.mutate(
        { id: item.data.id, userId },
        { onSettled: () => { setDeleteConfirm(null); resolve(); } }
      );
    } else if (item.kind === "created-chest") {
      deleteChestMutation.mutate(
        { id: item.data.id, userId },
        { onSettled: () => { setDeleteConfirm(null); resolve(); } }
      );
    }
    setDetailItem(null);
    setExpandedId(null);
  };

  if (isLoading) {
    return (
      <div className="py-4 pb-24 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--color-text-muted)] font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="py-4 pb-24">
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-game-purple)]/10 border-4 border-[var(--color-game-purple)]/20 flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-[var(--color-game-purple)]" />
          </div>
          <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-2">
            No items yet
          </h2>
          <p className="text-[var(--color-text-muted)] font-medium max-w-[280px]">
            Drop a message or chest, or find one on the map to see it here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={getItemId(item)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <CollectionCard
                item={item}
                isExpanded={expandedId === getItemId(item)}
                onToggle={() =>
                  setExpandedId((id) => (id === getItemId(item) ? null : getItemId(item)))
                }
                onEdit={
                  item.kind === "created-message"
                    ? () => setEditingMsg(item.data)
                    : undefined
                }
                onDelete={
                  item.kind === "created-message" || item.kind === "created-chest"
                    ? () => handleDelete(item)
                    : undefined
                }
                onDetail={() => setDetailItem(item)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {detailItem && (
          <ItemDetailModal
            item={detailItem}
            onClose={() => setDetailItem(null)}
            onEdit={
              detailItem.kind === "created-message"
                ? () => {
                    setDetailItem(null);
                    setEditingMsg(detailItem.data);
                  }
                : undefined
            }
            onDelete={
              (detailItem.kind === "created-message" || detailItem.kind === "created-chest")
                ? () => handleDelete(detailItem)
                : undefined
            }
            isCreator={
              detailItem.kind === "created-message" || detailItem.kind === "created-chest"
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingMsg && (
          <EditMessageModal
            msg={editingMsg}
            onClose={() => setEditingMsg(null)}
            onSaved={() => setEditingMsg(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              deleteConfirm.resolve();
              setDeleteConfirm(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[var(--color-bg-primary)] border-4 border-[var(--color-border)] p-6 shadow-2xl"
            >
              <h3 className="text-lg font-black uppercase mb-2">Delete?</h3>
              {deleteConfirm.item.kind === "created-chest" && (
                <p className="text-[var(--color-game-red)] text-sm font-bold mb-4">
                  You will not get your XP back.
                </p>
              )}
              <p className="text-[var(--color-text-muted)] text-sm mb-6">
                This cannot be undone.
              </p>
              <div className="flex gap-3">
                <GameButton
                  type="button"
                  color="gray"
                  onClick={() => {
                    deleteConfirm.resolve();
                    setDeleteConfirm(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </GameButton>
                <GameButton
                  type="button"
                  color="red"
                  onClick={confirmDelete}
                  className="flex-1"
                >
                  Delete
                </GameButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
