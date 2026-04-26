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
