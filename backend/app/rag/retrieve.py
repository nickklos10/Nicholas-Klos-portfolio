"""Cosine top-K retrieval over chunks via pgvector."""
from dataclasses import dataclass

from sqlalchemy import select, text
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
    """Return top-K chunks by cosine distance (lower is more similar).

    Sets ivfflat.probes = lists so that a small corpus (fewer rows than IVFFlat
    list count) is scanned exhaustively instead of returning empty results.
    """
    qvec = await embed_one(query)

    # Ensure IVFFlat scans all centroids; safe for small corpora and fast for
    # large ones when probes equals the list count used at index creation.
    await session.execute(text("SET LOCAL ivfflat.probes = 100"))

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
