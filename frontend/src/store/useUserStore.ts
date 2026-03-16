import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Friend {
  id: string;
  username: string;
}

function generateId() {
  return "user-" + Math.random().toString(36).slice(2, 11);
}

interface UserState {
  userId: string;
  username: string;
  friends: Friend[];
  xp: number;
  coins: number;
  setUsername: (name: string) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  getFriendsForMention: (query: string) => Friend[];
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: generateId(),
      username: "Explorer",
      friends: [
        { id: "user-1", username: "Alex" },
        { id: "user-2", username: "Riya" },
        { id: "user-3", username: "Jordan" },
      ],
      xp: 0,
      coins: 0,
      setUsername: (username) => set({ username }),
      addFriend: (friend) =>
        set((s) => ({
          friends: s.friends.some((f) => f.id === friend.id)
            ? s.friends
            : [...s.friends, friend],
        })),
      removeFriend: (id) =>
        set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),
      getFriendsForMention: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return get().friends.slice(0, 5);
        return get()
          .friends.filter((f) => f.username.toLowerCase().includes(q))
          .slice(0, 5);
      },
      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),
      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
    }),
    { name: "taptag-user" },
  ),
);
