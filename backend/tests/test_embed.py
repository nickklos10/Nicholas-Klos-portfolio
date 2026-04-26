from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.rag.embed import EMBED_DIMS, embed_batch, embed_one


@pytest.fixture
def fake_openai(monkeypatch):
    fake = MagicMock()
    fake.embeddings = MagicMock()
    fake.embeddings.create = AsyncMock(
        return_value=SimpleNamespace(
            data=[
                SimpleNamespace(embedding=[0.1] * EMBED_DIMS),
                SimpleNamespace(embedding=[0.2] * EMBED_DIMS),
            ]
        )
    )
    monkeypatch.setattr("app.rag.embed._client", fake)
    return fake


async def test_embed_batch_returns_one_vector_per_input(fake_openai):
    out = await embed_batch(["one", "two"], input_type="document")
    assert len(out) == 2
    assert all(len(v) == EMBED_DIMS for v in out)
    fake_openai.embeddings.create.assert_awaited_once()


async def test_embed_batch_passes_dimensions_param(fake_openai):
    await embed_batch(["one", "two"], input_type="document")
    call = fake_openai.embeddings.create.await_args
    assert call.kwargs.get("dimensions") == EMBED_DIMS
    assert call.kwargs.get("model") == "text-embedding-3-small"


async def test_embed_one_returns_single_vector(fake_openai):
    fake_openai.embeddings.create.return_value = SimpleNamespace(
        data=[SimpleNamespace(embedding=[0.3] * EMBED_DIMS)]
    )
    out = await embed_one("hello world")
    assert len(out) == EMBED_DIMS
