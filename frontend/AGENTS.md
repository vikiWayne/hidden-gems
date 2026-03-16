# Postbox (TapTag) — Agent Documentation

This document provides structured documentation for AI agents working on the Postbox project. Use it to understand architecture, data flow, and conventions before making changes.

---

## 1. Project Overview

**Postbox** (also branded as **TapTag**) is a location-based messaging app where users:

1. **Drop** messages or treasure chests at their current GPS location
2. **Explore** nearby geo-tagged content on a map (within 2 km)
3. **Unlock** messages by walking within 20 meters
4. **Manage** their own tags in My Tags
5. **Compete** via a leaderboard (mock data)

### Core Concepts

| Term | Meaning |
|------|---------|
| **Message** | Geo-tagged content (text, voice, image, video). Can be public or private. |
| **Chest** | Geo-tagged treasure with XP reward. Unlocks at 20 m. |
| **Tag** | User-created message; shown in "My Tags" |
| **Proximity** | Distance-based states: `far` (>80 m), `near` (20–80 m), `unlocked` (≤20 m) |
| **Chest Hunter** | Mode when a chest is within 200 m; gold-themed UI |
| **Stack** | Multiple messages/chests at the same location; shown as one marker with expandable list |

---

## 2. Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 4, Framer Motion, Zustand, React-Leaflet, Lucide React |
| **Backend** | Node.js, Express 5, TypeScript |
| **Map** | Leaflet, Stadia Maps (Alidade Smooth Dark for gaming theme) |
| **Build** | `tsc` (backend), Vite (frontend) |

### Path Aliases

- `@/` → `frontend/src/` (e.g. `@/components/Header`, `@/store/useAppStore`)

---

## 3. Directory Structure

```
postbox/
├── package.json              # Root: npm run dev, build
├── AGENTS.md                 # This file
├── README.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts        # Proxy /api → localhost:3001
│   ├── index.html
│   ├── src/
│   │   ├── App.tsx           # Root: tabs, modals, FAB
│   │   ├── main.tsx
│   │   ├── index.css         # Themes, Tailwind, map popup styles
│   │   │
│   │   ├── api/
│   │   │   └── client.ts     # API client (fetch), types: NearbyChest, LeaderboardEntry
│   │   │
│   │   ├── components/
│   │   │   ├── Header.tsx        # Title, TabNav, settings button
│   │   │   ├── DropMessageModal  # Create message/chest
│   │   │   ├── MapView.tsx       # Builds markers, groups by location
│   │   │   ├── ProximityCard.tsx # Distance, progress, nearby list
│   │   │   ├── TagUnlockedCard.tsx # Unlocked message content
│   │   │   ├── StackItemDetailModal.tsx # Detail for item from stack popup
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── MentionInput.tsx  # @mention with friends suggestions
│   │   │   ├── MiniMap.tsx       # Small static map
│   │   │   └── GameButton.tsx    # Styled FAB
│   │   │
│   │   ├── hooks/
│   │   │   ├── useLocation.ts         # Geolocation, userLocation
│   │   │   ├── useNearbyMessages.ts  # Poll nearby messages
│   │   │   ├── useNearbyChests.ts    # Poll nearby chests
│   │   │   └── useProximityNotification.ts # Browser notification when near
│   │   │
│   │   ├── lib/map/
│   │   │   ├── index.ts       # Exports LeafletMap, types
│   │   │   ├── leafletMap.tsx # Map implementation, markers, popups
│   │   │   └── types.ts       # MapLocation, MapMarkerConfig, MapConfig
│   │   │
│   │   ├── pages/
│   │   │   ├── ExplorePage.tsx   # Map + ProximityCard/TagUnlockedCard
│   │   │   ├── MyTagsPage.tsx    # User's messages, edit modal
│   │   │   └── LeaderboardPage.tsx
│   │   │
│   │   ├── store/
│   │   │   ├── useAppStore.ts    # Location, messages, selected, proximity
│   │   │   ├── useUserStore.ts   # userId, username, friends
│   │   │   ├── useGameStore.ts   # Chests, chest hunter mode
│   │   │   ├── useMyTagsStore.ts # User-created messages
│   │   │   └── useThemeStore.ts  # Light/dark/system
│   │   │
│   │   └── types/
│   │       └── index.ts          # Location, Message, NearbyMessage, CreatedMessage
│   │
│   └── dist/                   # Build output
│
└── backend/
    ├── package.json
    ├── src/
    │   ├── index.ts            # Express app, CORS, route mounting
    │   ├── routes/
    │   │   ├── messages.ts     # GET nearby, POST, GET :id, PATCH
    │   │   ├── chests.ts       # GET nearby, POST
    │   │   ├── leaderboard.ts  # GET
    │   │   └── users.ts        # GET search
    │   ├── store/              # In-memory (no DB)
    │   │   ├── messages.ts
    │   │   ├── chests.ts
    │   │   ├── leaderboard.ts
    │   │   └── users.ts
    │   └── utils/
    │       └── geo.ts          # haversineDistance()
    └── dist/
```

---

## 4. API Reference

Base URL: `/api` (proxied to `http://localhost:3001` in dev)

### Messages

| Method | Route | Query/Body | Purpose |
|--------|-------|------------|---------|
| GET | `/messages/nearby` | `lat`, `lng`, `alt?`, `userId?` | Messages within 2 km. `userId` for private visibility & `isOwn`. |
| POST | `/messages` | Body: `type`, `content`, `mediaUrl?`, `latitude`, `longitude`, `altitude?`, `visibility`, `allowedUserIds?`, `category?`, `createdBy?` | Create message |
| GET | `/messages/:id` | `lat`, `lng`, `userId?` | Single message; `unlocked` if within 20 m |
| PATCH | `/messages/:id` | Body: `content?`, `visibility?`, `allowedUserIds?`, `category?` | Update message |

### Chests

| Method | Route | Query/Body | Purpose |
|--------|-------|------------|---------|
| GET | `/chests/nearby` | `lat`, `lng`, `userId?` | Chests within 2 km. `userId` for `isOwn`. |
| POST | `/chests` | Body: `content`, `latitude`, `longitude`, `altitude?`, `xpReward?`, `createdBy?` | Create chest |

### Other

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/leaderboard` | Top 10 (mock) |
| GET | `/users/search` | `q`, `limit` — user search for @mentions |
| GET | `/health` | Health check |

### Geo Constants (backend)

- **NEARBY_RADIUS_M**: 2000 (2 km)
- **UNLOCK_DISTANCE_M**: 20 m
- **CHEST_HUNTER_RADIUS_M**: 200 m (frontend)

---

## 5. Data Models

### Message (backend & frontend)

```ts
{
  id: string
  type: 'text' | 'voice' | 'image' | 'video'
  content: string
  mediaUrl?: string
  latitude, longitude, altitude?: number
  visibility: 'public' | 'private'
  allowedUserIds: string[]   // For private: who can see
  category?: string
  createdBy?: string
  createdAt: string
}
```

### NearbyMessage (extends Message)

```ts
{
  ...Message
  distance: number
  isOwn?: boolean   // createdBy === current userId
}
```

### NearbyChest (api/client.ts)

```ts
{
  id: string
  content: string
  location: { latitude, longitude, altitude? }
  distance: number
  xpReward: number
  createdBy?: string
  isOwn?: boolean
}
```

### CreatedMessage (My Tags)

```ts
{
  id, type, content, mediaUrl?, title, location, visibility,
  allowedUserIds?, category?, createdAt
}
```

### @Mention Format

In text: `@username[userId]` (e.g. `@Alex[user-1]`). Parse with regex `\[([^\]]+)\]` and filter `user-*` IDs.

---

## 6. State Management (Zustand)

| Store | Persist Key | Key State |
|-------|-------------|-----------|
| **useAppStore** | `taptag-opened` (openedMessageIds only) | `userLocation`, `nearbyMessages`, `selectedMessage`, `selectedStackItem`, `proximityState`, `openedMessageIds`, `isLocationLoading`, `locationError` |
| **useUserStore** | `taptag-user` | `userId`, `username`, `friends`, `getFriendsForMention` |
| **useGameStore** | — | `nearbyChests`, `chestHunterMode` |
| **useMyTagsStore** | `taptag-my-tags` | `messages` (CreatedMessage[]), `addMessage`, `updateMessage`, `removeMessage` |
| **useThemeStore** | `taptag-theme` | `theme`, `resolvedTheme` |

### Important Actions

- `setSelectedMessage(msg)` — Nearest message; drives ProximityCard / TagUnlockedCard
- `setSelectedStackItem({ type, data })` — Item clicked from stack popup; drives StackItemDetailModal
- `markMessageOpened(id)` — Persisted; affects map icon (envelope-opened)
- `chestHunterMode` — Derived: `nearbyChests[0]?.distance <= 200`

---

## 7. Component Hierarchy & Data Flow

```
App
├── Header (tabs, settings)
├── TabNav (Explore | My Tags | Leaderboard)
├── [ExplorePage]
│   ├── MapView
│   │   └── LeafletMap (markers, popups, StackPopupContent)
│   ├── ProximityCard | TagUnlockedCard (based on proximityState)
│   ├── StackItemDetailModal (when selectedStackItem)
│   └── CTA button
├── [MyTagsPage]
│   ├── TagCard (expandable, edit button)
│   └── EditMessageModal
├── [LeaderboardPage]
├── GameButton (FAB) → DropMessageModal
└── SettingsModal
```

### Hooks Used on ExplorePage

- `useLocation()` — Sets `userLocation` in useAppStore
- `useNearbyMessages()` — Polls `/messages/nearby`, sets `nearbyMessages`, `selectedMessage`, `proximityState`
- `useNearbyChests()` — Polls `/chests/nearby`, sets `nearbyChests`
- `useProximityNotification()` — Browser notification when `proximityState === 'near'` and `!selectedMessage.isOwn`

---

## 8. Map System

### Marker Types

- `envelope-unopened` / `envelope-opened` / `locked` — Messages
- `chest` / `chest-opened` — Chests
- `stack` — Multiple items at same location (badge count)

### Colors

- `purple` — Far
- `orange` — Near
- `green` — Unlocked
- `gold` — Chest
- `teal` — Own content (messages/chests)

### Stacking

- Group by `lat.toFixed(6)_lng.toFixed(6)`
- Single item → normal marker
- Multiple → one marker with `icon: 'stack'`, `items: MapMarkerPopupItem[]`
- Click item → `onStackItemSelect(id, type)` → `setSelectedStackItem` → StackItemDetailModal

### Tile URL

- Dark: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png`
- Light: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png`

---

## 9. Privacy & Visibility

- **Public**: Visible to everyone
- **Private**: Visible only to creator (`isOwn`) and users in `allowedUserIds`
- Creator always sees own private messages
- Private messages require at least one tagged user when creating
- `userId` is passed to `/messages/nearby` and `/chests/nearby` for filtering

---

## 10. Conventions for Agents

### Adding a New API Route

1. Add handler in `backend/src/routes/`
2. Mount in `backend/src/index.ts`
3. Add method in `frontend/src/api/client.ts`

### Adding a New Page

1. Create page in `frontend/src/pages/`
2. Add tab in `App.tsx` and `Header.tsx` (TabNav)

### Adding Store State

- Prefer existing stores; add new store only if domain is distinct
- Use `persist` for data that should survive refresh

### Modifying Map Markers

- Edit `MapView.tsx` for marker grouping and config
- Edit `leafletMap.tsx` for icons, popups, StackPopupContent

### Styling

- Use `var(--color-*)` for theme tokens
- Themes: `light`, `dark`, `chest-hunter`
- Map popup styles in `index.css` (`.leaflet-popup-content-wrapper`)

### Testing

- Use `npm run dev` for full stack
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev` (port 3001)

---

## 11. Quick Reference

| Task | Location |
|------|----------|
| Change unlock distance | `backend/src/store/messages.ts` (UNLOCK_DISTANCE_M), `frontend/src/hooks/useLocation.ts` |
| Change nearby radius | `backend/src/store/messages.ts`, `chests.ts` (NEARBY_RADIUS_M) |
| Add message type | `frontend/src/types`, `DropMessageModal`, backend `createMessage` |
| Add map marker type | `frontend/src/lib/map/types.ts`, `leafletMap.tsx` |
| Change map tiles | `frontend/src/lib/map/leafletMap.tsx` (tileUrl) |
