import { AuthModal } from "@/components/AuthModal";
import { GameButton } from "@/components/GameButton";
import { MentionInput } from "@/components/MentionInput";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateChestMutation, useCreateMessageMutation } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useMyTagsStore } from "@/store/useMyTagsStore";
import type { CreatedMessage, MarkerColor, MessageType } from "@/types";
import { motion } from "framer-motion";
import {
  Globe,
  Image as ImageIcon,
  Lock,
  Mic,
  Package,
  StopCircle as Stop,
  Type,
  VideoIcon as Videocam,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface DropMessageModalProps {
  onClose: () => void;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export function DropMessageModal({ onClose }: DropMessageModalProps) {
  const { userLocation } = useAppStore();
  const { addMessage } = useMyTagsStore();
  const { userId } = useAuthStore();
  const { isAuthenticated } = useAuth();
  const createMessage = useCreateMessageMutation();
  const createChest = useCreateChestMutation();

  const [dropType, setDropType] = useState<"message" | "chest">("message");
  const [messageType, setMessageType] = useState<MessageType>("text");
  const [xpReward, setXpReward] = useState(25);
  const [content, setContent] = useState("");
  const [mediaData, setMediaData] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [markerColor, setMarkerColor] = useState<MarkerColor>("purple");
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loading = createMessage.isPending || createChest.isPending;
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const resetForm = useCallback(() => {
    setContent("");
    setMediaData(null);
    setAllowedUserIds([]);
    setMessageType("text");
    setDropType("message");
    setXpReward(25);
    setMarkerColor("purple");
    setRecording(false);
  }, []);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleRecordVoice = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const b64 = await blobToBase64(blob);
        setMediaData(b64);
        setContent("[Voice message]");
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Microphone access denied");
    }
  };

  const handleCaptureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      await new Promise((r) => (video.onloadeddata = r));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop());
      const b64 = canvas.toDataURL("image/jpeg", 0.8);
      setMediaData(b64);
      setContent("[Image]");
    } catch {
      setError("Camera access denied");
    }
  };

  const handleRecordVideo = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "video/webm" });
        const b64 = await blobToBase64(blob);
        setMediaData(b64);
        setContent("[Video message]");
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Camera access denied");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLocation) return;

    // Check authentication before proceeding
    if (!isAuthenticated || !userId) {
      setShowAuthModal(true);
      return;
    }

    if (dropType === "chest") {
      if (!content.trim()) return;
      setError(null);
      createChest.mutate(
        {
          content: content.trim(),
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          altitude: userLocation.altitude,
          xpReward,
          createdBy: userId,
        },
        {
          onSuccess: () => {
            resetForm();
            onClose();
          },
          onError: (err) => {
            setError(
              err instanceof Error ? err.message : "Failed to create chest",
            );
          },
        },
      );
      return;
    }

    const payloadContent =
      messageType === "text" ? content.trim() : (mediaData ?? "");
    if (!payloadContent) return;

    if (
      visibility === "private" &&
      messageType === "text" &&
      allowedUserIds.length === 0
    ) {
      setError(
        "Private messages must tag at least one user. Type @ to add friends.",
      );
      return;
    }

    setError(null);
    createMessage.mutate(
      {
        type: messageType,
        content: payloadContent,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        altitude: userLocation.altitude,
        visibility,
        allowedUserIds: visibility === "private" ? allowedUserIds : undefined,
        category: category.trim() || undefined,
        createdBy: userId,
        markerColor,
      },
      {
        onSuccess: ({ message }) => {
          const title =
            messageType === "text"
              ? content.slice(0, 40) || "[Message]"
              : `[${messageType}]`;
          const created: CreatedMessage = {
            id: message.id,
            type: messageType,
            content: payloadContent,
            mediaUrl:
              messageType !== "text" ? (mediaData ?? undefined) : undefined,
            title,
            location: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              altitude: userLocation.altitude,
            },
            visibility,
            allowedUserIds:
              visibility === "private" ? allowedUserIds : undefined,
            category: category.trim() || undefined,
            createdAt: new Date().toISOString(),
            markerColor,
          };
          addMessage(created);
          resetForm();
          onClose();
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Failed to create message",
          );
        },
      },
    );
  };

  const types = [
    { id: "text", label: "Text", icon: Type },
    { id: "voice", label: "Voice", icon: Mic },
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "video", label: "Video", icon: Videocam },
  ];

  const canSubmit =
    dropType === "chest"
      ? content.trim().length > 0
      : (messageType === "text" &&
          content.trim() &&
          (visibility !== "private" || allowedUserIds.length > 0)) ||
        ((messageType === "voice" ||
          messageType === "image" ||
          messageType === "video") &&
          mediaData);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => {
        stopMedia();
        onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[var(--radius-game)] bg-[var(--color-bg-primary)] border-4 border-[var(--color-border)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-[var(--color-border)]">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {dropType === "chest" ? "🗺️ Hide a Chest" : "✉️ Drop Message"}
          </h2>
          <button
            onClick={() => {
              stopMedia();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] border-2 border-transparent hover:border-[var(--color-border)] transition-all"
          >
            <X className="w-6 h-6 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/20 text-red-500 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">
              Drop Type
            </span>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: "message",
                  label: "Message",
                  icon: Type,
                  activeColor:
                    "bg-[var(--color-game-blue)] shadow-[0_4px_0_var(--color-game-blue-dark)]",
                },
                {
                  id: "chest",
                  label: "Chest",
                  icon: Package,
                  activeColor:
                    "bg-[var(--color-game-gold)] shadow-[0_4px_0_var(--color-game-gold-dark)]",
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDropType(t.id as any)}
                  className={`
                    flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all
                    ${
                      dropType === t.id
                        ? `${t.activeColor} text-white translate-y-[-2px]`
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-2 border-[var(--color-border)] active:translate-y-0.5"
                    }
                  `}
                >
                  <t.icon className="w-5 h-5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {dropType === "chest" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">
                  Chest Message
                </span>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Treasure awaits! Find the secret..."
                  className="w-full p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-[var(--color-game-gold)] transition-all font-bold resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">
                  XP Reward
                </span>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value) || 25)}
                  className="w-full p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-[var(--color-game-gold)] transition-all font-bold"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">
                  Message Type
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        stopMedia();
                        setMediaData(null);
                        setMessageType(t.id as MessageType);
                      }}
                      className={`
                        flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all
                        ${
                          messageType === t.id
                            ? "bg-[var(--color-game-purple)] text-white border-transparent shadow-[0_4px_0_var(--color-game-purple-dark)] translate-y-[-2px]"
                            : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border)] active:translate-y-0.5"
                        }
                      `}
                    >
                      <t.icon className="w-5 h-5" />
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {messageType === "text" && (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">
                      Message
                    </span>
                    <MentionInput
                      value={content}
                      onChange={(v, tagged) => {
                        setContent(v);
                        setAllowedUserIds(tagged);
                      }}
                      placeholder="Best tiramisu in the city — ask for the secret menu! Type @ to tag friends"
                      rows={4}
                      className="w-full p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-[var(--color-game-purple)] transition-all font-bold resize-none"
                    />
                  </>
                )}

                {messageType === "voice" && (
                  <div className="space-y-4">
                    <GameButton
                      color={recording ? "red" : "purple"}
                      className="w-full"
                      onClick={handleRecordVoice}
                    >
                      {recording ? (
                        <>
                          <Stop className="w-5 h-5 mr-2" /> Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 mr-2" /> Record Voice
                        </>
                      )}
                    </GameButton>
                    {mediaData && (
                      <p className="text-center text-xs font-black text-[var(--color-game-green)] uppercase tracking-widest">
                        Voice recorded ✓
                      </p>
                    )}
                  </div>
                )}

                {messageType === "image" && (
                  <div className="space-y-4">
                    {mediaData ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--color-border)] shadow-lg">
                        <img
                          src={mediaData}
                          alt=""
                          className="w-full max-h-48 object-cover"
                        />
                        <button
                          onClick={() => setMediaData(null)}
                          className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white rounded-lg text-[10px] font-bold"
                        >
                          Retake
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleCaptureImage}
                        className="w-full h-32 rounded-2xl border-4 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center text-[var(--color-text-muted)] hover:border-[var(--color-game-purple)] hover:text-[var(--color-game-purple)] transition-all bg-[var(--color-bg-secondary)]"
                      >
                        <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          Capture with camera
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {messageType === "video" && (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      className="hidden"
                      muted
                      playsInline
                    />
                    {mediaData ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--color-border)] shadow-lg">
                        <video src={mediaData} controls className="w-full" />
                        <button
                          onClick={() => setMediaData(null)}
                          className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white rounded-lg text-[10px] font-bold"
                        >
                          Re-record
                        </button>
                      </div>
                    ) : (
                      <GameButton
                        color={recording ? "red" : "purple"}
                        className="w-full h-32 flex-col gap-2 border-4 border-dashed border-white/20"
                        onClick={handleRecordVideo}
                      >
                        {recording ? (
                          <>
                            <Stop className="w-10 h-10" /> Stop Recording
                          </>
                        ) : (
                          <>
                            <Videocam className="w-10 h-10" /> Record with
                            camera
                          </>
                        )}
                      </GameButton>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">
                  Tag Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "purple",
                      "orange",
                      "green",
                      "gold",
                      "teal",
                      "blue",
                      "red",
                      "pink",
                    ] as MarkerColor[]
                  ).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMarkerColor(c)}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${
                        markerColor === c
                          ? "border-[var(--color-text-primary)] scale-110 shadow-lg"
                          : "border-[var(--color-border)] hover:scale-105"
                      }`}
                      style={{
                        backgroundColor:
                          c === "purple"
                            ? "#8b5cf6"
                            : c === "orange"
                              ? "#f97316"
                              : c === "green"
                                ? "#22c55e"
                                : c === "gold"
                                  ? "#f59e0b"
                                  : c === "teal"
                                    ? "#14b8a6"
                                    : c === "blue"
                                      ? "#3b82f6"
                                      : c === "red"
                                        ? "#ef4444"
                                        : "#ec4899",
                      }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">
                    Category
                  </span>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Food"
                    className="w-full p-3 rounded-xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-[var(--color-game-purple)] transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">
                    Visibility
                  </span>
                  <div className="flex bg-[var(--color-bg-secondary)] p-1 rounded-xl border-2 border-[var(--color-border)]">
                    {[
                      { id: "public", icon: Globe },
                      { id: "private", icon: Lock },
                    ].map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVisibility(v.id as any)}
                        className={`
                          flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                          ${visibility === v.id ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]" : "text-[var(--color-text-muted)]"}
                        `}
                      >
                        <v.icon className="w-3.5 h-3.5" />
                        {v.id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex gap-4">
          <GameButton
            color="gray"
            onClick={() => {
              stopMedia();
              onClose();
            }}
            className="flex-1"
          >
            Cancel
          </GameButton>
          <GameButton
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            color={dropType === "chest" ? "gold" : "blue"}
            className="flex-[1.5]"
          >
            {loading
              ? "Dropping..."
              : dropType === "chest"
                ? "Hide Chest!"
                : "Send Tag!"}
          </GameButton>
        </div>
      </motion.div>
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
