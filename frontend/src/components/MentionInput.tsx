import React, {
  useDeferredValue,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useSearchUsers } from "@/services";

interface MentionInputProps {
  value: string;
  onChange: (value: string, taggedUserIds: string[]) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: MentionInputProps) {
  const { friends } = useUserStore();
  const inputId = useId();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deferredMentionQuery = useDeferredValue(mentionQuery);

  const { data: searchedUsers } = useSearchUsers(
    deferredMentionQuery,
    showSuggestions && deferredMentionQuery.length > 0,
  );

  const suggestions = useMemo(() => {
    if (!showSuggestions) return [];
    if (!deferredMentionQuery) return friends.slice(0, 8);
    const users = searchedUsers?.users ?? [];
    return users.slice(0, 8);
  }, [showSuggestions, deferredMentionQuery, friends, searchedUsers]);

  // Parse tagged user IDs from text: @username[id]
  const getTaggedUserIds = (text: string) => {
    const matches = text.match(/@\w+\[([a-zA-Z0-9_-]+)\]/g) || [];
    return matches.map((m) => m.match(/\[(.*?)\]/)![1]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const cursor = e.target.selectionStart;
    setCursorPos(cursor);

    onChange(newVal, getTaggedUserIds(newVal));

    // Check if we are typing a mention
    const lastAt = newVal.lastIndexOf("@", cursor - 1);
    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(newVal[lastAt - 1]))) {
      const query = newVal.slice(lastAt + 1, cursor);
      if (!/\s/.test(query)) {
        setMentionQuery(query.trim());
        setShowSuggestions(true);
        setSelectedIndex(0);
        return;
      }
    }
    setMentionQuery("");
    setShowSuggestions(false);
  };

  const insertMention = (friend: (typeof friends)[0]) => {
    const lastAt = value.lastIndexOf("@", cursorPos - 1);
    const before = value.slice(0, lastAt);
    const after = value.slice(cursorPos);
    const mention = `@${friend.username}[${friend.id}] `;
    const newVal = before + mention + after;

    onChange(newVal, getTaggedUserIds(newVal));
    setShowSuggestions(false);
    setMentionQuery("");

    // Focus back and set cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = lastAt + mention.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (suggestions[selectedIndex]) {
        insertMention(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setMentionQuery("");
    }
  };

  return (
    <div className="relative">
      <textarea
        id={inputId}
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-4 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-[var(--color-game-purple)] transition-all font-bold resize-none ${className}`}
      />

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 w-64 bg-[var(--color-bg-primary)] border-2 border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                Tagged Friends
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {suggestions.map((friend, i) => (
                <button
                  key={friend.id}
                  onClick={() => insertMention(friend)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${i === selectedIndex
                      ? "bg-[var(--color-game-purple)] text-white"
                      : "hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === selectedIndex ? "bg-white/20" : "bg-[var(--color-game-purple)]/10 text-[var(--color-game-purple)]"}`}
                  >
                    {friend.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm">@{friend.username}</div>
                    <div
                      className={`text-[10px] ${i === selectedIndex ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                    >
                      ID: {friend.id.slice(0, 8)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
