import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDown, MapPin, Pencil, X } from "lucide-react";
import { MiniMap } from "@/components/MiniMap";
import { MentionInput } from "@/components/MentionInput";
import { useMyTagsStore } from "@/store/useMyTagsStore";
import { useUpdateMessageMutation } from "@/services";
import type { CreatedMessage } from "@/types";
import { GameButton } from "@/components/GameButton";
import { gameColors } from "@/config/theme";

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

const tagIcon = createTagIcon(gameColors.purple);

function ExpandedMapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 17);
  }, [map, center]);
  return null;
}

function TagCard({
  msg,
  isExpanded,
  onToggle,
  onEdit,
}: {
  msg: CreatedMessage;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const center: [number, number] = [
    msg.location.latitude,
    msg.location.longitude,
  ];

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
          <MiniMap location={msg.location} className="h-full w-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[var(--color-text-primary)] truncate">
            {msg.title}
          </p>
          <p className="text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-widest mt-0.5">
            {msg.category ?? "No category"} •{" "}
            {new Date(msg.createdAt).toLocaleDateString()}
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--color-game-purple)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                      {msg.location.latitude.toFixed(5)},{" "}
                      {msg.location.longitude.toFixed(5)}
                    </span>
                  </div>
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
                </div>
                <p className="text-[var(--color-text-primary)] font-bold leading-relaxed">
                  {msg.content}
                </p>
                {msg.category && (
                  <span className="inline-block px-2 py-1 rounded-lg bg-[var(--color-game-purple)]/10 text-[var(--color-game-purple)] text-[10px] font-black uppercase tracking-widest">
                    {msg.category}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EditMessageModal({
  msg,
  onClose,
  onSaved,
}: {
  msg: CreatedMessage;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState(msg.content);
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>(
    msg.allowedUserIds ?? [],
  );
  const [visibility, setVisibility] = useState<"public" | "private">(
    msg.visibility,
  );
  const [category, setCategory] = useState(msg.category ?? "");
  const [error, setError] = useState<string | null>(null);
  const { updateMessage } = useMyTagsStore();
  const updateMessageMutation = useUpdateMessageMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (visibility === "private" && allowedUserIds.length === 0) {
      setError(
        "Private messages must tag at least one user. Type @ to add friends.",
      );
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
        },
      },
      {
        onSuccess: () => {
          updateMessage(msg.id, {
            content: msg.type === "text" ? content.trim() : msg.content,
            visibility,
            allowedUserIds: visibility === "private" ? allowedUserIds : undefined,
            category: category.trim() || undefined,
          });
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
          <h2 className="text-xl font-black uppercase tracking-tight">
            Edit Message
          </h2>
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
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["public", "private"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`
                    py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border-4
                    ${
                      visibility === v
                        ? "bg-[var(--color-game-purple)] text-white border-transparent shadow-[0_4px_0_var(--color-game-purple-dark)] translate-y-[-2px]"
                        : "bg-zinc-100 dark:bg-zinc-800 text-[var(--color-text-muted)] border-transparent"
                    }
                  `}
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
            <GameButton
              type="button"
              color="gray"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </GameButton>
            <GameButton
              type="submit"
              color="purple"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Saving..." : "Save"}
            </GameButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function MyTagsPage() {
  const { messages } = useMyTagsStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<CreatedMessage | null>(null);

  return (
    <div className="py-4 pb-24">
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-game-purple)]/10 border-4 border-[var(--color-game-purple)]/20 flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-[var(--color-game-purple)]" />
          </div>
          <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-2">
            No tags yet
          </h2>
          <p className="text-[var(--color-text-muted)] font-medium max-w-[280px]">
            Drop a message at your location to see it here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <TagCard
                msg={msg}
                isExpanded={expandedId === msg.id}
                onToggle={() =>
                  setExpandedId((id) => (id === msg.id ? null : msg.id))
                }
                onEdit={() => setEditingMsg(msg)}
              />
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {editingMsg &&
          createPortal(
            <EditMessageModal
              msg={editingMsg}
              onClose={() => setEditingMsg(null)}
              onSaved={() => setEditingMsg(null)}
            />,
            document.body
          )}
      </AnimatePresence>
    </div>
  );
}
