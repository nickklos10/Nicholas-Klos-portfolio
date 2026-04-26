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
                   (corpus chunks +       (text-embedding-       (sonnet-4-6,
                    vector index)          3-small @ 1024)        tool-use loop)
```

## Features

### UI
- Swiss-minimalist design: serif display + sans body + mono metadata
- Persistent hero, real token-by-token Claude streaming, regenerate button
- Context-aware follow-up suggestions (work / bio / contact / general)
- Theme toggle: Light / Cream / Ink (persists to `localStorage`)
- Share-via-URL-hash: copy a URL that rehydrates the conversation
- Keyboard: ⌘K focus, ↵ send, ⇧↵ newline, ↑/↓ recall history, 1–N starter prompts
- Mobile: under 880px the sidebar collapses to a compact header
- Easter eggs: `/whoami`, `/sudo`, `/tea`, `/koan`, `/cv`, `/help` slash commands +
  AFK nudger that ghost-types a suggestion in the placeholder after 60s of idle

### Backend (Claude tool-use)
- **`surface_projects`** — Claude calls this when discussing work; the UI renders
  the matching `<CaseCard>` grid inline.
- **`draft_intro_email`** — drafts a tailored intro and renders Copy + Open in Mail.
- **`schedule_call`** — surfaces a Calendly link.
- **`request_human_followup`** — when a question is something only the real
  Nicholas can answer, the bot relays the visitor's name + contact + question to
  Postgres and emails me via Resend.

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
| LLM | Anthropic Claude (`claude-sonnet-4-6`) with streaming tool-use |
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

## License

MIT.
