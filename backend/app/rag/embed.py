"""Voyage AI embeddings wrapper. voyage-3 -> 1024-dim vectors."""
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
            out.extend(
                await embed_batch(texts[i : i + 128], input_type=input_type, model=model)
            )
        return out

    result = await _client.embed(texts, model=model, input_type=input_type)
    return list(result.embeddings)


async def embed_one(text: str, *, model: str = "voyage-3") -> list[float]:
    out = await embed_batch([text], input_type="query", model=model)
    return out[0]
