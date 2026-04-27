"""POST /chat — retrieve, run Claude tool-use loop, stream SSE."""
import json

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.config import settings
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
    return f"event: {event}\ndata: {json.dumps(data)}\n\n".encode()


@router.post("/chat")
async def chat(payload: ChatRequest, request: Request) -> StreamingResponse:
    total_chars = sum(len(m.content) for m in payload.messages)
    if total_chars > settings.max_total_chars_per_request:
        raise HTTPException(status_code=413, detail="request_too_large")

    ok, reason = limiter.check(_client_ip(request))
    if not ok:
        raise HTTPException(status_code=429, detail=f"rate_limited: {reason}")

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
