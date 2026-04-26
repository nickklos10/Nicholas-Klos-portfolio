"""OpenAI embeddings wrapper. text-embedding-3-small @ 1024 dims."""
from typing import Literal

from openai import AsyncOpenAI

from app.config import settings

_client = AsyncOpenAI(api_key=settings.openai_api_key)

InputType = Literal["document", "query"]

EMBED_MODEL = "text-embedding-3-small"
EMBED_DIMS = 1024


async def embed_batch(
    texts: list[str],
    *,
    input_type: InputType,  # kept in signature for API symmetry; OpenAI doesn't use it
    model: str = EMBED_MODEL,
) -> list[list[float]]:
    """Embed up to 2048 texts at a time (OpenAI's batch limit)."""
    if not texts:
        return []
    if len(texts) > 2048:
        out: list[list[float]] = []
        for i in range(0, len(texts), 2048):
            out.extend(
                await embed_batch(texts[i : i + 2048], input_type=input_type, model=model)
            )
        return out

    result = await _client.embeddings.create(
        input=texts,
        model=model,
        dimensions=EMBED_DIMS,
    )
    return [d.embedding for d in result.data]


async def embed_one(text: str, *, model: str = EMBED_MODEL) -> list[float]:
    out = await embed_batch([text], input_type="query", model=model)
    return out[0]
