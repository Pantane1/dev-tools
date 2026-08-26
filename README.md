# Pantane DevTools

Your everyday developer toolbox — fast, simple utilities for developers, students, sysadmins and security enthusiasts.

> **Status:** All 27 tools from the original spec are live. Deployed on Render.

## Features

**Developer:** JSON Formatter, Base64 Encoder/Decoder, UUID Generator, Regex Tester, Timestamp Converter, URL Encoder/Decoder, HTML Entity Encoder/Decoder, YAML ↔ JSON Converter

**Security:** JWT Decoder, Hash Generator (MD5–SHA512), Password Generator, HTTP Security Headers Checker, SSL/TLS Checker, DNS Security Checker, IP Information

**Networking:** DNS Lookup, HTTP Request Tester (API Tester), IP Address Lookup, Port Checker, Ping/Latency Checker, WHOIS Lookup

**Data:** CSV ↔ JSON Converter, Text Statistics, Markdown Preview, QR Code Generator, Image Metadata Viewer

Plus: global search (`⌘K` / `Ctrl+K`), light/dark mode, responsive & keyboard-accessible UI, per-page SEO metadata, and a sitemap.

## Architecture

```text
pantane-devtools/
├── frontend/    Next.js 14 (App Router) + TypeScript + Tailwind CSS
├── backend/     FastAPI + Pydantic (Python 3.12+)
├── docker-compose.yml
├── render.yaml
└── .env.example
```

All tool logic runs server-side in the FastAPI backend — the frontend never duplicates
security-sensitive processing (hashing, JWT decoding, etc.) in the browser.

Each tool route is split into a server component (`page.tsx`, carries per-page SEO metadata)
and a client component (`client.tsx`, the actual interactive tool) — this is what lets every
tool page have its own title/description for search engines and social previews while staying
fully interactive.

## Tech Stack

**Frontend:** Next.js, TypeScript, Tailwind CSS, Lucide icons, next-themes, Vitest + Testing Library
**Backend:** FastAPI, Pydantic, Python 3.12+, slowapi (rate limiting), dnspython, httpx, PyYAML, Pillow, qrcode, markdown, bleach
**Database:** PostgreSQL (usage metadata only — see [Database](#database))
**Deployment:** Vercel-compatible frontend build; currently deployed to Render (both services) via `render.yaml`

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
| `PYTHON_VERSION` | Render | Pinned to 3.12.7 — newer Python versions may lack prebuilt wheels for `pydantic-core` |

## Development

- Backend routes live under `backend/app/api/`, business logic under `backend/app/services/`, request/response contracts under `backend/app/schemas/`.
- Frontend tool pages live under `frontend/app/tools/<slug>/` as a `page.tsx` (server component, SEO metadata) + `client.tsx` (the interactive tool). The tool registry (`frontend/lib/tools-data.ts`) drives the directory, search, homepage, and sitemap — add an entry there when a new tool ships.

## Testing

```bash
cd backend
pytest
```
58 tests covering every tool's happy path and error/validation cases. Network calls (DNS, SSL, HTTP, RDAP) are mocked in tests since they require live external connectivity.

```bash
cd frontend
npm run test
```
Vitest + Testing Library covering shared components (`CopyButton`, `ToolCard`) and core library logic (`utils`, `tools-data`).

## Deployment

- **Frontend & Backend:** deployed via `render.yaml` as a Render Blueprint — provisions both web services plus a Postgres database in one step. See the two services' Environment tabs to set `ALLOWED_ORIGINS` / `NEXT_PUBLIC_API_URL` to each other's live URLs after first deploy.
- Render's build environment sometimes defaults to a newer Python than what's tested here (e.g. 3.14) — if a build fails on `pydantic-core` trying to compile via Rust/maturin, set `PYTHON_VERSION=3.12.7` as an environment variable on the backend service.

## Security

- No raw tracebacks are ever returned to the client — all errors are structured (`{ success, error: { code, message } }`) and logged server-side only.
- JWTs, generated passwords, and API request bodies are never logged or persisted.
- Password generation uses Python's `secrets` module (CSPRNG), not `random`.
- File hashing streams uploads in fixed chunks rather than loading the whole file into memory.
- Every tool that makes an outbound network call to a user-supplied host (DNS, SSL, Headers, Port Checker, Ping) goes through a shared SSRF guard (`backend/app/core/network_safety.py`) that resolves the hostname and rejects private/loopback/link-local/reserved IPs and the cloud metadata address.
- The HTTP/API Tester has extra hardening beyond that shared guard: it never auto-follows redirects (prevents a public URL from redirecting to an internal one after the safety check passes), strips any caller-supplied `Host` header, and caps response size.
- Port Checker and Ping are deliberately scoped to a single host:port per request — never a port range — so they stay legitimate diagnostic tools rather than scanning tools.
- WHOIS and IP Address Lookup query a fixed public RDAP host (`rdap.org`), never an arbitrary user-supplied target, so they don't need the SSRF guard the network tools above do.
- Markdown Preview is rendered server-side and sanitized with `bleach` before reaching the browser — raw Markdown can embed `<script>` tags.
- Image Metadata flags when an uploaded image contains GPS EXIF data, since that's easy to forget about before sharing a photo.
- Rate limiting is applied per-route (`backend/app/core/rate_limit.py`) in three tiers: local/CPU-only tools get the most generous limit, tools making outbound network calls get a stricter one, and the API Tester (highest abuse potential) gets the strictest.

## Performance

- DNS Lookup and DNS Security Checker cache results in-process for 60 seconds, since repeated identical queries in a short window are common (e.g. a user re-running a check) and DNS records don't need real-time freshness at that granularity.
- Static pages are prerendered at build time (Next.js static generation) wherever no per-request data is needed.

## Accessibility

- Every interactive control (inputs, sliders, icon-only buttons) has either a visible `<label>`/`htmlFor` pairing or an `aria-label`.
- Visible keyboard focus outlines are applied globally (`globals.css`), and `prefers-reduced-motion` disables animations for users who've requested it system-wide.
- Color tokens (blue/emerald/slate) were chosen to keep text-on-background contrast comfortably above WCAG AA at normal text sizes.

## API Documentation

FastAPI auto-generates interactive docs once the backend is running:
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`

## SEO

Every tool page has its own `<title>`, meta description, and Open Graph tags (see each `page.tsx`). `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and `/robots.txt` automatically from the live tools registry — a new tool marked `status: "live"` in `tools-data.ts` is picked up by the sitemap with no extra work.

## Database

All 27 tools are stateless — no tool input, password, JWT, image, or scanned data is ever stored. Postgres is wired up in `docker-compose.yml` for future `tool_usage` (anonymized counts) and optional `users` (saved tools/favorites) tables, neither of which exists yet.

## Roadmap

Everything in the original spec is built. Possible future additions (not currently planned): GitHub/Docker utilities, SQL formatter, cron expression generator, color converter, JWT signer/verifier, webhook tester, log analyzer, code formatter, M-Pesa developer utilities, Kenyan network utilities.

## Contribution Guide

This is currently a solo project by Pantane. Issues and PRs welcome once the repo is public.

## License

Not yet decided — treat as all rights reserved until a LICENSE file is added.
