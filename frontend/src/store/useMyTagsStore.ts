import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CreatedMessage } from '@/types'

interface MyTagsState {
  messages: CreatedMessage[]
  addMessage: (msg: CreatedMessage) => void
  updateMessage: (id: string, updates: Partial<CreatedMessage>) => void
  removeMessage: (id: string) => void
}

function getTitle(content: string, maxLen = 40): string {
  const firstLine = content.split('\n')[0]?.trim() ?? content
  return firstLine.length > maxLen ? `${firstLine.slice(0, maxLen)}...` : firstLine
}

export const useMyTagsStore = create<MyTagsState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) =>
        set((s) => ({
          messages: [
            {
              ...msg,
              title: msg.title ?? (msg.type && msg.type !== 'text' ? `[${msg.type}]` : getTitle(msg.content)),
            },
            ...s.messages,
          ],
        })),
      updateMessage: (id, updates) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, ...updates, title: updates.content ? getTitle(updates.content) : m.title } : m
          ),
        })),
      removeMessage: (id) =>
        set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
    }),
    { name: 'taptag-my-tags' }
  )
)
