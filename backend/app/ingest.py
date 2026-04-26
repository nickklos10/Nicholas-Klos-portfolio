"""Walk corpus/, chunk, embed, upsert documents+chunks. Idempotent on content_hash."""
import argparse
import asyncio
import hashlib
from pathlib import Path

import frontmatter
from sqlalchemy import func, select

from app.db import SessionLocal
from app.models import Chunk, Document
from app.rag.chunker import chunk_markdown
from app.rag.embed import embed_batch


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _kind_from_path(path: Path) -> str:
    parts = path.parts
    for kind in ("bio", "projects", "opinions"):
        if kind in parts:
            return kind.rstrip("s")  # 'projects' -> 'project'
    return "other"


async def ingest_file(path: Path, root: Path) -> tuple[str, int]:
    """Returns (action, chunk_count). action ∈ {'skipped','upserted'}."""
    post = frontmatter.load(path)
    body_md = post.content.strip()
    if not body_md:
        return ("skipped", 0)

    h = _hash(body_md)
    rel = str(path.relative_to(root))
    slug = post.get("slug") or path.stem
    title = post.get("title") or slug.replace("-", " ").title()
    kind = post.get("kind") or _kind_from_path(path)

    async with SessionLocal() as session:
        existing = await session.scalar(select(Document).where(Document.slug == slug))
        if existing and existing.content_hash == h:
            # Avoid lazy-loading existing.chunks in an async session; query directly.
            count = await session.scalar(
                select(func.count()).where(Chunk.document_id == existing.id)
            )
            return ("skipped", count or 0)

        if existing:
            await session.delete(existing)
            await session.flush()

        doc = Document(
            slug=slug,
            title=title,
            kind=kind,
            source_path=rel,
            body_md=body_md,
            content_hash=h,
        )
        session.add(doc)
        await session.flush()

        chunks = chunk_markdown(body_md, target_tokens=500, overlap_tokens=80)
        if not chunks:
            await session.commit()
            return ("upserted", 0)

        vectors = await embed_batch([c.text for c in chunks], input_type="document")
        for ch, vec in zip(chunks, vectors, strict=True):
            session.add(
                Chunk(
                    document_id=doc.id,
                    ord=ch.ord,
                    text=ch.text,
                    embedding=vec,
                    tokens=ch.tokens,
                )
            )
        await session.commit()
        return ("upserted", len(chunks))


async def ingest_directory(root: Path) -> None:
    md_files = sorted(p for p in root.rglob("*.md") if p.is_file())
    if not md_files:
        print(f"[ingest] no .md files under {root}")
        return
    total = 0
    for p in md_files:
        action, n = await ingest_file(p, root)
        print(f"[ingest] {action:8s} {p.relative_to(root)}  chunks={n}")
        total += n
    print(f"[ingest] done: {len(md_files)} files, {total} chunks")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--path", type=Path, default=Path(__file__).resolve().parent.parent / "corpus"
    )
    args = parser.parse_args()
    asyncio.run(ingest_directory(args.path))


if __name__ == "__main__":
    main()
