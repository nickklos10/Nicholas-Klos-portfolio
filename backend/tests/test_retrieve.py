import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.rag.retrieve import retrieve


@pytest.fixture
async def db_session():
    """Fresh engine + session scoped to the current event loop."""
    engine = create_async_engine(settings.database_url, echo=False, future=True)
    factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.integration
async def test_retrieve_finds_relevant_doc(db_session):
    hits = await retrieve(db_session, "tell me about your F1 chatbot project", k=3)

    assert len(hits) >= 1
    slugs = [h.document_slug for h in hits]
    assert "f1gpt" in slugs, f"f1gpt should rank in top-3, got {slugs}"


@pytest.mark.integration
async def test_retrieve_handles_unrelated_query(db_session):
    hits = await retrieve(db_session, "marshmallow recipe banana", k=3)
    # Distances should be relatively high but the query still returns k results
    assert len(hits) == 3
