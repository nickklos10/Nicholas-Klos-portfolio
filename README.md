# Nicholas Klos — A Conversational Portfolio

A single-page, chat-first portfolio. The page _is_ the chat — no separate
About / Projects / Contact routes. Visitors ask questions; a real Claude
integration retrieves context from a hand-written corpus, calls tools to
surface case-study cards, draft intro emails, schedule calls, or relay
follow-up requests, and streams the reply back token-by-token.

```
visitor ── nk-portfolio.vercel.app ──── /api/chat (Edge proxy)
                                              │
                                              ▼
                                        portfolio-backend (Render)
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                   Postgres + pgvector    OpenAI                 Claude
                   (corpus chunks +       (text-embedding-       (haiku-4-5,
                    vector index)          3-small @ 1024)        tool-use loop)
```

## Features

### UI
- Swiss-minimalist design: serif display + sans body + mono metadata
- Persistent hero, real token-by-token Claude streaming, regenerate button
- Conversation-aware follow-up pills — Claude generates 3 contextual follow-ups
  per reply via the `suggest_follow_ups` tool; static category-based pills act
  as a fallback if the model ever skips the tool call
- Theme toggle: Light / Cream / Ink (persists to `localStorage`); on mobile
  surfaces as a small ◐ cycle button on the right of the header
- Share-via-URL-hash: copy a URL that rehydrates the conversation
- Keyboard: ⌘K focus, ↵ send, ⇧↵ newline, ↑/↓ recall history, 1–N starter prompts
- Mobile: under 880px the sidebar collapses to a compact header; layout is
  viewport-locked (`100dvh` + internal scroll) so the composer stays pinned
- Easter eggs: `/whoami`, `/sudo`, `/tea`, `/koan`, `/cv`, `/help` slash commands +
  AFK nudger that ghost-types a suggestion in the placeholder after 60s of idle

### Backend (Claude tool-use)
- **`surface_projects`** — Claude calls this when discussing work; the UI renders
  the matching `<CaseCard>` grid inline.
- **`surface_resume`** — surfaces a downloadable resume PDF panel.
- **`draft_intro_email`** — drafts a tailored intro and renders Copy + Open in Mail.
- **`schedule_call`** — surfaces a Calendly link.
- **`request_human_followup`** — when a question is something only the real
  Nicholas can answer, the bot relays the visitor's name + contact + question to
  Postgres and emails me via Resend.
- **`suggest_follow_ups`** — Claude calls this at the end of every reply with 3
  short visitor-phrased questions; the UI swaps the suggestion pills to those.

Retrieval is built-time-indexed Markdown in
[`backend/corpus/`](backend/corpus/): bio docs, per-project deep-dives, and an
opinions folder that grows over time. Re-ingest is idempotent on `content_hash`.

## Getting started — frontend only

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Without a `BACKEND_URL` env var, `/api/chat` will
proxy to `http://localhost:8000` and fail unless the backend is also running
locally.

## Getting started — frontend + backend (full stack)

In one terminal:
```bash
cd backend
docker compose up -d postgres
python -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env  # then fill in real keys
alembic upgrade head
python -m app.ingest
uvicorn app.main:app --reload --port 8000
```

In another terminal:
```bash
BACKEND_URL=http://localhost:8000 npm run dev
```

See [`backend/README.md`](backend/README.md) for the full backend setup.

## Editing the content

### Frontend (UI surface)
All user-facing copy lives in [`src/lib/about.ts`](src/lib/about.ts):

- `name`, `email`, social links, `currently`, `voice`
- `experience` entries
- `caseStudies` — each card has `id`, `title`, `tag`, `mark`
  (`"grid" | "wave" | "spark"`), `summary`, `stack`, `outcomes`, `lesson`,
  and optional `links: { github, live }`

### Backend (what Claude actually retrieves)
The corpus the bot answers from lives in
[`backend/corpus/`](backend/corpus/):

- `bio/` — summary, voice, currently, per-role experience docs
- `projects/` — one Markdown deep-dive per case study
- `opinions/` — long-form opinions (grows over time)

Run `python -m app.ingest` after changing any Markdown to re-chunk + re-embed.
The ingest script skips files whose `content_hash` is unchanged, so it's a
no-op when the corpus is already in sync.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind v4 |
| Frontend hosting | Vercel (Edge runtime for `/api/chat` proxy) |
| Backend | FastAPI + Pydantic v2 + SQLAlchemy 2 + Alembic |
| Backend hosting | Render (Docker, free tier) |
| Vector store | Postgres 16 + pgvector |
| LLM | Anthropic Claude (`claude-haiku-4-5`) with streaming tool-use |
| Embeddings | OpenAI `text-embedding-3-small` @ 1024 dims |
| Email | Resend (free tier, 3k/mo) |
| Fonts | Instrument Serif, Inter Tight, JetBrains Mono via `next/font` |

## Deployment

- **Frontend:** pushes to `main` deploy on Vercel. Set `BACKEND_URL` env var to
  the Render service URL.
- **Backend:** the Blueprint at [`render.yaml`](render.yaml) provisions a web
  service + Postgres on Render's free tier. Set `ANTHROPIC_API_KEY`,
  `OPENAI_API_KEY`, `RESEND_API_KEY`, and `FRONTEND_ORIGIN` as secrets in the
  Render dashboard. The Dockerfile runs `alembic upgrade head && python -m
  app.ingest` on every container start (both idempotent), so the corpus
  re-syncs on every deploy.

## Abuse protection

The `/chat` endpoint enforces four caps to keep the Anthropic and OpenAI bills
bounded against burst, slow drips, and oversized payloads:

| Env var | Default | What it stops |
|---|---|---|
| `RATE_LIMIT_PER_MIN` | 30 | Burst from one IP |
| `RATE_LIMIT_PER_DAY_PER_IP` | 60 | One IP slow-dripping for 24h |
| `RATE_LIMIT_PER_DAY_GLOBAL` | 1000 | Many IPs draining the budget collectively |
| `MAX_TOTAL_CHARS_PER_REQUEST` | 20000 | A 100k-token mega-prompt (size check runs *before* any LLM/embedding call, so oversized payloads cost nothing) |

429s include the cap that tripped (`rate_limited: ip_daily_cap` etc.) so Render
logs are diagnosable. Oversized payloads return 413.

> **Note on scaling:** the limiter is in-process — it lives in the single
> Render container's memory. On the free tier this is correct (one instance
> only). If you ever scale to multiple replicas, the per-IP and global counters
> won't sync between them. The cheap fix is to divide the limits by replica
> count; the right fix is to move the bucket to Redis (or any shared
> key-value store) so all instances see the same counts.

## License

MIT.
