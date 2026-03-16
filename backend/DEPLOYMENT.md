# Postbox Backend — Deployment Guide

Production deployment pipeline for the Postbox API (Node.js + Express + SQLite).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Pipeline](#build-pipeline)
4. [Deployment Options](#deployment-options)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Health Checks](#health-checks)
7. [PostGIS Migration](#postgis-migration)

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18.x LTS or 20.x LTS |
| npm | 9+ |
| SQLite | 3.x (bundled with better-sqlite3) |

---

## Environment Configuration

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | `development` \| `production` | `development` |
| `PORT` | HTTP server port | `3001` |
| `DATABASE_PATH` | Path to SQLite database file | `./data/postbox.db` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### Example `.env` (Production)

```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=/var/lib/postbox/data/postbox.db
```

---

## Build Pipeline

### 1. Install Dependencies

```bash
npm ci
```

Use `npm ci` in CI/CD for reproducible installs (uses `package-lock.json`).

### 2. Type Check

```bash
npm run build
```

Compiles TypeScript to `dist/`. Fails on type errors.

### 3. Run Migrations (on first deploy or schema change)

Migrations run automatically on server startup. For manual runs:

```bash
cd backend && npm run db:migrate
```

### 4. Seed (optional, first deploy only)

Seed runs automatically on startup if tables are empty. To force re-seed, truncate tables and restart.

---

## Deployment Options

### Option A: Systemd (Linux)

**1. Create service file** `/etc/systemd/system/postbox-api.service`:

```ini
[Unit]
Description=Postbox API
After=network.target

[Service]
Type=simple
User=postbox
Group=postbox
WorkingDirectory=/opt/postbox/backend
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=DATABASE_PATH=/var/lib/postbox/data/postbox.db

[Install]
WantedBy=multi-user.target
```

**2. Create data directory:**

```bash
sudo mkdir -p /var/lib/postbox/data
sudo chown postbox:postbox /var/lib/postbox/data
```

**3. Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable postbox-api
sudo systemctl start postbox-api
sudo systemctl status postbox-api
```

---

### Option B: Docker

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**Build and run:**

```bash
docker build -t postbox-api .
docker run -d \
  -p 3001:3001 \
  -v postbox-data:/var/lib/postbox/data \
  -e DATABASE_PATH=/var/lib/postbox/data/postbox.db \
  --name postbox-api \
  postbox-api
```

---

### Option C: PM2

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name postbox-api
pm2 save
pm2 startup
```

---

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install
        run: cd backend && npm ci

      - name: Build
        run: cd backend && npm run build

      - name: Run migrations (dry)
        run: cd backend && node -e "require('./dist/db/migrate.js').runMigrations()"
        env:
          DATABASE_PATH: ./test.db

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: |
          # SSH deploy, rsync, or container push
          echo "Deploy to your target (SSH, K8s, etc.)"
```

### GitLab CI Example

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:20
  script:
    - cd backend
    - npm ci
    - npm run build
  artifacts:
    paths:
      - backend/dist
      - backend/node_modules

deploy:
  stage: deploy
  script:
    - scp -r backend/dist backend/node_modules user@server:/opt/postbox/
    - ssh user@server "systemctl restart postbox-api"
```

---

## Health Checks

### Liveness

```bash
curl http://localhost:3001/api/health
# {"status":"ok"}
```

### Readiness (DB)

Add to your load balancer or orchestrator:

```bash
curl -f http://localhost:3001/api/health || exit 1
```

### Recommended Health Endpoint Enhancement

Extend `/api/health` to verify DB connectivity:

```javascript
// In routes or index
app.get('/api/health', (_, res) => {
  try {
    getDb().prepare('SELECT 1').get()
    res.json({ status: 'ok', database: 'connected' })
  } catch (e) {
    res.status(503).json({ status: 'error', database: 'disconnected' })
  }
})
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use `DATABASE_PATH` on persistent volume
- [ ] Configure CORS for production origins
- [ ] Set up reverse proxy (nginx) with HTTPS
- [ ] Enable rate limiting
- [ ] Configure log aggregation
- [ ] Set up monitoring (e.g. Prometheus, Datadog)
- [ ] Schedule database backups (`sqlite3 .backup` or file copy)

---

## Database Backups

```bash
# SQLite backup (no lock)
sqlite3 /var/lib/postbox/data/postbox.db ".backup /backups/postbox-$(date +%Y%m%d).db"

# Or copy files (ensure no active writes)
cp /var/lib/postbox/data/postbox.db /backups/
cp /var/lib/postbox/data/postbox.db-wal /backups/  # if WAL mode
```

---

## PostGIS Migration

When moving to PostgreSQL + PostGIS:

1. Install `pg` and `@types/pg`
2. Create `src/db/postgres-connection.ts` with connection pool
3. Add geometry columns per `SCHEMA.md`
4. Replace haversine in repositories with `ST_DWithin` / `ST_Distance`
5. Update `getDb()` to return pg client
6. Migrate data (export SQLite → import PostgreSQL)
7. Update `DATABASE_URL` env and connection logic

See `SCHEMA.md` for PostGIS query examples.
