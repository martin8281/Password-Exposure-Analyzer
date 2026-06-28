# Deployment Guide

## Docker Compose

1. Copy environment defaults:

```bash
cp .env.example .env
```

2. Edit `.env` and set a long random `JWT_SECRET`.

3. Start the stack:

```bash
docker compose up --build
```

The PostgreSQL container applies SQL files from `backend/db/migrations` during first initialization.

## Production Notes

- Terminate HTTPS at a trusted reverse proxy or load balancer.
- Set `NODE_ENV=production`.
- Set `CLIENT_ORIGIN` to the deployed frontend origin.
- Use a managed PostgreSQL service or a backed-up volume.
- Rotate the seeded admin password immediately.
- Store secrets in a secret manager rather than committing `.env`.
- Run database migrations before new backend versions.
- Configure log aggregation for backend logs and PostgreSQL logs.

## Manual Backend Deployment

```bash
cd backend
npm ci
npm run build
npm run migrate
npm run seed
npm start
```

## Manual Frontend Deployment

```bash
cd frontend
npm ci
npm run build
```

Serve `frontend/dist` with any static web server that falls back to `index.html` for client routes.
