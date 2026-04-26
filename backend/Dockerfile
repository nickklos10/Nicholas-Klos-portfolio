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
# Run idempotent migrations + corpus ingest on every container start, then
# exec uvicorn so signals propagate cleanly. Both alembic and ingest no-op
# when there's nothing to do (alembic at head, content hashes match), so
# this is safe on cold-starts and adds <1s of overhead.
CMD ["sh", "-c", "alembic upgrade head && python -m app.ingest && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
