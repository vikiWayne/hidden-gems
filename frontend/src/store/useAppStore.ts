import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Location, NearbyMessage } from '@/types'
import type { NearbyChest, NearbyLootItem } from '@/api/client'

export type SelectedStackItem =
  | { type: 'message'; data: NearbyMessage }
  | { type: 'chest'; data: NearbyChest }
  | { type: 'loot'; data: NearbyLootItem }
  | null

interface AppState {
  userLocation: Location | null
  nearbyMessages: NearbyMessage[]
  selectedMessage: NearbyMessage | null
  selectedChestId: string | null
  selectedStackItem: SelectedStackItem | null
  proximityState: 'far' | 'near' | 'unlocked'
  isLocationLoading: boolean
  locationError: string | null
  openedMessageIds: string[]
  claimedMessageIds: string[]
  flyToMarkerPosition: { lat: number; lng: number } | null
  claimAnimation: { xp: number; coins: number; fromRect: DOMRect; chestId?: string } | null
  setUserLocation: (loc: Location | null) => void
  setNearbyMessages: (msgs: NearbyMessage[]) => void
  setSelectedMessage: (msg: NearbyMessage | null) => void
  setSelectedChestId: (id: string | null) => void
  setSelectedStackItem: (item: SelectedStackItem) => void
  setProximityState: (state: 'far' | 'near' | 'unlocked') => void
  setLocationLoading: (loading: boolean) => void
  setLocationError: (err: string | null) => void
  setFlyToMarkerPosition: (pos: { lat: number; lng: number } | null) => void
  triggerClaimAnimation: (xp: number, coins: number, fromRect: DOMRect, chestId?: string) => void
  clearClaimAnimation: () => void
  markMessageOpened: (id: string) => void
  isMessageOpened: (id: string) => boolean
  markMessageClaimed: (id: string) => void
  isMessageClaimed: (id: string) => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userLocation: null,
      nearbyMessages: [],
      selectedMessage: null,
      selectedChestId: null,
      selectedStackItem: null,
      proximityState: 'far',
      isLocationLoading: false,
      locationError: null,
      openedMessageIds: [],
      claimedMessageIds: [],
      flyToMarkerPosition: null,
      claimAnimation: null,
      setUserLocation: (loc) => set({ userLocation: loc }),
      setNearbyMessages: (msgs) => set({ nearbyMessages: msgs }),
      setSelectedMessage: (msg) => set({ selectedMessage: msg, selectedChestId: null }),
      setSelectedChestId: (id) => set({ selectedChestId: id, selectedMessage: null }),
      setSelectedStackItem: (item) => set({ selectedStackItem: item }),
      setProximityState: (state) => set({ proximityState: state }),
      setLocationLoading: (loading) => set({ isLocationLoading: loading }),
      setLocationError: (err) => set({ locationError: err }),
      setFlyToMarkerPosition: (pos) => set({ flyToMarkerPosition: pos }),
      triggerClaimAnimation: (xp, coins, fromRect, chestId) =>
        set({ claimAnimation: { xp, coins, fromRect, chestId } }),
      clearClaimAnimation: () => set({ claimAnimation: null }),
      markMessageOpened: (id) =>
        set((s) => ({
          openedMessageIds: s.openedMessageIds.includes(id) ? s.openedMessageIds : [...s.openedMessageIds, id],
        })),
      isMessageOpened: (id) => get().openedMessageIds.includes(id),
      markMessageClaimed: (id) =>
        set((s) => ({
          claimedMessageIds: s.claimedMessageIds.includes(id) ? s.claimedMessageIds : [...s.claimedMessageIds, id],
        })),
      isMessageClaimed: (id) => get().claimedMessageIds.includes(id),
    }),
    { name: 'taptag-opened', partialize: (s) => ({ openedMessageIds: s.openedMessageIds, claimedMessageIds: s.claimedMessageIds }) }
  )
)

