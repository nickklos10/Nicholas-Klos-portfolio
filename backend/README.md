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
