from collections.abc import AsyncIterator

import pytest

from app.rag.claude import StreamEvent
from app.rag.retrieve import Hit


async def fake_stream(*, system, messages, max_tokens=1024) -> AsyncIterator[StreamEvent]:
    yield StreamEvent("text", {"delta": "hello "})
    yield StreamEvent("text", {"delta": "world"})
    yield StreamEvent("ctx", {"ctx": "general"})
    yield StreamEvent("done", {})


async def fake_retrieve(session, query, k=6) -> list[Hit]:
    return []


@pytest.mark.integration
async def test_chat_streams_sse(client, monkeypatch):
    monkeypatch.setattr("app.routers.chat.stream_chat", fake_stream)
    monkeypatch.setattr("app.routers.chat.retrieve", fake_retrieve)

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
