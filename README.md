# TapTag / Postbox

A location-based messaging app where users drop messages at physical locations. Others must visit the exact spot to discover and unlock messages.

> **For AI agents**: See [AGENTS.md](./AGENTS.md) for detailed architecture, API reference, state management, and conventions.

## Features

- **Drop messages** at your current location (with longitude, latitude, altitude)
- **Public or private** messages — private messages only visible to allowed members
- **Proximity detection** — app continuously checks for nearby messages
- **Notifications** — alerts when you're close to a message
- **Unlock at location** — messages unlock when within 20 meters

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Leaflet (maps), Zustand
- **Backend**: Node.js, Express, TypeScript

## Quick Start

```bash
# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

# Run both frontend and backend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Project Structure

```
postbox/
├── frontend/          # React + Vite app
│   └── src/
│       ├── api/       # API client
│       ├── components/
│       ├── hooks/     # useLocation, useNearbyMessages
│       ├── pages/
│       ├── store/     # Zustand state
│       └── types/
├── backend/           # Express API
│   └── src/
│       ├── routes/
│       ├── store/     # In-memory message store
│       └── utils/     # Haversine distance
└── design/            # UI reference mockups
```

## API Endpoints

- `GET /api/messages/nearby?lat=&lng=&alt=` — Get nearby messages
- `POST /api/messages` — Create a message (body: content, latitude, longitude, visibility, category)
- `GET /api/messages/:id?lat=&lng=` — Get message (unlocks if within 20m)

## Environment

- Backend runs on port 3001 (configurable via `PORT`)
- Frontend proxies `/api` to backend in development
