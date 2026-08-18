# Pantane DevTools

Your everyday developer toolbox — fast, simple utilities for developers, students, sysadmins and security enthusiasts.

> **Status:** Phase 1 (MVP). 5 tools are live: JSON Formatter, JWT Decoder, Hash Generator, Password Generator, UUID Generator.
> The rest of the tools directory is scaffolded and listed as "coming soon" — see [Roadmap](#roadmap).

## Features

- **JSON Formatter** — format, minify, validate, with exact error location
- **JWT Decoder** — decode header/payload, expiry status (never claims signature verification)
- **Hash Generator** — MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512, from text or file (streamed, no full-file memory load)
- **Password Generator** — CSPRNG-based (`secrets` module), entropy estimate, never stored
- **UUID Generator** — bulk UUID v4 generation
- Global search (`⌘K` / `Ctrl+K`), light/dark mode, responsive & keyboard-accessible UI

## Architecture

```text
pantane-devtools/
├── frontend/    Next.js 14 (App Router) + TypeScript + Tailwind CSS
├── backend/     FastAPI + Pydantic (Python 3.12+)
├── docker-compose.yml
└── .env.example
```

All tool logic runs server-side in the FastAPI backend — the frontend never duplicates
security-sensitive processing (hashing, JWT decoding, etc.) in the browser.

## Tech Stack

**Frontend:** Next.js, TypeScript, Tailwind CSS, Lucide icons, next-themes
**Backend:** FastAPI, Pydantic, Python 3.12+, slowapi (rate limiting)
**Database:** PostgreSQL (usage metadata only — see [Database](#database))
**Deployment:** Vercel (frontend) + Render/Railway/Fly.io (backend)

## Installation

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

Runs at http://localhost:3000

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Runs at http://localhost:8000 — interactive docs at `/api/docs` and `/api/redoc`.

### With Docker

```bash
cp .env.example .env
docker compose up --build
```

## Environment Variables

See `.env.example` (root) and `backend/.env.example` for the full list. Never commit a real `.env`.

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | frontend | Base URL of the FastAPI backend |
| `ALLOWED_ORIGINS` | backend | Comma-separated CORS allow-list |
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `REDIS_URL` | backend | Optional — enables distributed rate limiting |

## Development

- Backend routes live under `backend/app/api/`, business logic under `backend/app/services/`, request/response contracts under `backend/app/schemas/`.
- Frontend tool pages live under `frontend/app/tools/<slug>/page.tsx`; the tool registry (`frontend/lib/tools-data.ts`) drives the directory, search, and homepage — add an entry there when a new tool ships.

## Testing

```bash
cd backend
pytest
```

12 tests currently cover JSON, JWT, hash, password and UUID endpoints (happy path + validation errors).

## Deployment

- **Frontend:** Vercel — set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
- **Backend:** Render/Railway/Fly.io — set `ALLOWED_ORIGINS` to the deployed frontend URL, plus `DATABASE_URL` / `REDIS_URL`.

## Security

- No raw tracebacks are ever returned to the client — all errors are structured (`{ success, error: { code, message } }`) and logged server-side only.
- JWTs, generated passwords, and API request bodies are never logged or persisted.
- Password generation uses Python's `secrets` module (CSPRNG), not `random`.
- File hashing streams uploads in fixed chunks rather than loading the whole file into memory.
- Rate limiting is applied per-route (`backend/app/core/rate_limit.py`); network-facing tools (Phase 2+) get stricter limits than local/CPU-only ones.
- The upcoming HTTP/API Tester (Phase 3) will block private IPs, localhost, and cloud metadata endpoints to prevent SSRF — not yet implemented.

## API Documentation

FastAPI auto-generates interactive docs once the backend is running:
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`

## Database

Phase 1 does not require a database — all 5 live tools are stateless. Postgres is wired up in `docker-compose.yml` ahead of Phase 2+, where `tool_usage` (anonymized usage counts) and optional `users` (saved tools/favorites) tables will be added. No tool inputs, passwords, JWTs, or scanned data are ever stored.

## Roadmap

- **Phase 2:** DNS Lookup, DNS Security Checker, SSL/TLS Checker, HTTP Security Headers Checker
- **Phase 3:** HTTP/API Tester (with SSRF protections), Base64, Regex Tester, Timestamp Converter, URL/HTML Entity encoders, YAML↔JSON, QR Generator, CSV↔JSON, Text Statistics, IP Information
- **Phase 4:** Full test coverage, SEO/sitemap, deployment hardening, visual polish

Further out: GitHub/Docker utilities, SQL formatter, cron expression generator, color converter, M-Pesa developer utilities, Kenyan network utilities.

## Contribution Guide

This is currently a solo project by Pantane. Issues and PRs welcome once the repo is public.

## License

Not yet decided — treat as all rights reserved until a LICENSE file is added.
