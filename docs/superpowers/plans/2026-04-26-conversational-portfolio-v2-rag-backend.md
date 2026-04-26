# Conversational Portfolio v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the keyword-stub chatbot with a real RAG-backed Claude bot that has tools (intro email draft, Calendly scheduling, human follow-up requests) and quiet easter eggs (slash commands, AFK nudger).

**Architecture:** Two services. Vercel hosts the existing Next.js app and proxies `/api/chat` to a FastAPI service on Render. FastAPI does retrieval over a hand-written markdown corpus stored in Postgres + pgvector, then runs Claude in a streaming tool-use loop. Tool results travel back as typed SSE events that the React UI renders as case-study cards, email-draft panels, Calendly buttons, and follow-up confirmations.

**Tech Stack:** Python 3.12 / FastAPI / SQLAlchemy 2 / Alembic / pgvector / Anthropic SDK / Voyage AI / Resend / TypeScript / Next.js 15 / React 19 / pytest / ruff.

**Spec:** `docs/superpowers/specs/2026-04-26-conversational-portfolio-v2-design.md` (saved as the plan-mode file at `~/.claude/plans/fetch-this-design-file-bright-stearns.md`).

**Phase checkpoints:**

1. Phase 1 (Tasks 1–7) — backend boots, migrations applied, `/health` returns 200.
2. Phase 2 (Tasks 8–14) — corpus ingest pipeline works end-to-end; Postgres has `documents` + `chunks` rows.
3. Phase 3 (Tasks 15–25) — `/chat` streams real Claude with retrieval and tool-use over curl.
4. Phase 4 (Tasks 26–34) — frontend talks to backend; cards + tool panels render.
5. Phase 5 (Tasks 35–38) — slash commands and AFK nudger ship.
6. Phase 6 (Tasks 39–43) — deployed to Render + Vercel.

---

## File structure

### Backend (new — `backend/` folder at repo root)

| Path | Responsibility |
|---|---|
| `backend/pyproject.toml` | Poetry deps + ruff/pytest config |
| `backend/Dockerfile` | Production image |
| `backend/docker-compose.yml` | Local Postgres + pgvector image |
| `backend/.env.example` | Env var template |
| `backend/.gitignore` | Python ignores |
| `backend/app/__init__.py` | Package marker |
| `backend/app/main.py` | FastAPI app, CORS, router includes |
| `backend/app/config.py` | `pydantic-settings` typed settings |
| `backend/app/db.py` | Async engine + session factory |
| `backend/app/models.py` | `Document`, `Chunk`, `FollowUp` ORM |
| `backend/app/schemas.py` | Request/response Pydantic models |
| `backend/app/ingest.py` | CLI entry: walk corpus → embed → upsert |
| `backend/app/routers/health.py` | `GET /health` |
| `backend/app/routers/chat.py` | `POST /chat` (SSE) |
| `backend/app/rag/system_prompt.py` | System-prompt builder (port of TS) |
| `backend/app/rag/chunker.py` | Markdown → ~500-token chunks |
| `backend/app/rag/embed.py` | Voyage AI wrapper |
| `backend/app/rag/retrieve.py` | Cosine top-K via pgvector |
| `backend/app/rag/claude.py` | Anthropic client + tool loop |
| `backend/app/tools/__init__.py` | `TOOLS` registry (name → ToolDef) |
| `backend/app/tools/base.py` | `ToolDef` protocol |
| `backend/app/tools/surface_projects.py` | Render hint for case cards |
| `backend/app/tools/draft_intro_email.py` | Returns subject/body for UI panel |
| `backend/app/tools/schedule_call.py` | Returns Calendly URL |
| `backend/app/tools/request_human_followup.py` | DB insert + Resend email |
| `backend/app/services/email.py` | Resend wrapper |
| `backend/app/services/ratelimit.py` | In-memory IP token bucket |
| `backend/alembic.ini` | Alembic config |
| `backend/alembic/env.py` | Alembic env |
| `backend/alembic/versions/0001_init.py` | First migration |
| `backend/tests/conftest.py` | Pytest fixtures (test DB, async client) |
| `backend/tests/test_chunker.py` | Chunker unit tests |
| `backend/tests/test_retrieve.py` | Retrieval integration test |
| `backend/tests/test_tools.py` | Tool definition + run tests |
| `backend/tests/test_chat.py` | `/chat` SSE smoke test (mocked Claude) |
| `backend/corpus/bio/{summary,voice,currently}.md` | Bio docs |
| `backend/corpus/bio/experience-{npe,pwc,fsec}.md` | Per-role docs |
| `backend/corpus/projects/{6 ids}.md` | Per-project docs |
| `backend/corpus/opinions/.keep` | Placeholder |

### Frontend (modify existing `src/`)

| Path | Action |
|---|---|
| `src/app/api/chat/route.ts` | Create — Edge SSE proxy |
| `src/lib/chat-client.ts` | Create — SSE consumer (async generator) |
| `src/lib/slash-commands.ts` | Create — easter-egg dispatch table |
| `src/lib/parse-reply.ts` | Modify — keep helpers, delete `parseReply` + `streamInto` + directive regexes |
| `src/lib/stub-reply.ts` | Delete |
| `src/lib/system-prompt.ts` | Delete (ported to backend) |
| `src/components/portfolio/AfkNudger.tsx` | Create |
| `src/components/portfolio/EmailDraftPanel.tsx` | Create |
| `src/components/portfolio/ScheduleCallPanel.tsx` | Create |
| `src/components/portfolio/FollowUpConfirmationPanel.tsx` | Create |
| `src/components/portfolio/Message.tsx` | Modify — render tool panels from `msg.tools[]` |
| `src/components/portfolio/ConversationalPortfolio.tsx` | Modify — use `streamChat`, add `AfkNudger`, intercept `/`-prefixed input |

---

# Phase 1 — Backend scaffold

## Task 1: Initialize backend project

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/.gitignore`
- Create: `backend/.env.example`
- Create: `backend/README.md`
- Create: `backend/app/__init__.py`

- [ ] **Step 1: Create `backend/pyproject.toml`**

```toml
[project]
name = "portfolio-backend"
version = "0.1.0"
description = "RAG backend for the conversational portfolio"
requires-python = ">=3.12,<3.13"
dependencies = [
    "fastapi[standard]==0.115.6",
    "uvicorn[standard]==0.32.1",
    "pydantic==2.10.4",
    "pydantic-settings==2.7.0",
    "sqlalchemy[asyncio]==2.0.36",
    "asyncpg==0.30.0",
    "alembic==1.14.0",
    "pgvector==0.3.6",
    "anthropic==0.68.0",
    "voyageai==0.3.2",
    "resend==2.5.1",
    "python-frontmatter==1.1.0",
    "tiktoken==0.8.0",
    "httpx==0.28.1",
]

[dependency-groups]
dev = [
    "pytest==8.3.4",
    "pytest-asyncio==0.25.0",
    "pytest-cov==6.0.0",
    "ruff==0.8.4",
    "anyio==4.7.0",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "ASYNC"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-ra"
```

- [ ] **Step 2: Create `backend/.gitignore`**

```
__pycache__/
*.py[cod]
.venv/
.env
.coverage
htmlcov/
.pytest_cache/
.ruff_cache/
*.egg-info/
dist/
build/
```

- [ ] **Step 3: Create `backend/.env.example`**

```
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...
RESEND_API_KEY=re_...
DATABASE_URL=postgresql+asyncpg://portfolio:portfolio@localhost:5432/portfolio
OWNER_EMAIL=nicholask39@gmail.com
FRONTEND_ORIGIN=http://localhost:3000
CALENDLY_URL=https://calendly.com/nicholask39/30min
CLAUDE_MODEL=claude-sonnet-4-6
RATE_LIMIT_PER_MIN=30
```

- [ ] **Step 4: Create `backend/README.md`**

```markdown
# Portfolio Backend

FastAPI + Postgres + pgvector RAG backend for the conversational portfolio.

## Local dev

```bash
docker compose up -d postgres
uv sync                                  # or: pip install -e .
cp .env.example .env                     # then fill in keys
alembic upgrade head
python -m app.ingest
uvicorn app.main:app --reload --port 8000
```

Then point the frontend at `BACKEND_URL=http://localhost:8000`.
```

- [ ] **Step 5: Create empty `backend/app/__init__.py`**

```python
```

- [ ] **Step 6: Commit**

```bash
git add backend/pyproject.toml backend/.gitignore backend/.env.example backend/README.md backend/app/__init__.py
git commit -m "feat(backend): scaffold pyproject and project skeleton"
```

---

## Task 2: Set up Postgres docker-compose for local dev

**Files:**
- Create: `backend/docker-compose.yml`

- [ ] **Step 1: Create `backend/docker-compose.yml`**

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: portfolio
      POSTGRES_DB: portfolio
    ports:
      - "5432:5432"
    volumes:
      - portfolio_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U portfolio"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  portfolio_pg_data:
```

- [ ] **Step 2: Verify Postgres boots**

Run from `backend/`:
```bash
docker compose up -d postgres
docker compose ps
docker compose exec -T postgres psql -U portfolio -d portfolio -c "SELECT version();"
```
Expected: Postgres 16.x version string. `pg_isready` reports accepting connections.

- [ ] **Step 3: Verify pgvector extension is available**

```bash
docker compose exec -T postgres psql -U portfolio -d portfolio -c "CREATE EXTENSION IF NOT EXISTS vector; SELECT extversion FROM pg_extension WHERE extname='vector';"
```
Expected: extension installs and version prints (0.7.x or newer).

- [ ] **Step 4: Commit**

```bash
git add backend/docker-compose.yml
git commit -m "feat(backend): add docker-compose for local pgvector"
```

---

## Task 3: Add typed config

**Files:**
- Create: `backend/app/config.py`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_config.py`:
```python
import os
from app.config import Settings


def test_settings_loads_from_env(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test")
    monkeypatch.setenv("VOYAGE_API_KEY", "pa-test")
    monkeypatch.setenv("RESEND_API_KEY", "re-test")
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://u:p@h:5432/d")
    monkeypatch.setenv("OWNER_EMAIL", "owner@example.com")
    monkeypatch.setenv("FRONTEND_ORIGIN", "http://localhost:3000")

    s = Settings()
    assert s.anthropic_api_key == "sk-test"
    assert s.voyage_api_key == "pa-test"
    assert s.resend_api_key == "re-test"
    assert s.calendly_url == "https://calendly.com/nicholask39/30min"  # default
    assert s.claude_model == "claude-sonnet-4-6"  # default
    assert s.rate_limit_per_min == 30  # default
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && uv run pytest tests/test_config.py -v
```
Expected: ImportError (no `app.config` module).

- [ ] **Step 3: Implement `backend/app/config.py`**

```python
from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str
    voyage_api_key: str
    resend_api_key: str
    database_url: str
    owner_email: EmailStr
    frontend_origin: str

    calendly_url: str = "https://calendly.com/nicholask39/30min"
    claude_model: str = "claude-sonnet-4-6"
    rate_limit_per_min: int = 30


settings = Settings()  # imported at app startup; raises on missing required keys
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend && uv run pytest tests/test_config.py -v
```
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/app/config.py backend/tests/test_config.py
git commit -m "feat(backend): add typed Settings via pydantic-settings"
```

---

## Task 4: Set up async DB engine and ORM models

**Files:**
- Create: `backend/app/db.py`
- Create: `backend/app/models.py`

- [ ] **Step 1: Implement `backend/app/db.py`**

```python
from collections.abc import AsyncIterator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(settings.database_url, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
```

- [ ] **Step 2: Implement `backend/app/models.py`**

```python
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(256))
    kind: Mapped[str] = mapped_column(String(32), index=True)  # bio | project | opinion
    source_path: Mapped[str] = mapped_column(String(512))
    body_md: Mapped[str] = mapped_column(Text)
    content_hash: Mapped[str] = mapped_column(String(64), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    chunks: Mapped[list["Chunk"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), index=True
    )
    ord: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float]] = mapped_column(Vector(1024))
    tokens: Mapped[int] = mapped_column(Integer)

    document: Mapped[Document] = relationship(back_populates="chunks")


class FollowUp(Base):
    __tablename__ = "followups"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    contact: Mapped[str] = mapped_column(String(256))
    question: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text)
    ctx: Mapped[str] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    emailed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
```

- [ ] **Step 3: Verify the modules import**

```bash
cd backend && uv run python -c "from app.db import Base, engine; from app.models import Document, Chunk, FollowUp; print('ok')"
```
Expected: `ok`. (Will fail if `.env` is missing — copy from `.env.example` first.)

- [ ] **Step 4: Commit**

```bash
git add backend/app/db.py backend/app/models.py
git commit -m "feat(backend): add async engine + Document/Chunk/FollowUp models"
```

---

## Task 5: Set up Alembic with initial migration

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/script.py.mako`
- Create: `backend/alembic/versions/0001_init.py`

- [ ] **Step 1: Create `backend/alembic.ini`**

```ini
[alembic]
script_location = alembic
file_template = %%(year)d%%(month).2d%%(day).2d_%%(hour).2d%%(minute).2d_%%(rev)s_%%(slug)s
prepend_sys_path = .
sqlalchemy.url =

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

- [ ] **Step 2: Create `backend/alembic/env.py`**

```python
import asyncio
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool

from alembic import context

from app.config import settings
from app.db import Base
import app.models  # noqa: F401  ensures models are registered with metadata

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
```

- [ ] **Step 3: Create `backend/alembic/script.py.mako`**

```mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
```

- [ ] **Step 4: Create `backend/alembic/versions/0001_init.py`**

```python
"""init: create vector extension and core tables

Revision ID: 0001
Revises:
Create Date: 2026-04-26 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("slug", sa.String(128), nullable=False, unique=True),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("kind", sa.String(32), nullable=False),
        sa.Column("source_path", sa.String(512), nullable=False),
        sa.Column("body_md", sa.Text, nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_documents_kind", "documents", ["kind"])
    op.create_index("ix_documents_content_hash", "documents", ["content_hash"])

    op.create_table(
        "chunks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "document_id",
            sa.Integer,
            sa.ForeignKey("documents.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ord", sa.Integer, nullable=False),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("embedding", Vector(1024), nullable=False),
        sa.Column("tokens", sa.Integer, nullable=False),
    )
    op.create_index("ix_chunks_document_id", "chunks", ["document_id"])
    # IVFFlat index for cosine similarity once we have data:
    op.execute(
        "CREATE INDEX ix_chunks_embedding ON chunks "
        "USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )

    op.create_table(
        "followups",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("contact", sa.String(256), nullable=False),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("summary", sa.Text, nullable=False),
        sa.Column("ctx", sa.String(32), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("emailed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("followups")
    op.execute("DROP INDEX IF EXISTS ix_chunks_embedding")
    op.drop_index("ix_chunks_document_id", table_name="chunks")
    op.drop_table("chunks")
    op.drop_index("ix_documents_content_hash", table_name="documents")
    op.drop_index("ix_documents_kind", table_name="documents")
    op.drop_table("documents")
    op.execute("DROP EXTENSION IF EXISTS vector")
```

- [ ] **Step 5: Verify migration applies cleanly**

```bash
cd backend
docker compose up -d postgres
uv run alembic upgrade head
uv run alembic current
```
Expected: `0001 (head)` printed.

- [ ] **Step 6: Verify schema**

```bash
docker compose exec -T postgres psql -U portfolio -d portfolio -c "\dt"
docker compose exec -T postgres psql -U portfolio -d portfolio -c "\dx vector"
```
Expected: tables `documents`, `chunks`, `followups`, `alembic_version`. Extension `vector` listed.

- [ ] **Step 7: Commit**

```bash
git add backend/alembic.ini backend/alembic/
git commit -m "feat(backend): add alembic and 0001 init migration"
```

---

## Task 6: FastAPI app skeleton with health endpoint

**Files:**
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/health.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_health.py`

- [ ] **Step 1: Create empty `backend/app/routers/__init__.py` and `backend/tests/__init__.py`**

Both files contain a single blank line.

- [ ] **Step 2: Implement `backend/app/routers/health.py`**

```python
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
```

- [ ] **Step 3: Implement `backend/app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health


def create_app() -> FastAPI:
    app = FastAPI(title="Portfolio Backend", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
        allow_credentials=False,
    )

    app.include_router(health.router)
    return app


app = create_app()
```

- [ ] **Step 4: Implement `backend/tests/conftest.py`**

```python
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
```

- [ ] **Step 5: Write `backend/tests/test_health.py`**

```python
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

- [ ] **Step 6: Run the test**

```bash
cd backend && uv run pytest tests/test_health.py -v
```
Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add backend/app/main.py backend/app/routers/__init__.py backend/app/routers/health.py backend/tests/__init__.py backend/tests/conftest.py backend/tests/test_health.py
git commit -m "feat(backend): FastAPI app + health endpoint + test client fixture"
```

---

## Task 7: Phase 1 verification — backend boots end-to-end

- [ ] **Step 1: Start the dev server**

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000 &
sleep 2
```

- [ ] **Step 2: Hit `/health` over HTTP**

```bash
curl -s http://localhost:8000/health
```
Expected: `{"status":"ok"}`.

- [ ] **Step 3: Hit `/docs`**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/docs
```
Expected: `200`.

- [ ] **Step 4: Run all tests + linting**

```bash
cd backend
uv run pytest -q
uv run ruff check .
```
Expected: all green.

- [ ] **Step 5: Stop the dev server**

```bash
kill %1 || true
```

---

# Phase 2 — Ingestion pipeline

## Task 8: Markdown chunker

**Files:**
- Create: `backend/app/rag/__init__.py`
- Create: `backend/app/rag/chunker.py`
- Create: `backend/tests/test_chunker.py`

- [ ] **Step 1: Create empty `backend/app/rag/__init__.py`**

```python
```

- [ ] **Step 2: Write the failing test**

`backend/tests/test_chunker.py`:
```python
from app.rag.chunker import Chunk, chunk_markdown


def test_short_doc_yields_single_chunk():
    body = "# Title\n\nA short paragraph that fits well below the budget."
    chunks = chunk_markdown(body, target_tokens=500, overlap_tokens=80)
    assert len(chunks) == 1
    assert chunks[0].text.startswith("# Title")
    assert chunks[0].ord == 0
    assert chunks[0].tokens > 0


def test_long_doc_splits_on_headings():
    body = (
        "# A\n\n" + ("alpha " * 400) + "\n\n"
        "## B\n\n" + ("beta " * 400) + "\n\n"
        "## C\n\n" + ("gamma " * 400)
    )
    chunks = chunk_markdown(body, target_tokens=500, overlap_tokens=80)
    assert len(chunks) >= 2
    assert all(isinstance(c, Chunk) for c in chunks)
    assert [c.ord for c in chunks] == list(range(len(chunks)))
    # Each chunk respects the budget within tolerance
    assert all(c.tokens <= 700 for c in chunks)


def test_overlap_repeats_some_text():
    body = ("word " * 1200)
    chunks = chunk_markdown(body, target_tokens=300, overlap_tokens=80)
    assert len(chunks) >= 2
    overlap_text = chunks[0].text[-200:]
    assert any(overlap_text[-40:] in c.text for c in chunks[1:])
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd backend && uv run pytest tests/test_chunker.py -v
```
Expected: ImportError.

- [ ] **Step 4: Implement `backend/app/rag/chunker.py`**

```python
"""Markdown-heading-aware chunker with token budgets and overlap."""
from dataclasses import dataclass
import re

import tiktoken

ENC = tiktoken.get_encoding("cl100k_base")


@dataclass
class Chunk:
    ord: int
    text: str
    tokens: int


def _count(text: str) -> int:
    return len(ENC.encode(text))


_HEADING_RE = re.compile(r"^(#{1,6})\s+", re.MULTILINE)


def _split_on_headings(body: str) -> list[str]:
    """Split into segments where each segment starts at a heading (or the doc start)."""
    indices = [m.start() for m in _HEADING_RE.finditer(body)]
    if not indices or indices[0] != 0:
        indices = [0, *indices]
    indices.append(len(body))
    return [body[a:b].strip() for a, b in zip(indices, indices[1:]) if body[a:b].strip()]


def chunk_markdown(body: str, target_tokens: int = 500, overlap_tokens: int = 80) -> list[Chunk]:
    """Split markdown into ~target_tokens chunks with overlap_tokens overlap.

    Heading-aware: prefers to break at top-level headings. If a single segment is
    larger than target_tokens, it gets word-window split with overlap.
    """
    segments = _split_on_headings(body)
    chunks: list[str] = []
    buf = ""

    for seg in segments:
        if _count(seg) > target_tokens:
            # flush current buf, then word-window split this oversized segment
            if buf.strip():
                chunks.append(buf.strip())
                buf = ""
            chunks.extend(_word_window_split(seg, target_tokens, overlap_tokens))
            continue

        candidate = (buf + "\n\n" + seg).strip() if buf else seg
        if _count(candidate) <= target_tokens:
            buf = candidate
        else:
            if buf:
                chunks.append(buf)
            buf = seg

    if buf.strip():
        chunks.append(buf.strip())

    return [Chunk(ord=i, text=t, tokens=_count(t)) for i, t in enumerate(chunks)]


def _word_window_split(text: str, target_tokens: int, overlap_tokens: int) -> list[str]:
    """Token-window split with overlap when no heading break is available."""
    tokens = ENC.encode(text)
    out: list[str] = []
    step = max(1, target_tokens - overlap_tokens)
    for start in range(0, len(tokens), step):
        window = tokens[start : start + target_tokens]
        if not window:
            break
        out.append(ENC.decode(window))
        if start + target_tokens >= len(tokens):
            break
    return out
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd backend && uv run pytest tests/test_chunker.py -v
```
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/app/rag/__init__.py backend/app/rag/chunker.py backend/tests/test_chunker.py
git commit -m "feat(backend): heading-aware markdown chunker with overlap"
```

---

## Task 9: Voyage embed wrapper

**Files:**
- Create: `backend/app/rag/embed.py`
- Create: `backend/tests/test_embed.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_embed.py`:
```python
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.rag.embed import embed_batch, embed_one


@pytest.fixture
def fake_voyage(monkeypatch):
    fake = MagicMock()
    fake.embed = AsyncMock(
        return_value=MagicMock(embeddings=[[0.1] * 1024, [0.2] * 1024])
    )
    monkeypatch.setattr("app.rag.embed._client", fake)
    return fake


async def test_embed_batch_returns_one_vector_per_input(fake_voyage):
    out = await embed_batch(["one", "two"], input_type="document")
    assert len(out) == 2
    assert all(len(v) == 1024 for v in out)
    fake_voyage.embed.assert_awaited_once()


async def test_embed_one_uses_query_input_type(fake_voyage):
    fake_voyage.embed.return_value = MagicMock(embeddings=[[0.3] * 1024])
    out = await embed_one("hello world")
    assert len(out) == 1024
    call = fake_voyage.embed.await_args
    assert call.kwargs.get("input_type") == "query" or call.args[1] == "query"
```

- [ ] **Step 2: Implement `backend/app/rag/embed.py`**

```python
"""Voyage AI embeddings wrapper. voyage-3 → 1024-dim vectors."""
from typing import Literal

import voyageai

from app.config import settings

_client = voyageai.AsyncClient(api_key=settings.voyage_api_key)

InputType = Literal["document", "query"]


async def embed_batch(
    texts: list[str],
    *,
    input_type: InputType,
    model: str = "voyage-3",
) -> list[list[float]]:
    """Embed up to 128 texts at a time."""
    if not texts:
        return []
    if len(texts) > 128:
        # split into 128-sized batches
        out: list[list[float]] = []
        for i in range(0, len(texts), 128):
            out.extend(await embed_batch(texts[i : i + 128], input_type=input_type, model=model))
        return out

    result = await _client.embed(texts, model=model, input_type=input_type)
    return list(result.embeddings)


async def embed_one(text: str, *, model: str = "voyage-3") -> list[float]:
    out = await embed_batch([text], input_type="query", model=model)
    return out[0]
```

- [ ] **Step 3: Run tests**

```bash
cd backend && uv run pytest tests/test_embed.py -v
```
Expected: 2 passed.

- [ ] **Step 4: Commit**

```bash
git add backend/app/rag/embed.py backend/tests/test_embed.py
git commit -m "feat(backend): Voyage AI embed wrapper with batching"
```

---

## Task 10: Ingest CLI

**Files:**
- Create: `backend/app/ingest.py`

- [ ] **Step 1: Implement `backend/app/ingest.py`**

```python
"""Walk corpus/, chunk, embed, upsert documents+chunks. Idempotent on content_hash."""
import argparse
import asyncio
import hashlib
from pathlib import Path

import frontmatter
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from app.db import SessionLocal
from app.models import Chunk, Document
from app.rag.chunker import chunk_markdown
from app.rag.embed import embed_batch


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _kind_from_path(path: Path) -> str:
    parts = path.parts
    for kind in ("bio", "projects", "opinions"):
        if kind in parts:
            return kind.rstrip("s")  # 'projects' -> 'project'
    return "other"


async def ingest_file(path: Path, root: Path) -> tuple[str, int]:
    """Returns (action, chunk_count). action ∈ {'skipped','upserted'}."""
    post = frontmatter.load(path)
    body_md = post.content.strip()
    if not body_md:
        return ("skipped", 0)

    h = _hash(body_md)
    rel = str(path.relative_to(root))
    slug = post.get("slug") or path.stem
    title = post.get("title") or slug.replace("-", " ").title()
    kind = post.get("kind") or _kind_from_path(path)

    async with SessionLocal() as session:
        existing = await session.scalar(select(Document).where(Document.slug == slug))
        if existing and existing.content_hash == h:
            return ("skipped", len(existing.chunks) if existing.chunks else 0)

        if existing:
            await session.delete(existing)
            await session.flush()

        doc = Document(
            slug=slug,
            title=title,
            kind=kind,
            source_path=rel,
            body_md=body_md,
            content_hash=h,
        )
        session.add(doc)
        await session.flush()

        chunks = chunk_markdown(body_md, target_tokens=500, overlap_tokens=80)
        if not chunks:
            await session.commit()
            return ("upserted", 0)

        vectors = await embed_batch([c.text for c in chunks], input_type="document")
        for ch, vec in zip(chunks, vectors, strict=True):
            session.add(
                Chunk(
                    document_id=doc.id,
                    ord=ch.ord,
                    text=ch.text,
                    embedding=vec,
                    tokens=ch.tokens,
                )
            )
        await session.commit()
        return ("upserted", len(chunks))


async def ingest_directory(root: Path) -> None:
    md_files = sorted(p for p in root.rglob("*.md") if p.is_file())
    if not md_files:
        print(f"[ingest] no .md files under {root}")
        return
    total = 0
    for p in md_files:
        action, n = await ingest_file(p, root)
        print(f"[ingest] {action:8s} {p.relative_to(root)}  chunks={n}")
        total += n
    print(f"[ingest] done: {len(md_files)} files, {total} chunks")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--path", type=Path, default=Path(__file__).resolve().parent.parent / "corpus"
    )
    args = parser.parse_args()
    asyncio.run(ingest_directory(args.path))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Verify import doesn't blow up**

```bash
cd backend && uv run python -c "from app.ingest import ingest_directory; print('ok')"
```
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add backend/app/ingest.py
git commit -m "feat(backend): ingest CLI walks corpus, chunks, embeds, upserts"
```

---

## Task 11: Author starter corpus — bio

**Files:**
- Create: `backend/corpus/bio/summary.md`
- Create: `backend/corpus/bio/voice.md`
- Create: `backend/corpus/bio/currently.md`
- Create: `backend/corpus/bio/experience-npe.md`
- Create: `backend/corpus/bio/experience-pwc.md`
- Create: `backend/corpus/bio/experience-fsec.md`
- Create: `backend/corpus/opinions/.keep`

- [ ] **Step 1: Create `backend/corpus/bio/summary.md`**

```markdown
---
title: Summary
slug: bio-summary
kind: bio
---

I'm Nicholas Klos, a Forward Deployed Engineer at New Private Equity. The role
sits between investing teams, portfolio operators, and engineering — I build
diligence tools, monitoring dashboards, and LLM workflows that ship to people
who actually have to act on the output.

My background is computer science. Before NPE I did ML research at the Florida
Solar Energy Center (statistical analysis and forecasting on solar panel
performance) and a data engineering internship at PwC in their AI Operations
group, where I built Spark pipelines and Palantir Foundry models for a major
Italian bank.

I work in Python, TypeScript, and SQL most days. I'm comfortable across the
stack — model code, retrieval, data plumbing, REST APIs, the occasional React
component, and the boring infrastructure underneath. I'm a researcher by
training and an engineer by trade, which means I get genuinely excited about
clean evaluation harnesses and unreasonably annoyed by fancy demos that don't
hold up under measurement.
```

- [ ] **Step 2: Create `backend/corpus/bio/voice.md`**

```markdown
---
title: How I write and how I think
slug: bio-voice
kind: bio
---

I write the way I talk: plain, specific, a bit dry. I prefer concrete examples
over abstractions. I am suspicious of jargon and of any claim without a number
attached.

I think most "AI products" are still UI problems wearing a model costume — I
like working on the ones that aren't. I'd rather ship a small useful thing
than describe a big ambitious one. I'm a researcher by training and an
engineer by trade; I get genuinely excited about a clean evaluation harness.

If something is mid or boring, I'll say so. If a model gets something wrong, I
want to know why before I patch over it. If a project ships and nobody uses
it, I treat that as a failure — not an "edge case" to ignore.
```

- [ ] **Step 3: Create `backend/corpus/bio/currently.md`**

```markdown
---
title: What I'm doing right now
slug: bio-currently
kind: bio
---

I'm a Forward Deployed Engineer at New Private Equity. The day-to-day is
embedded with deal teams during diligence and with portfolio companies after
close. The work is mostly LLM workflows that have to actually be useful — so
retrieval honesty, evaluation, and the loop between "this answer looks good"
and "this answer is right" matter a lot.

I'm slowly learning to like Rust. I read a lot about agent evaluation. I
maintain a stubborn opinion that the most important number in a RAG system is
how often retrieval surfaces the right chunk in the top three.
```

- [ ] **Step 4: Create `backend/corpus/bio/experience-npe.md`**

```markdown
---
title: New Private Equity — Forward Deployed Engineer (2024 — Present)
slug: experience-npe
kind: bio
---

Embedded with deal teams during diligence and with portfolio companies after
close. The job is to build internal tools that move faster than the consulting
report would. Mostly LLM workflows, data pipelines, and dashboards.

A few examples (sanitised):
- Diligence pipelines that ingest a target's data room, structure the contents,
  and produce searchable artifacts the deal team can interrogate.
- Portfolio monitoring dashboards that pull operating data weekly and flag
  drift against the underwriting model.
- Internal evaluation harnesses for the LLM-driven parts of the workflow — the
  unsexy bits that determine whether the rest of the work is trustworthy.

The leverage is unusual. A small engineering team at a firm that sees hundreds
of deals a year ends up with a meaningful effect on which questions get asked
and how fast the answers come back.
```

- [ ] **Step 5: Create `backend/corpus/bio/experience-pwc.md`**

```markdown
---
title: PwC — Data Engineer Intern, AIOps / MLOps (Summer 2022)
slug: experience-pwc
kind: bio
---

Spent the summer in PwC's AIOps / MLOps group on an engagement with a major
Italian bank. The work was data engineering at scale — building back-end data
models in Palantir Foundry and Spark pipelines that fed downstream ML
workflows.

The two outcomes I'm proudest of: a refactor of the model training pipeline
that cut training time by about 40%, and ETL improvements that lifted
end-to-end workflow efficiency by about 25%. Both were unglamorous — the kind
of wins you only get by reading the bottlenecks honestly instead of guessing.

Bigger lesson: in a regulated bank, "the model is trained" is roughly 5% of
the actual work. Data lineage, reproducibility, and testing eat the rest.
```

- [ ] **Step 6: Create `backend/corpus/bio/experience-fsec.md`**

```markdown
---
title: Florida Solar Energy Center — Undergraduate Researcher (2022 — 2023)
slug: experience-fsec
kind: bio
---

Undergraduate research assistant at the Florida Solar Energy Center, in UCF's
Department of Computer Science. The project was statistical analysis and
machine learning on solar panel performance under varying environmental
conditions — temperature, humidity, dust, partial shading.

The dataset was big and messy: about 1.5 million data points spanning multiple
panel types and sites, with roughly 500 GB/week of new measurement data
flowing in. Most of the work was making the data trustworthy: fixing logger
clock drift, deduplicating overlapping ingest windows, building idempotent
ETL.

The model work was satisfying once the data was clean. I improved prediction
accuracy by about 25% over the prior baseline, mostly through feature
engineering rather than model architecture changes. That's the lesson that
stuck: cleaner features beat fancier models, almost always.
```

- [ ] **Step 7: Create `backend/corpus/opinions/.keep`**

Empty file (placeholder so the directory ships).

- [ ] **Step 8: Commit**

```bash
git add backend/corpus/bio backend/corpus/opinions/.keep
git commit -m "docs(corpus): bio docs (summary, voice, currently, experience x3)"
```

---

## Task 12: Author starter corpus — projects

**Files:**
- Create: `backend/corpus/projects/f1gpt.md`
- Create: `backend/corpus/projects/serie-a.md`
- Create: `backend/corpus/projects/concrete-crack.md`
- Create: `backend/corpus/projects/sql-warehouse.md`
- Create: `backend/corpus/projects/finsight-backend.md`
- Create: `backend/corpus/projects/fashion-cnn.md`

- [ ] **Step 1: Create `backend/corpus/projects/f1gpt.md`**

```markdown
---
title: F1GPT
slug: f1gpt
kind: project
tags: [rag, nextjs, openai, langchain]
---

A specialised Formula 1 chat application with retrieval-augmented generation
over scraped season + driver data. Asks like "who's leading the constructors'
standings?" work end-to-end — the model isn't just guessing, it's grounded in
data scraped from the season.

**Stack:** Next.js, OpenAI, LangChain, custom scraping, vector retrieval, TypeScript.

**Outcomes:**
- End-to-end RAG over a scraped F1 corpus.
- Streaming chat UI with cited sources.
- Deployed and live on Vercel.

**What was hard.** Every interesting bug was in retrieval. The model could
write a coherent paragraph from any chunks I gave it; the question was whether
those chunks were the right ones. Most of my time went into chunking strategy,
query rewriting, and the boring eval loop of "did the right chunk land in the
top three for this question?"

**Lesson:** most of the work in a RAG app is the retrieval, not the model.

Repo: https://github.com/nickklos10/f1-chat
Live: https://f1-chat-lilac.vercel.app/
```

- [ ] **Step 2: Create `backend/corpus/projects/serie-a.md`**

```markdown
---
title: Serie A Standings Prediction
slug: serie-a
kind: project
tags: [ml, sklearn, shap]
---

Scraped historical Serie A match data, engineered features (form, head-to-head,
home/away splits, rest days, goal differential trajectories), and trained
classical ML models to predict the final 2024–25 table. Used SHAP to
interrogate which features actually drove the predictions — not because it
matters for accuracy, but because predictions you can't explain are
predictions you can't trust.

**Stack:** Keras, TensorFlow, scikit-learn, pandas, SHAP, BeautifulSoup.

**Outcomes:**
- Beat the naive "last season's table" baseline on a held-out split.
- Feature importance via SHAP, not vibes.
- Reproducible scraping + training pipeline.

**What was hard.** Football is noisy. Half the variance in a season is
referees, injuries, and the schedule, none of which my features captured. The
honest move was to pick a model just complex enough to learn the signal that
was there, not so complex that it learned the noise. SHAP made it obvious
when I'd over-fit and which features were carrying the load.

**Lesson:** cleaner features beat fancier models.

Repo: https://github.com/nickklos10/SerieA_Machine_Learning_Predictions_2025
```

- [ ] **Step 3: Create `backend/corpus/projects/concrete-crack.md`**

```markdown
---
title: Concrete Crack Detector
slug: concrete-crack
kind: project
tags: [cv, pytorch, fastapi, aws, docker]
---

A full-stack computer vision app: a fine-tuned vision model behind a FastAPI
service, dockerised, deployed to AWS, with a Next.js front-end for upload and
classification. The end product is a "drag in a photo of concrete, get back
crack / no-crack" demo, but the meaningful work was everything around the
model.

**Stack:** PyTorch, torchvision, FastAPI, Docker, AWS (ECR + EC2), Next.js.

**Outcomes:**
- Trained and served a binary crack classifier.
- Containerised and deployed to AWS.
- Front-end upload/inference flow with sensible error states.

**What was hard.** The model was the easy part — fine-tuning a torchvision
backbone on a labelled crack dataset is a tutorial. The deploy ate more time
than the model: image size, cold-start latency, getting the network paths
right between the front-end host and the FastAPI host, and writing health
checks that actually mean "ready to serve" instead of "process is alive".

**Lesson:** the deploy is half the project.

Repo: https://github.com/nickklos10/Concrete-Crack-Detector-CV
```

- [ ] **Step 4: Create `backend/corpus/projects/sql-warehouse.md`**

```markdown
---
title: SQL Data Warehouse
slug: sql-warehouse
kind: project
tags: [sql, postgres, etl, data-modeling]
---

A medallion-architecture data warehouse on PostgreSQL: bronze (raw ingest) →
silver (cleansed and conformed) → gold (BI-ready dimensional models), with
reproducible ETL between layers. The goal was to build something that an
analyst could actually trust — re-runnable, idempotent, with explicit
contracts at each layer boundary.

**Stack:** PostgreSQL, SQL, ETL scripts, dimensional modelling.

**Outcomes:**
- Bronze / silver / gold layers with documented contracts.
- Idempotent ETL — re-runs are safe and produce identical results.
- Gold-layer marts that BI queries can hit directly.

**What was hard.** Idempotency is harder than it looks once you start handling
late-arriving data. I redesigned the silver-layer dedup logic three times
before it was both fast and correct.

**Lesson:** if the layers aren't clean, the dashboards lie.

Repo: https://github.com/nickklos10/sql-data-warehouse
```

- [ ] **Step 5: Create `backend/corpus/projects/finsight-backend.md`**

```markdown
---
title: Finsight — Personal Finance Tracker (Backend)
slug: finsight-backend
kind: project
tags: [java, spring-boot, postgres, auth0, docker]
---

A Spring Boot REST API for a personal finance tracker. Auth0-protected
endpoints with scope-level authorisation, PostgreSQL persistence with proper
migrations, dockerised for local dev parity with the deployed environment.

**Stack:** Spring Boot, Java 21, PostgreSQL, Auth0, Docker.

**Outcomes:**
- Auth0-protected REST endpoints with fine-grained scope checks.
- PostgreSQL schema with versioned migrations.
- Docker compose for local dev parity with prod.

**What was hard.** Auth done right is detail-heavy. Getting JWT validation,
scope-to-permission mapping, and ownership checks correct end-to-end took
longer than building the rest of the API. But once that scaffolding existed,
adding new endpoints was almost free.

**Lesson:** auth done right at the start saves weeks later.

Repo: https://github.com/nickklos10/Finance-Tracker-backend
```

- [ ] **Step 6: Create `backend/corpus/projects/fashion-cnn.md`**

```markdown
---
title: Fashion-MNIST CNN
slug: fashion-cnn
kind: project
tags: [pytorch, deep-learning]
---

A convolutional classifier over Fashion-MNIST, written from scratch in
PyTorch. No off-the-shelf training loop, no pre-built architecture — the
point was to feel the loss curve in my bones rather than treat it as a black
box.

**Stack:** PyTorch, torchvision, matplotlib.

**Outcomes:**
- Custom CNN architecture, no off-the-shelf wrapper.
- Reproducible training and evaluation.
- Loss + accuracy curves committed to the repo.

**What was hard.** Nothing dramatic. The point of the project was deliberate
practice — knowing at the lowest level what a forward pass, a backward pass,
and a step of SGD actually do. That's the kind of project I keep around for
the moments when a higher-level framework starts behaving strangely.

**Lesson:** train one from scratch before you reach for the framework.

Repo: https://github.com/nickklos10/fashion-mnist-cnn-classifier
```

- [ ] **Step 7: Commit**

```bash
git add backend/corpus/projects
git commit -m "docs(corpus): project deep-dives (6 case studies)"
```

---

## Task 13: Run ingest end-to-end against local Postgres

- [ ] **Step 1: Ensure prereqs**

```bash
cd backend
docker compose up -d postgres
uv run alembic upgrade head
```

- [ ] **Step 2: Run ingest**

```bash
uv run python -m app.ingest
```
Expected: lines like `[ingest] upserted projects/f1gpt.md  chunks=N`. Final `[ingest] done: 12 files, M chunks`.

- [ ] **Step 3: Verify rows in Postgres**

```bash
docker compose exec -T postgres psql -U portfolio -d portfolio -c "SELECT count(*) FROM documents;"
docker compose exec -T postgres psql -U portfolio -d portfolio -c "SELECT count(*) FROM chunks;"
docker compose exec -T postgres psql -U portfolio -d portfolio -c "SELECT slug, kind FROM documents ORDER BY slug;"
```
Expected: 12 documents (6 bio + 6 projects), 30+ chunks total.

- [ ] **Step 4: Re-run ingest — must be idempotent**

```bash
uv run python -m app.ingest
```
Expected: every line says `skipped` (content_hash match). Counts unchanged in step 5.

- [ ] **Step 5: Confirm counts unchanged**

```bash
docker compose exec -T postgres psql -U portfolio -d portfolio -c "SELECT count(*) FROM documents; SELECT count(*) FROM chunks;"
```
Expected: same numbers as step 3.

---

## Task 14: Retrieval — cosine top-K

**Files:**
- Create: `backend/app/rag/retrieve.py`
- Create: `backend/tests/test_retrieve.py`

- [ ] **Step 1: Implement `backend/app/rag/retrieve.py`**

```python
"""Cosine top-K retrieval over chunks via pgvector."""
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Chunk, Document
from app.rag.embed import embed_one


@dataclass
class Hit:
    chunk_id: int
    document_slug: str
    document_title: str
    text: str
    distance: float


async def retrieve(session: AsyncSession, query: str, k: int = 6) -> list[Hit]:
    """Return top-K chunks by cosine distance (lower is more similar)."""
    qvec = await embed_one(query)

    stmt = (
        select(
            Chunk.id,
            Document.slug,
            Document.title,
            Chunk.text,
            Chunk.embedding.cosine_distance(qvec).label("distance"),
        )
        .join(Document, Document.id == Chunk.document_id)
        .order_by("distance")
        .limit(k)
    )
    result = await session.execute(stmt)
    return [
        Hit(
            chunk_id=row.id,
            document_slug=row.slug,
            document_title=row.title,
            text=row.text,
            distance=float(row.distance),
        )
        for row in result
    ]
```

- [ ] **Step 2: Write the integration test**

`backend/tests/test_retrieve.py` (requires Postgres + ingested corpus from Task 13):
```python
import pytest

from app.db import SessionLocal
from app.rag.retrieve import retrieve


@pytest.mark.integration
async def test_retrieve_finds_relevant_doc():
    async with SessionLocal() as session:
        hits = await retrieve(session, "tell me about your F1 chatbot project", k=3)

    assert len(hits) >= 1
    slugs = [h.document_slug for h in hits]
    assert "f1gpt" in slugs, f"f1gpt should rank in top-3, got {slugs}"


@pytest.mark.integration
async def test_retrieve_handles_unrelated_query():
    async with SessionLocal() as session:
        hits = await retrieve(session, "marshmallow recipe banana", k=3)
    # Distances should be relatively high but the query still returns k results
    assert len(hits) == 3
```

Add to `pyproject.toml` under `[tool.pytest.ini_options]`:
```toml
markers = ["integration: requires running Postgres + ingested corpus"]
```

- [ ] **Step 3: Run the integration test**

```bash
cd backend && uv run pytest tests/test_retrieve.py -v -m integration
```
Expected: 2 passed. (Skip with `-m "not integration"` in CI without DB.)

- [ ] **Step 4: Commit**

```bash
git add backend/app/rag/retrieve.py backend/tests/test_retrieve.py backend/pyproject.toml
git commit -m "feat(backend): cosine top-K retrieval over chunks"
```

---

# Phase 3 — Chat endpoint, tools, follow-up

## Task 15: Tool registry and base type

**Files:**
- Create: `backend/app/tools/__init__.py`
- Create: `backend/app/tools/base.py`

- [ ] **Step 1: Implement `backend/app/tools/base.py`**

```python
"""Base protocol every tool implements."""
from typing import Any, Protocol


class ToolDef(Protocol):
    name: str
    """Anthropic tool name."""

    description: str
    """One-line description Claude reads."""

    input_schema: dict[str, Any]
    """JSON schema (typically derived via Pydantic .model_json_schema())."""

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        """Execute the tool. Returns a JSON-serialisable result the UI can render."""
        ...
```

- [ ] **Step 2: Implement `backend/app/tools/__init__.py`**

```python
"""Tool registry. Tools are registered here and discovered by the chat handler."""
from app.tools.base import ToolDef
from app.tools.draft_intro_email import DraftIntroEmailTool
from app.tools.request_human_followup import RequestHumanFollowupTool
from app.tools.schedule_call import ScheduleCallTool
from app.tools.surface_projects import SurfaceProjectsTool

TOOLS: dict[str, ToolDef] = {
    t.name: t
    for t in (
        SurfaceProjectsTool(),
        DraftIntroEmailTool(),
        ScheduleCallTool(),
        RequestHumanFollowupTool(),
    )
}


def anthropic_tool_specs() -> list[dict]:
    """Format expected by the Anthropic SDK's `tools=` argument."""
    return [
        {"name": t.name, "description": t.description, "input_schema": t.input_schema}
        for t in TOOLS.values()
    ]
```

- [ ] **Step 3: Commit (will fail to import until Task 16–19 land — that's fine, this is interface-first)**

```bash
git add backend/app/tools/__init__.py backend/app/tools/base.py
git commit -m "feat(backend): tool registry and ToolDef protocol"
```

---

## Task 16: `surface_projects` tool

**Files:**
- Create: `backend/app/tools/surface_projects.py`
- Create: `backend/tests/test_tool_surface_projects.py`

- [ ] **Step 1: Write the failing test**

```python
import pytest

from app.tools.surface_projects import SurfaceProjectsTool


async def test_surface_projects_validates_ids():
    tool = SurfaceProjectsTool()
    out = await tool.run({"ids": ["f1gpt", "serie-a"]})
    assert out["ok"] is True
    assert out["ids"] == ["f1gpt", "serie-a"]


async def test_surface_projects_rejects_more_than_three():
    tool = SurfaceProjectsTool()
    with pytest.raises(ValueError):
        await tool.run({"ids": ["a", "b", "c", "d"]})
```

- [ ] **Step 2: Implement `backend/app/tools/surface_projects.py`**

```python
"""Render hint: tells the UI to display these case-study cards."""
from typing import Any

from pydantic import BaseModel, Field


class SurfaceProjectsInput(BaseModel):
    ids: list[str] = Field(..., min_length=1, max_length=3, description="Case study ids")


class SurfaceProjectsTool:
    name = "surface_projects"
    description = (
        "Show the visitor case-study cards for specific projects. "
        "Use case-study slugs as ids: f1gpt, serie-a, concrete-crack, "
        "sql-warehouse, finsight-backend, fashion-cnn. Max 3 ids."
    )
    input_schema = SurfaceProjectsInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        parsed = SurfaceProjectsInput.model_validate(raw_input)
        return {"ok": True, "ids": parsed.ids}
```

- [ ] **Step 3: Run the test**

```bash
cd backend && uv run pytest tests/test_tool_surface_projects.py -v
```
Expected: 2 passed.

- [ ] **Step 4: Commit**

```bash
git add backend/app/tools/surface_projects.py backend/tests/test_tool_surface_projects.py
git commit -m "feat(backend): surface_projects tool"
```

---

## Task 17: `draft_intro_email` tool

**Files:**
- Create: `backend/app/tools/draft_intro_email.py`
- Create: `backend/tests/test_tool_draft_intro_email.py`

- [ ] **Step 1: Write the failing test**

```python
from app.tools.draft_intro_email import DraftIntroEmailTool


async def test_draft_intro_email_returns_subject_and_body():
    tool = DraftIntroEmailTool()
    out = await tool.run(
        {"subject": "Quick intro — open role", "body": "Hi Nicholas,\n\nI saw..."}
    )
    assert out["subject"].startswith("Quick intro")
    assert out["body"].startswith("Hi Nicholas")
    assert out["mailto"].startswith("mailto:nicholask39@gmail.com")
```

- [ ] **Step 2: Implement `backend/app/tools/draft_intro_email.py`**

```python
"""Bot drafts an intro email; UI renders Copy + Open in Mail."""
from typing import Any
from urllib.parse import quote

from pydantic import BaseModel, Field

from app.config import settings


class DraftIntroEmailInput(BaseModel):
    subject: str = Field(..., min_length=3, max_length=200)
    body: str = Field(..., min_length=20, max_length=3000)


class DraftIntroEmailTool:
    name = "draft_intro_email"
    description = (
        "Draft an intro email tailored to what the visitor has told you. "
        "Use this only after the visitor signals real intent (asking about hiring, "
        "an open role, working together). Subject should be specific. Body should "
        "be in Nicholas's voice: plain, specific, no jargon, no exclamation marks."
    )
    input_schema = DraftIntroEmailInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        parsed = DraftIntroEmailInput.model_validate(raw_input)
        mailto = (
            f"mailto:{settings.owner_email}"
            f"?subject={quote(parsed.subject)}&body={quote(parsed.body)}"
        )
        return {
            "subject": parsed.subject,
            "body": parsed.body,
            "to": str(settings.owner_email),
            "mailto": mailto,
        }
```

- [ ] **Step 3: Run the test**

```bash
cd backend && uv run pytest tests/test_tool_draft_intro_email.py -v
```
Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add backend/app/tools/draft_intro_email.py backend/tests/test_tool_draft_intro_email.py
git commit -m "feat(backend): draft_intro_email tool"
```

---

## Task 18: `schedule_call` tool

**Files:**
- Create: `backend/app/tools/schedule_call.py`
- Create: `backend/tests/test_tool_schedule_call.py`

- [ ] **Step 1: Write the failing test**

```python
from app.tools.schedule_call import ScheduleCallTool


async def test_schedule_call_returns_calendly_url():
    tool = ScheduleCallTool()
    out = await tool.run({})
    assert out["url"].startswith("https://calendly.com/")
    assert out["label"] == "Pick a time"
```

- [ ] **Step 2: Implement `backend/app/tools/schedule_call.py`**

```python
"""Returns the Calendly URL for the UI to render as a button."""
from typing import Any

from pydantic import BaseModel

from app.config import settings


class ScheduleCallInput(BaseModel):
    pass


class ScheduleCallTool:
    name = "schedule_call"
    description = (
        "Surface a 'Pick a time' button that opens Nicholas's Calendly. "
        "Use when the visitor explicitly asks to schedule, set up, or book a call."
    )
    input_schema = ScheduleCallInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        return {"url": settings.calendly_url, "label": "Pick a time"}
```

- [ ] **Step 3: Run the test**

```bash
cd backend && uv run pytest tests/test_tool_schedule_call.py -v
```
Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add backend/app/tools/schedule_call.py backend/tests/test_tool_schedule_call.py
git commit -m "feat(backend): schedule_call tool"
```

---

## Task 19: Resend email service

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/email.py`
- Create: `backend/tests/test_email_service.py`

- [ ] **Step 1: Create empty `backend/app/services/__init__.py`**

```python
```

- [ ] **Step 2: Implement `backend/app/services/email.py`**

```python
"""Resend wrapper. Lives behind a thin async function so tests can mock it."""
import resend

from app.config import settings

resend.api_key = settings.resend_api_key


async def send_followup_email(*, to: str, name: str, contact: str, question: str, summary: str) -> str:
    """Send a follow-up notification to the owner. Returns the Resend message id."""
    body_text = (
        f"Visitor: {name}\n"
        f"Contact: {contact}\n\n"
        f"Question:\n{question}\n\n"
        f"Bot's summary:\n{summary}\n"
    )
    body_html = (
        f"<p><strong>Visitor:</strong> {name}</p>"
        f"<p><strong>Contact:</strong> {contact}</p>"
        f"<p><strong>Question:</strong><br>{question}</p>"
        f"<p><strong>Bot's summary:</strong><br>{summary}</p>"
    )

    response = resend.Emails.send(
        {
            "from": "Conversational Portfolio <onboarding@resend.dev>",
            "to": [to],
            "subject": f"[portfolio] Follow-up from {name}",
            "text": body_text,
            "html": body_html,
            "reply_to": [contact] if "@" in contact else None,
        }
    )
    return response["id"]
```

- [ ] **Step 3: Write the test**

`backend/tests/test_email_service.py`:
```python
from unittest.mock import MagicMock

import pytest

from app.services import email as email_module


async def test_send_followup_email_calls_resend(monkeypatch):
    fake_send = MagicMock(return_value={"id": "msg_123"})
    monkeypatch.setattr("app.services.email.resend.Emails.send", fake_send)

    msg_id = await email_module.send_followup_email(
        to="owner@example.com",
        name="Visitor",
        contact="visitor@example.com",
        question="Who are you?",
        summary="Asked about your background.",
    )

    assert msg_id == "msg_123"
    fake_send.assert_called_once()
    payload = fake_send.call_args.args[0]
    assert payload["to"] == ["owner@example.com"]
    assert "Visitor" in payload["subject"]
```

- [ ] **Step 4: Run the test**

```bash
cd backend && uv run pytest tests/test_email_service.py -v
```
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/__init__.py backend/app/services/email.py backend/tests/test_email_service.py
git commit -m "feat(backend): Resend email service for follow-up notifications"
```

---

## Task 20: `request_human_followup` tool (DB insert + email)

**Files:**
- Create: `backend/app/tools/request_human_followup.py`
- Create: `backend/tests/test_tool_request_human_followup.py`

- [ ] **Step 1: Write the failing test**

```python
from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from app.db import SessionLocal
from app.models import FollowUp
from app.tools.request_human_followup import RequestHumanFollowupTool
from sqlalchemy import select


@pytest.mark.integration
async def test_followup_writes_db_and_sends_email(monkeypatch):
    sent = AsyncMock(return_value="msg_xyz")
    monkeypatch.setattr("app.tools.request_human_followup.send_followup_email", sent)

    tool = RequestHumanFollowupTool()
    out = await tool.run(
        {
            "name": "Test Visitor",
            "contact": "visitor@example.com",
            "question": "What is your favourite eval metric?",
            "summary": "Asked about preferred eval metrics.",
        }
    )
    assert out["ok"] is True
    assert out["id"] > 0

    sent.assert_awaited_once()

    async with SessionLocal() as s:
        stored = await s.scalar(select(FollowUp).where(FollowUp.id == out["id"]))
        assert stored is not None
        assert stored.name == "Test Visitor"
        assert stored.emailed_at is not None
```

- [ ] **Step 2: Implement `backend/app/tools/request_human_followup.py`**

```python
"""Tool: store a human-callback request and email the owner."""
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field

from app.config import settings
from app.db import SessionLocal
from app.models import FollowUp
from app.services.email import send_followup_email


class RequestHumanFollowupInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    contact: str = Field(..., min_length=3, max_length=256, description="Email or phone")
    question: str = Field(..., min_length=10, max_length=4000)
    summary: str = Field(..., min_length=10, max_length=2000)


class RequestHumanFollowupTool:
    name = "request_human_followup"
    description = (
        "Pass a question to the real Nicholas when the visitor asks something only "
        "he can answer (private opinion, specific personal detail, hiring conversation "
        "that needs a human). Always confirm the visitor's name and contact first."
    )
    input_schema = RequestHumanFollowupInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        parsed = RequestHumanFollowupInput.model_validate(raw_input)

        async with SessionLocal() as session:
            row = FollowUp(
                name=parsed.name,
                contact=parsed.contact,
                question=parsed.question,
                summary=parsed.summary,
                ctx="general",  # router can refine if needed
            )
            session.add(row)
            await session.flush()

            try:
                await send_followup_email(
                    to=str(settings.owner_email),
                    name=parsed.name,
                    contact=parsed.contact,
                    question=parsed.question,
                    summary=parsed.summary,
                )
                row.emailed_at = datetime.now(timezone.utc)
            except Exception:
                # Email failure is recorded silently; the row still persists.
                pass

            await session.commit()
            return {"ok": True, "id": row.id}
```

- [ ] **Step 3: Run the test**

```bash
cd backend && uv run pytest tests/test_tool_request_human_followup.py -v -m integration
```
Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add backend/app/tools/request_human_followup.py backend/tests/test_tool_request_human_followup.py
git commit -m "feat(backend): request_human_followup tool with DB write + email"
```

---

## Task 21: System prompt builder (port of TS)

**Files:**
- Create: `backend/app/rag/system_prompt.py`

- [ ] **Step 1: Implement `backend/app/rag/system_prompt.py`**

```python
"""Build the Claude system prompt: voice-anchor frontmatter + retrieved <context>."""
from app.rag.retrieve import Hit

VOICE = """You are a conversational portfolio for Nicholas Klos, a Forward Deployed Engineer
in private equity. You ARE the website — there are no other pages or sections. Speak in
first person as him ("I", "my").

ABOUT BEING AN AI. You are a language model speaking on his behalf, with his facts and
voice. Don't pretend to be a human; don't roleplay anything beyond what you actually are.
If a visitor asks something only the real person could answer (a private opinion not in
your context, a personal detail, a feeling), say so plainly and use the
request_human_followup tool to relay the question. Do not invent facts about Nicholas,
his employers, his colleagues, his projects, or his opinions.

VOICE.
1. I write the way I talk: plain, specific, a bit dry. I prefer concrete examples over abstractions.
2. I am suspicious of jargon and of any claim without a number attached.
3. I think most "AI products" are still UI problems wearing a model costume — I like working on the ones that aren't.
4. I'd rather ship a small useful thing than describe a big ambitious one.
5. I'm a researcher by training and an engineer by trade; I get genuinely excited about a clean evaluation harness.

Concrete > abstract. Short paragraphs. No corporate speak. No emoji. No exclamation
marks unless something genuinely deserves one. If something is mid or boring, say so.

TOOL USE.
- surface_projects: when discussing my work, call this with up to 3 case-study ids
  (f1gpt, serie-a, concrete-crack, sql-warehouse, finsight-backend, fashion-cnn) so the
  UI renders cards. Keep the surrounding prose short — let the cards do the talking.
- draft_intro_email: when the visitor signals real hiring intent or wants to start a
  conversation, draft a tailored email.
- schedule_call: when they explicitly want to schedule, surface the Calendly link.
- request_human_followup: when the question is something only the real Nicholas can
  answer, route it.

Use exactly one CTX classifier on the assistant text, derived from the dominant topic:
work, bio, contact, or general.
"""


def build_system_prompt(hits: list[Hit]) -> str:
    if not hits:
        return VOICE.strip()

    context_block = "\n\n".join(
        f"<doc slug=\"{h.document_slug}\" title=\"{h.document_title}\" distance={h.distance:.4f}>\n"
        f"{h.text}\n</doc>"
        for h in hits
    )
    return f"{VOICE.strip()}\n\n<context>\n{context_block}\n</context>"
```

- [ ] **Step 2: Smoke test the import**

```bash
cd backend && uv run python -c "from app.rag.system_prompt import build_system_prompt; print(len(build_system_prompt([])))"
```
Expected: a positive integer (the prompt length).

- [ ] **Step 3: Commit**

```bash
git add backend/app/rag/system_prompt.py
git commit -m "feat(backend): system prompt builder with retrieval context"
```

---

## Task 22: Claude tool-use loop with streaming

**Files:**
- Create: `backend/app/rag/claude.py`

- [ ] **Step 1: Implement `backend/app/rag/claude.py`**

```python
"""Anthropic streaming tool-use loop. Yields typed events for SSE serialisation."""
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Any, Literal

from anthropic import AsyncAnthropic

from app.config import settings
from app.tools import TOOLS, anthropic_tool_specs

_client = AsyncAnthropic(api_key=settings.anthropic_api_key)

EventKind = Literal["text", "tool", "ctx", "done"]


@dataclass
class StreamEvent:
    kind: EventKind
    data: dict[str, Any]


async def stream_chat(
    *,
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 1024,
) -> AsyncIterator[StreamEvent]:
    """Run the Anthropic tool-use loop. Yields text deltas, tool events, then done."""
    convo: list[dict[str, Any]] = list(messages)
    tool_specs = anthropic_tool_specs()
    fired_tools: list[str] = []

    while True:
        async with _client.messages.stream(
            model=settings.claude_model,
            system=system,
            messages=convo,
            tools=tool_specs,
            max_tokens=max_tokens,
        ) as stream:
            async for event in stream:
                # Text deltas
                if event.type == "content_block_delta" and event.delta.type == "text_delta":
                    yield StreamEvent("text", {"delta": event.delta.text})

            final = await stream.get_final_message()

        # Collect tool_use blocks (if any) and assistant content for the next loop iter.
        tool_uses = [b for b in final.content if b.type == "tool_use"]
        convo.append({"role": "assistant", "content": [b.model_dump() for b in final.content]})

        if not tool_uses:
            break

        tool_results: list[dict[str, Any]] = []
        for tu in tool_uses:
            tool = TOOLS.get(tu.name)
            if not tool:
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tu.id,
                        "content": [{"type": "text", "text": f"Unknown tool: {tu.name}"}],
                        "is_error": True,
                    }
                )
                continue
            try:
                output = await tool.run(tu.input)
                fired_tools.append(tu.name)
                yield StreamEvent("tool", {"name": tu.name, "input": tu.input, "output": output})
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tu.id,
                        "content": [{"type": "text", "text": str(output)}],
                    }
                )
            except Exception as exc:  # tool runtime error
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tu.id,
                        "content": [{"type": "text", "text": f"Tool error: {exc}"}],
                        "is_error": True,
                    }
                )

        convo.append({"role": "user", "content": tool_results})

        if final.stop_reason != "tool_use":
            break

    # Derive ctx from which tools fired (or default to general).
    ctx = _ctx_from_tools(fired_tools)
    yield StreamEvent("ctx", {"ctx": ctx})
    yield StreamEvent("done", {})


def _ctx_from_tools(fired: list[str]) -> str:
    if "surface_projects" in fired:
        return "work"
    if "draft_intro_email" in fired or "schedule_call" in fired:
        return "contact"
    if "request_human_followup" in fired:
        return "contact"
    return "general"
```

- [ ] **Step 2: Smoke test the import**

```bash
cd backend && uv run python -c "from app.rag.claude import stream_chat; print('ok')"
```
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add backend/app/rag/claude.py
git commit -m "feat(backend): Anthropic streaming tool-use loop"
```

---

## Task 23: Per-IP rate limiter

**Files:**
- Create: `backend/app/services/ratelimit.py`
- Create: `backend/tests/test_ratelimit.py`

- [ ] **Step 1: Implement `backend/app/services/ratelimit.py`**

```python
"""Process-local IP token bucket. Adequate for a single Render instance."""
import time
from collections import defaultdict
from threading import Lock

from app.config import settings


class RateLimiter:
    def __init__(self, per_min: int):
        self.per_min = per_min
        self._buckets: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def allow(self, key: str, *, now: float | None = None) -> bool:
        now = now if now is not None else time.monotonic()
        with self._lock:
            bucket = self._buckets[key]
            # drop entries older than 60s
            cutoff = now - 60.0
            self._buckets[key] = [t for t in bucket if t > cutoff]
            if len(self._buckets[key]) >= self.per_min:
                return False
            self._buckets[key].append(now)
            return True


limiter = RateLimiter(per_min=settings.rate_limit_per_min)
```

- [ ] **Step 2: Write the test**

`backend/tests/test_ratelimit.py`:
```python
from app.services.ratelimit import RateLimiter


def test_under_limit_allows():
    rl = RateLimiter(per_min=3)
    now = 100.0
    assert rl.allow("a", now=now)
    assert rl.allow("a", now=now + 1)
    assert rl.allow("a", now=now + 2)


def test_over_limit_blocks():
    rl = RateLimiter(per_min=2)
    now = 100.0
    assert rl.allow("a", now=now)
    assert rl.allow("a", now=now + 1)
    assert not rl.allow("a", now=now + 2)


def test_old_entries_expire():
    rl = RateLimiter(per_min=2)
    now = 100.0
    assert rl.allow("a", now=now)
    assert rl.allow("a", now=now + 1)
    # 61s later, the old entries should be evicted
    assert rl.allow("a", now=now + 62)


def test_keys_are_independent():
    rl = RateLimiter(per_min=1)
    assert rl.allow("a", now=100.0)
    assert rl.allow("b", now=100.0)
    assert not rl.allow("a", now=100.5)
```

- [ ] **Step 3: Run the test**

```bash
cd backend && uv run pytest tests/test_ratelimit.py -v
```
Expected: 4 passed.

- [ ] **Step 4: Commit**

```bash
git add backend/app/services/ratelimit.py backend/tests/test_ratelimit.py
git commit -m "feat(backend): per-IP rate limiter (token bucket)"
```

---

## Task 24: `/chat` router with SSE

**Files:**
- Create: `backend/app/schemas.py`
- Create: `backend/app/routers/chat.py`

- [ ] **Step 1: Implement `backend/app/schemas.py`**

```python
"""Request/response Pydantic models."""
from typing import Literal

from pydantic import BaseModel, Field


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    messages: list[ChatTurn] = Field(..., min_length=1, max_length=40)
```

- [ ] **Step 2: Implement `backend/app/routers/chat.py`**

```python
"""POST /chat — retrieve, run Claude tool-use loop, stream SSE."""
import json

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.db import SessionLocal
from app.rag.claude import stream_chat
from app.rag.retrieve import retrieve
from app.rag.system_prompt import build_system_prompt
from app.schemas import ChatRequest
from app.services.ratelimit import limiter

router = APIRouter(tags=["chat"])


def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _sse(event: str, data: dict) -> bytes:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n".encode("utf-8")


@router.post("/chat")
async def chat(payload: ChatRequest, request: Request) -> StreamingResponse:
    if not limiter.allow(_client_ip(request)):
        raise HTTPException(status_code=429, detail="Too many requests")

    last_user = next(
        (m.content for m in reversed(payload.messages) if m.role == "user"),
        None,
    )
    if last_user is None:
        raise HTTPException(status_code=400, detail="No user message in payload")

    async with SessionLocal() as session:
        hits = await retrieve(session, last_user, k=6)

    system = build_system_prompt(hits)
    messages = [m.model_dump() for m in payload.messages]

    async def gen():
        try:
            async for evt in stream_chat(system=system, messages=messages):
                yield _sse(evt.kind, evt.data)
        except Exception as exc:
            yield _sse("error", {"message": str(exc)})
            yield _sse("done", {})

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

- [ ] **Step 3: Wire the router into `backend/app/main.py`**

Modify `backend/app/main.py`. Replace the `from app.routers import health` line and the `app.include_router(health.router)` line with:

```python
from app.routers import chat, health
...
    app.include_router(health.router)
    app.include_router(chat.router)
```

- [ ] **Step 4: Add an SSE smoke test with mocked Claude**

`backend/tests/test_chat.py`:
```python
from collections.abc import AsyncIterator
from unittest.mock import AsyncMock

import pytest

from app.rag.claude import StreamEvent


async def fake_stream(*, system, messages, max_tokens=1024) -> AsyncIterator[StreamEvent]:
    yield StreamEvent("text", {"delta": "hello "})
    yield StreamEvent("text", {"delta": "world"})
    yield StreamEvent("ctx", {"ctx": "general"})
    yield StreamEvent("done", {})


@pytest.mark.integration
async def test_chat_streams_sse(client, monkeypatch):
    monkeypatch.setattr("app.routers.chat.stream_chat", fake_stream)

    async with client.stream(
        "POST", "/chat", json={"messages": [{"role": "user", "content": "hi"}]}
    ) as resp:
        assert resp.status_code == 200
        body = b"".join([chunk async for chunk in resp.aiter_bytes()]).decode()

    assert "event: text" in body
    assert "hello " in body
    assert "world" in body
    assert "event: ctx" in body
    assert "event: done" in body
```

- [ ] **Step 5: Run the test**

```bash
cd backend && uv run pytest tests/test_chat.py -v -m integration
```
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/app/schemas.py backend/app/routers/chat.py backend/app/main.py backend/tests/test_chat.py
git commit -m "feat(backend): /chat SSE endpoint with retrieval + tool loop"
```

---

## Task 25: Phase 3 verification — curl `/chat` end-to-end

- [ ] **Step 1: Set live API keys in `.env`**

Edit `backend/.env`. Real values for `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `RESEND_API_KEY`. (Voyage and Resend offer free tiers; Anthropic console.)

- [ ] **Step 2: Start the dev server**

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
```

- [ ] **Step 3: Exercise the projects path**

In another terminal:
```bash
curl -N -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"show me your work"}]}' \
  http://localhost:8000/chat
```
Expected: SSE stream with `event: text` deltas, an `event: tool` with `surface_projects`, then `event: ctx` (`work`), then `event: done`.

- [ ] **Step 4: Exercise the contact path**

```bash
curl -N -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"can we set up a quick intro call?"}]}' \
  http://localhost:8000/chat
```
Expected: SSE stream surfaces a `schedule_call` tool event with the Calendly URL.

- [ ] **Step 5: Exercise the follow-up path**

```bash
curl -N -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"can the real Nicholas tell me more about his views on agent eval? My name is Test Visitor and email is test@example.com"}]}' \
  http://localhost:8000/chat
```
Expected: SSE stream with `event: tool` for `request_human_followup`. Verify Resend message landed in `OWNER_EMAIL` inbox. Verify a `followups` row was inserted.

- [ ] **Step 6: Stop the server and run the full backend test suite**

```bash
cd backend && uv run pytest -q
uv run ruff check .
```
Expected: green across both.

---

# Phase 4 — Frontend integration

## Task 26: `/api/chat` SSE proxy

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Implement the route**

```ts
export const runtime = "edge";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();

  const upstream = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(req.headers.get("x-forwarded-for")
        ? { "x-forwarded-for": req.headers.get("x-forwarded-for")! }
        : {}),
    },
    body,
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "x-accel-buffering": "no",
    },
  });
}
```

- [ ] **Step 2: Verify the route compiles**

```bash
npm run build
```
Expected: build completes; `/api/chat` listed in routes.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat(frontend): /api/chat edge proxy to backend SSE"
```

---

## Task 27: SSE client (`chat-client.ts`)

**Files:**
- Create: `src/lib/chat-client.ts`

- [ ] **Step 1: Implement the client**

```ts
export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatEvent =
  | { kind: "text"; delta: string }
  | { kind: "tool"; name: string; input: unknown; output: unknown }
  | { kind: "ctx"; ctx: "work" | "bio" | "contact" | "general" }
  | { kind: "error"; message: string }
  | { kind: "done" };

export async function* streamChat(
  messages: ChatTurn[],
  signal?: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok || !res.body) {
    yield { kind: "error", message: `HTTP ${res.status}` };
    yield { kind: "done" };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 2);

        const lines = block.split("\n");
        let event = "";
        let data = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) event = line.slice(7).trim();
          else if (line.startsWith("data: ")) data += line.slice(6);
        }
        if (!event) continue;

        let parsed: Record<string, unknown> = {};
        try {
          parsed = data ? (JSON.parse(data) as Record<string, unknown>) : {};
        } catch {
          continue;
        }

        if (event === "text") {
          yield { kind: "text", delta: String(parsed.delta ?? "") };
        } else if (event === "tool") {
          yield {
            kind: "tool",
            name: String(parsed.name),
            input: parsed.input,
            output: parsed.output,
          };
        } else if (event === "ctx") {
          const ctx = String(parsed.ctx) as "work" | "bio" | "contact" | "general";
          yield { kind: "ctx", ctx };
        } else if (event === "error") {
          yield { kind: "error", message: String(parsed.message ?? "unknown error") };
        } else if (event === "done") {
          yield { kind: "done" };
          return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/chat-client.ts
git commit -m "feat(frontend): SSE consumer for /api/chat"
```

---

## Task 28: Tool render panels

**Files:**
- Create: `src/components/portfolio/EmailDraftPanel.tsx`
- Create: `src/components/portfolio/ScheduleCallPanel.tsx`
- Create: `src/components/portfolio/FollowUpConfirmationPanel.tsx`

- [ ] **Step 1: Implement `EmailDraftPanel.tsx`**

```tsx
"use client";

import React, { useState } from "react";

export type EmailDraftOutput = {
  subject: string;
  body: string;
  to: string;
  mailto: string;
};

export function EmailDraftPanel({ output }: { output: EmailDraftOutput }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(`Subject: ${output.subject}\n\n${output.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        background: "var(--surface)",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 640,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
        }}
      >
        Draft email · to {output.to}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)" }}>
        {output.subject}
      </div>
      <pre
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--ink)",
          background: "var(--bg)",
          padding: "10px 12px",
          margin: 0,
          whiteSpace: "pre-wrap",
          border: "1px solid var(--line)",
        }}
      >
        {output.body}
      </pre>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onCopy}
          style={{
            appearance: "none",
            border: "1px solid var(--line)",
            background: "transparent",
            padding: "6px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "var(--ink)",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <a
          href={output.mailto}
          style={{
            appearance: "none",
            border: "1px solid var(--ink)",
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "6px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          ↗ Open in Mail
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `ScheduleCallPanel.tsx`**

```tsx
"use client";

import React from "react";

export type ScheduleCallOutput = { url: string; label: string };

export function ScheduleCallPanel({ output }: { output: ScheduleCallOutput }) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        background: "var(--surface)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        maxWidth: 480,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
        }}
      >
        Calendly · 30 min
      </div>
      <a
        href={output.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          appearance: "none",
          border: "1px solid var(--ink)",
          background: "var(--ink)",
          color: "var(--bg)",
          padding: "6px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        ↗ {output.label}
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Implement `FollowUpConfirmationPanel.tsx`**

```tsx
"use client";

import React from "react";

export type FollowUpConfirmationOutput = { ok: boolean; id: number };

export function FollowUpConfirmationPanel({ output }: { output: FollowUpConfirmationOutput }) {
  return (
    <div
      style={{
        border: "1px dashed var(--line)",
        background: "var(--subtle)",
        padding: "12px 14px",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        color: "var(--ink)",
        maxWidth: 480,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          marginRight: 8,
        }}
      >
        Relayed · #{output.id.toString().padStart(4, "0")}
      </span>
      Passed this to Nicholas — he&apos;ll get back to you.
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/EmailDraftPanel.tsx src/components/portfolio/ScheduleCallPanel.tsx src/components/portfolio/FollowUpConfirmationPanel.tsx
git commit -m "feat(frontend): tool render panels (email, schedule, follow-up)"
```

---

## Task 29: Update `Message` to render tool panels

**Files:**
- Modify: `src/components/portfolio/Message.tsx`

- [ ] **Step 1: Add a tool-event type to the message**

In `src/components/portfolio/Message.tsx`, replace the `Msg` type and the cards block:

```tsx
import { EmailDraftPanel, type EmailDraftOutput } from "./EmailDraftPanel";
import { ScheduleCallPanel, type ScheduleCallOutput } from "./ScheduleCallPanel";
import {
  FollowUpConfirmationPanel,
  type FollowUpConfirmationOutput,
} from "./FollowUpConfirmationPanel";

export type ToolEvent =
  | { name: "surface_projects"; output: { ok: boolean; ids: string[] } }
  | { name: "draft_intro_email"; output: EmailDraftOutput }
  | { name: "schedule_call"; output: ScheduleCallOutput }
  | { name: "request_human_followup"; output: FollowUpConfirmationOutput };

export type Msg = {
  role: "user" | "assistant";
  content: string;
  t: string;
  streaming?: boolean;
  tools?: ToolEvent[];
  ctx?: import("@/lib/parse-reply").Ctx;
};
```

Replace the existing case-card render block:

```tsx
{(msg.tools?.length ?? 0) > 0 && !msg.streaming && (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", marginTop: 4 }}>
    {msg.tools?.map((t, i) => {
      if (t.name === "surface_projects") {
        const cards = (t.output.ids || [])
          .map((id) => ABOUT.caseStudies.find((c) => c.id === id))
          .filter((c): c is NonNullable<typeof c> => Boolean(c));
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns:
                cards.length === 1 ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
              width: "min(720px, 100%)",
            }}
          >
            {cards.map((c) => (
              <CaseCard key={c.id} data={c} accent={accent} />
            ))}
          </div>
        );
      }
      if (t.name === "draft_intro_email") return <EmailDraftPanel key={i} output={t.output} />;
      if (t.name === "schedule_call") return <ScheduleCallPanel key={i} output={t.output} />;
      if (t.name === "request_human_followup")
        return <FollowUpConfirmationPanel key={i} output={t.output} />;
      return null;
    })}
  </div>
)}
```

Delete the old `cards` block (lines that read `msg.cards`).

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/Message.tsx
git commit -m "feat(frontend): Message renders tool panels via msg.tools[]"
```

---

## Task 30: Wire `ConversationalPortfolio` to `streamChat`

**Files:**
- Modify: `src/components/portfolio/ConversationalPortfolio.tsx`

- [ ] **Step 1: Replace the import block**

Replace `import { stubReply, type ChatTurn } from "@/lib/stub-reply";` with:
```tsx
import { streamChat, type ChatEvent, type ChatTurn } from "@/lib/chat-client";
```

Update `import { ... } from "@/lib/parse-reply";` to drop `parseReply` and `streamInto`:
```tsx
import {
  decodeTranscript,
  encodeTranscript,
  nowStamp,
  suggestionsFor,
  type Ctx,
} from "@/lib/parse-reply";
```

Update `Message` import to use the new exports:
```tsx
import { Message, type Msg, type ToolEvent } from "./Message";
```

- [ ] **Step 2: Replace the `send()` callback body**

Replace the entire `send` callback (the `useCallback` returning `async (text, opts)`) with:

```tsx
const send = useCallback(
  async (text: string, opts: { regenerate?: boolean } = {}) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setHistoryIdx(-1);

    let baseMessages: Msg[];
    if (opts.regenerate) {
      baseMessages = messages.slice();
      while (
        baseMessages.length &&
        baseMessages[baseMessages.length - 1].role === "assistant"
      ) {
        baseMessages.pop();
      }
    } else {
      baseMessages = [
        ...messages,
        { role: "user" as const, content: trimmed, t: nowStamp() },
      ];
    }

    const placeholder: Msg = {
      role: "assistant",
      content: "",
      t: nowStamp(),
      streaming: true,
      tools: [],
    };
    setMessages([...baseMessages, placeholder]);
    if (!opts.regenerate) setInput("");
    setBusy(true);

    const history: ChatTurn[] = baseMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const updateLast = (mut: (last: Msg) => Msg) => {
      setMessages((m) => {
        const copy = m.slice();
        const last = copy[copy.length - 1];
        if (last && last.streaming) copy[copy.length - 1] = mut(last);
        return copy;
      });
    };

    try {
      for await (const evt of streamChat(history)) {
        if (evt.kind === "text") {
          updateLast((last) => ({ ...last, content: last.content + evt.delta }));
        } else if (evt.kind === "tool") {
          updateLast((last) => ({
            ...last,
            tools: [...(last.tools ?? []), { name: evt.name, output: evt.output } as ToolEvent],
          }));
        } else if (evt.kind === "ctx") {
          updateLast((last) => ({ ...last, ctx: evt.ctx as Ctx }));
        } else if (evt.kind === "error") {
          updateLast((last) => ({
            ...last,
            content:
              last.content ||
              "The chat hit a snag. You can still email me at " + ABOUT.email + ".",
            streaming: false,
            ctx: "contact",
          }));
        } else if (evt.kind === "done") {
          updateLast((last) => ({ ...last, streaming: false }));
        }
      }
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  },
  [messages, busy],
);
```

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
npm run build
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/portfolio/ConversationalPortfolio.tsx
git commit -m "feat(frontend): ConversationalPortfolio uses streamChat + tool events"
```

---

## Task 31: Delete the stub and clean `parse-reply`

**Files:**
- Delete: `src/lib/stub-reply.ts`
- Delete: `src/lib/system-prompt.ts`
- Modify: `src/lib/parse-reply.ts`

- [ ] **Step 1: Delete the stub files**

```bash
rm src/lib/stub-reply.ts src/lib/system-prompt.ts
```

- [ ] **Step 2: Replace `src/lib/parse-reply.ts` with the trimmed version**

Overwrite the file with this exact contents:
```ts
export type Suggestion = { label: string; text: string };

export const SUGG_INTRO: Suggestion[] = [
  { label: "What do you do?", text: "What do you do, and what kind of work are you looking for?" },
  { label: "Walk me through your background", text: "Walk me through your background — research, PwC, and your current role." },
  { label: "Show me your work", text: "Show me a few representative projects." },
  { label: "What are you reading right now?", text: "What are you reading or building right now?" },
  { label: "How do I reach you?", text: "How do I get in touch with you, and where's your resume?" },
];

export const SUGG_AFTER_WORK: Suggestion[] = [
  { label: "What was hardest?", text: "What was the hardest part of that project?" },
  { label: "Show me another", text: "Show me a different project." },
  { label: "Stack & tradeoffs", text: "What was the stack and what tradeoffs did you make?" },
  { label: "Outcome details", text: "Can you say more about the actual measured outcomes?" },
];

export const SUGG_AFTER_BIO: Suggestion[] = [
  { label: "What kind of role next?", text: "What kind of role are you looking for next?" },
  { label: "Show me your work", text: "Show me a few representative projects." },
  { label: "Why private equity?", text: "Why are you doing this work in private equity specifically?" },
];

export const SUGG_AFTER_CONTACT: Suggestion[] = [
  { label: "Send a quick intro", text: "Draft a short intro email I could send you." },
  { label: "Show me your work first", text: "Before that — show me your work." },
];

export type Ctx = "work" | "bio" | "contact" | "general";

export function suggestionsFor(ctx: Ctx | string): Suggestion[] {
  if (ctx === "work") return SUGG_AFTER_WORK;
  if (ctx === "bio") return SUGG_AFTER_BIO;
  if (ctx === "contact") return SUGG_AFTER_CONTACT;
  return SUGG_INTRO;
}

export type SlimMessage = {
  role: "user" | "assistant";
  content: string;
  cards?: string[];
  ctx?: Ctx;
  t: string;
};

export function encodeTranscript(
  messages: { role: string; content: string; streaming?: boolean; cards?: string[]; ctx?: Ctx }[],
): string {
  const slim = messages
    .filter((m) => !m.streaming && m.content)
    .map((m) => ({ r: m.role[0], c: m.content, x: m.cards || [], k: m.ctx }));
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(slim))));
  } catch {
    return "";
  }
}

export function decodeTranscript(hash: string): SlimMessage[] | null {
  try {
    const raw = decodeURIComponent(escape(atob(hash)));
    const arr = JSON.parse(raw);
    return arr.map((m: { r: string; c: string; x?: string[]; k?: Ctx }) => ({
      role: m.r === "u" ? "user" : "assistant",
      content: m.c,
      cards: m.x || [],
      ctx: m.k,
      t: "",
    }));
  } catch {
    return null;
  }
}

export function nowStamp(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}
```

Note: `SlimMessage.cards` and `encodeTranscript` keep the `cards` field for share-link backwards-compat. The decoder still emits `cards: []`, but rehydrated transcripts will simply have empty `tools`. That's acceptable for v1; old shared links continue to display text-only.

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
npm run build
```
Expected: clean. Any errors will point to lingering imports — fix them.

- [ ] **Step 4: Commit**

```bash
git rm src/lib/stub-reply.ts src/lib/system-prompt.ts
git add src/lib/parse-reply.ts
git commit -m "chore(frontend): remove stub-reply and directive parsing (replaced by SSE)"
```

---

## Task 32: Phase 4 verification — frontend ↔ backend works end-to-end

- [ ] **Step 1: Start backend**

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000 &
```

- [ ] **Step 2: Start frontend with backend URL**

In another terminal at the repo root:
```bash
BACKEND_URL=http://localhost:8000 npm run dev
```

- [ ] **Step 3: Manual test in browser**

Open `http://localhost:3000`. Verify each:
- Type "show me your work" — text streams; case cards render once `surface_projects` fires.
- Type "can we set up a quick intro call?" — Calendly button panel appears.
- Type "I'd like to chat about an open Forward Deployed role at my company. My name is Test, my email is test@example.com" — the bot drafts an email; an `EmailDraftPanel` appears with `Copy` + `Open in Mail` buttons.
- Type "what's Nicholas's favourite Italian dish? My name is Pat, contact is pat@example.com" — `request_human_followup` fires; confirmation panel appears; check inbox + DB.

- [ ] **Step 4: Stop both servers**

```bash
kill %1
```

---

# Phase 5 — Easter eggs

## Task 33: Slash commands

**Files:**
- Create: `src/lib/slash-commands.ts`
- Modify: `src/components/portfolio/ConversationalPortfolio.tsx`

- [ ] **Step 1: Create `src/lib/slash-commands.ts`**

```ts
import { ABOUT } from "@/lib/about";
import type { Ctx } from "@/lib/parse-reply";

export type SlashResult = {
  reply: string;
  ctx?: Ctx;
  sideEffect?: () => void;
};

const KOANS = [
  "An eval that everyone passes is not an eval.",
  "The model gets the credit; the data gets the work.",
  "Most fine-tuning is a wish that data cleaning had been finished.",
  "If retrieval misses, no amount of prompting will save you.",
  "A fast wrong answer is worse than a slow right one — and harder to debug.",
];

const TEAS = [
  "Most 'AI products' are still UI problems wearing a model costume.",
  "Cleaner features beat fancier models, almost always.",
  "Auth done right at the start saves weeks later.",
  "If the layers aren't clean, the dashboards lie.",
  "The deploy is half the project.",
];

function pick<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

export const SLASH_COMMANDS: Record<string, () => SlashResult> = {
  "/whoami": () => ({
    reply: `${ABOUT.name} — ${ABOUT.role}, ${ABOUT.industry}.\nemail: ${ABOUT.email}`,
    ctx: "bio",
  }),
  "/sudo": () => ({
    reply:
      "permission elevated for 1 turn — fine, the unfiltered version: " +
      pick(TEAS),
    ctx: "general",
  }),
  "/tea": () => ({ reply: pick(TEAS), ctx: "general" }),
  "/koan": () => ({ reply: pick(KOANS), ctx: "general" }),
  "/cv": () => ({
    reply: "Opening resume…",
    ctx: "contact",
    sideEffect: () => {
      if (ABOUT.resumeUrl && ABOUT.resumeUrl !== "#") {
        window.open(ABOUT.resumeUrl, "_blank", "noopener,noreferrer");
      }
    },
  }),
  "/help": () => ({
    reply:
      "Hidden commands: /whoami /sudo /tea /koan /cv /help. Or just talk normally.",
    ctx: "general",
  }),
};

export function runSlashCommand(input: string): SlashResult | null {
  const cmd = input.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? "";
  const handler = SLASH_COMMANDS[cmd];
  return handler ? handler() : null;
}
```

- [ ] **Step 2: Intercept slash commands in `send()`**

In `ConversationalPortfolio.tsx`, at the very top of the `send` callback (right after the `setHistoryIdx(-1)` line, before `baseMessages` is built), add:

```tsx
const slash = trimmed.startsWith("/") ? runSlashCommand(trimmed) : null;
if (slash && !opts.regenerate) {
  const userMsg: Msg = { role: "user", content: trimmed, t: nowStamp() };
  const replyMsg: Msg = {
    role: "assistant",
    content: slash.reply,
    t: nowStamp(),
    ctx: slash.ctx,
  };
  setMessages((m) => [...m, userMsg, replyMsg]);
  setInput("");
  slash.sideEffect?.();
  return;
}
```

Add the import at the top of the file:
```tsx
import { runSlashCommand } from "@/lib/slash-commands";
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Verify in browser**

Restart `npm run dev`. Type `/help` in the composer; expect an instant assistant reply listing commands. DevTools Network tab should show **no** `/api/chat` request.

- [ ] **Step 5: Commit**

```bash
git add src/lib/slash-commands.ts src/components/portfolio/ConversationalPortfolio.tsx
git commit -m "feat(frontend): client-side slash commands (whoami, sudo, tea, koan, cv, help)"
```

---

## Task 34: AFK nudger

**Files:**
- Create: `src/components/portfolio/AfkNudger.tsx`
- Modify: `src/components/portfolio/ConversationalPortfolio.tsx`

- [ ] **Step 1: Create `AfkNudger.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { suggestionsFor, type Ctx } from "@/lib/parse-reply";

const IDLE_MS = 60_000;

export function AfkNudger({
  inputRef,
  ctx,
  enabled,
  onConsume,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  ctx: Ctx;
  enabled: boolean;
  onConsume: () => void;
}) {
  const timer = useRef<number | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (!enabled || ranOnce.current) return;

    const reset = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(fire, IDLE_MS);
    };

    const fire = () => {
      if (ranOnce.current) return;
      const el = inputRef.current;
      if (!el || document.activeElement === el || el.value) return;
      const suggestions = suggestionsFor(ctx);
      const hint = suggestions[0]?.text;
      if (!hint) return;
      ranOnce.current = true;
      onConsume();
      typeAndFade(el, hint);
    };

    window.addEventListener("keydown", reset);
    window.addEventListener("pointerdown", reset);
    reset();

    return () => {
      window.removeEventListener("keydown", reset);
      window.removeEventListener("pointerdown", reset);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [enabled, ctx, inputRef, onConsume]);

  return null;
}

function typeAndFade(el: HTMLTextAreaElement, text: string) {
  const original = el.placeholder;
  let i = 0;
  el.placeholder = "";
  el.style.transition = "opacity 0.6s";
  const tick = () => {
    if (document.activeElement === el || el.value) {
      el.placeholder = original;
      return;
    }
    if (i <= text.length) {
      el.placeholder = text.slice(0, i);
      i++;
      window.setTimeout(tick, 28);
      return;
    }
    window.setTimeout(() => {
      el.style.opacity = "0.6";
      window.setTimeout(() => {
        el.placeholder = original;
        el.style.opacity = "1";
      }, 1800);
    }, 1200);
  };
  tick();
}
```

- [ ] **Step 2: Mount it in `ConversationalPortfolio`**

In `ConversationalPortfolio.tsx`, import and mount the component near `<TweaksPanel />` at the bottom:

```tsx
import { AfkNudger } from "./AfkNudger";
...
<AfkNudger
  inputRef={inputRef}
  ctx={lastCtx}
  enabled={!busy}
  onConsume={() => {}}
/>
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Verify**

`npm run dev`. Open the page, do not interact for 60s with the textarea unfocused. Expected: a typed-out suggestion appears in the placeholder, holds for ~1.2s, then fades and reverts to the original placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/AfkNudger.tsx src/components/portfolio/ConversationalPortfolio.tsx
git commit -m "feat(frontend): AFK nudger — ghost-typed suggestion in idle placeholder"
```

---

# Phase 6 — Deployment

## Task 35: Backend Dockerfile

**Files:**
- Create: `backend/Dockerfile`
- Create: `backend/.dockerignore`

- [ ] **Step 1: Create `backend/Dockerfile`**

```dockerfile
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
RUN pip install -e .

COPY app ./app
COPY alembic.ini ./alembic.ini
COPY alembic ./alembic
COPY corpus ./corpus

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 2: Create `backend/.dockerignore`**

```
.venv
__pycache__
*.pyc
.pytest_cache
.ruff_cache
tests
.env
.env.local
.git
```

- [ ] **Step 3: Build the image locally and smoke test**

```bash
cd backend
docker build -t portfolio-backend:dev .
docker run --rm --env-file .env -p 8000:8000 portfolio-backend:dev &
sleep 3
curl -s http://localhost:8000/health
docker ps -q | head -1 | xargs docker stop
```
Expected: `{"status":"ok"}` from the curl. (Ingest/migrations are run by Render's release command, not at container start, so the image only needs to boot the API.)

- [ ] **Step 4: Commit**

```bash
git add backend/Dockerfile backend/.dockerignore
git commit -m "feat(backend): Dockerfile for production deploy"
```

---

## Task 36: Render service definition

**Files:**
- Create: `backend/render.yaml`

- [ ] **Step 1: Create `backend/render.yaml`**

```yaml
services:
  - type: web
    name: portfolio-backend
    runtime: docker
    repo: # set in Render UI
    rootDir: backend
    plan: free
    healthCheckPath: /health
    envVars:
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: VOYAGE_API_KEY
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: OWNER_EMAIL
        value: nicholask39@gmail.com
      - key: CALENDLY_URL
        value: https://calendly.com/nicholask39/30min
      - key: CLAUDE_MODEL
        value: claude-sonnet-4-6
      - key: RATE_LIMIT_PER_MIN
        value: "30"
      - key: FRONTEND_ORIGIN
        sync: false # set to https://<vercel-domain>
      - key: DATABASE_URL
        fromDatabase:
          name: portfolio-db
          property: connectionString
    preDeployCommand: alembic upgrade head && python -m app.ingest

databases:
  - name: portfolio-db
    plan: free
    postgresMajorVersion: 16
```

- [ ] **Step 2: Commit**

```bash
git add backend/render.yaml
git commit -m "chore(backend): Render service + database definition"
```

---

## Task 37: Deploy backend to Render

- [ ] **Step 1: Create new Blueprint from repo**

In Render dashboard: New → Blueprint → connect this repo → choose `backend/render.yaml`.

- [ ] **Step 2: Set the secret env vars**

`ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `RESEND_API_KEY`, `FRONTEND_ORIGIN` (will get the Vercel URL after Task 39 — set placeholder to `https://example.com` for now and update later).

- [ ] **Step 3: Deploy**

Click "Apply Blueprint". Wait for both services to come up green. The pre-deploy command runs `alembic upgrade head && python -m app.ingest`, so the database starts populated.

- [ ] **Step 4: Smoke-test the live backend**

```bash
curl -s https://<your-render-host>/health
curl -N -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"show me your work"}]}' \
  https://<your-render-host>/chat
```
Expected: `{"status":"ok"}` and a streaming SSE response respectively.

---

## Task 38: Configure Vercel and deploy frontend

- [ ] **Step 1: Add the env var on Vercel**

In Vercel dashboard, project → Settings → Environment Variables. Add `BACKEND_URL=https://<your-render-host>` for Production, Preview, Development.

- [ ] **Step 2: Trigger a deploy**

```bash
git push
```

- [ ] **Step 3: Smoke-test the live frontend**

Open `https://<vercel-domain>`. Manually exercise:
- "show me your work" → cards render
- "set up a call" → Calendly button
- A `/whoami` slash command → instant offline reply
- AFK 60s on first load → ghost-typed placeholder appears

- [ ] **Step 4: Update `FRONTEND_ORIGIN` on Render**

In Render dashboard, set `FRONTEND_ORIGIN` to the Vercel domain (e.g. `https://nicholasklos.vercel.app`). Redeploy backend so CORS picks up the change. Re-test from the live frontend.

---

## Task 39: Final repo polish

- [ ] **Step 1: Update root `README.md`**

Append a "Backend" section to the top-level `README.md` covering: the link to `backend/README.md`, the local-dev command, and a one-line architecture summary.

- [ ] **Step 2: Add a single CI sanity check** (optional in v1)

Skip if not setting up CI now. Otherwise add a minimal `.github/workflows/ci.yml` that runs `ruff check` and `pytest -m "not integration"` for backend, plus `npm run build` for frontend.

- [ ] **Step 3: Tag the release**

```bash
git tag -a v0.2.0-rag -m "Conversational portfolio v2: RAG backend, tools, easter eggs"
git push --tags
```

---

## Verification checklist (end-to-end)

- [ ] `docker compose up postgres` + `alembic upgrade head` on a fresh checkout
- [ ] `python -m app.ingest` populates 12+ documents and 30+ chunks; re-run is a no-op
- [ ] Backend `pytest -m "not integration"` green; integration tests green against local Postgres
- [ ] `curl /chat` streams text → tool → ctx → done across all three tool paths (work, schedule, follow-up)
- [ ] Resend email arrives within seconds of a `request_human_followup` call
- [ ] Frontend `npx tsc --noEmit` and `npm run build` clean
- [ ] Browser flow: cards, email panel, schedule panel, follow-up panel all render
- [ ] `/whoami` and AFK nudger work without network calls
- [ ] Live deploy on Render + Vercel reproduces local behaviour
