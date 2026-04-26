"""Markdown-heading-aware chunker with token budgets and overlap."""
import re
from dataclasses import dataclass

import tiktoken

ENC = tiktoken.get_encoding("cl100k_base")


@dataclass
class Chunk:
    ord: int
    text: str
    tokens: int


def _count(text: str) -> int:
    return len(ENC.encode(text))


_HEADING_RE = re.compile(r"^(#{1,6})\s+", re.MULTILINE)


def _split_on_headings(body: str) -> list[str]:
    """Split into segments where each segment starts at a heading (or the doc start)."""
    indices = [m.start() for m in _HEADING_RE.finditer(body)]
    if not indices or indices[0] != 0:
        indices = [0, *indices]
    indices.append(len(body))
    pairs = zip(indices, indices[1:], strict=False)
    return [body[a:b].strip() for a, b in pairs if body[a:b].strip()]


def chunk_markdown(body: str, target_tokens: int = 500, overlap_tokens: int = 80) -> list[Chunk]:
    """Split markdown into ~target_tokens chunks with overlap_tokens overlap.

    Heading-aware: prefers to break at top-level headings. If a single segment is
    larger than target_tokens, it gets word-window split with overlap.
    """
    segments = _split_on_headings(body)
    chunks: list[str] = []
    buf = ""

    for seg in segments:
        if _count(seg) > target_tokens:
            # flush current buf, then word-window split this oversized segment
            if buf.strip():
                chunks.append(buf.strip())
                buf = ""
            chunks.extend(_word_window_split(seg, target_tokens, overlap_tokens))
            continue

        candidate = (buf + "\n\n" + seg).strip() if buf else seg
        if _count(candidate) <= target_tokens:
            buf = candidate
        else:
            if buf:
                chunks.append(buf)
            buf = seg

    if buf.strip():
        chunks.append(buf.strip())

    return [Chunk(ord=i, text=t, tokens=_count(t)) for i, t in enumerate(chunks)]


def _word_window_split(text: str, target_tokens: int, overlap_tokens: int) -> list[str]:
    """Token-window split with overlap when no heading break is available."""
    tokens = ENC.encode(text)
    out: list[str] = []
    step = max(1, target_tokens - overlap_tokens)
    for start in range(0, len(tokens), step):
        window = tokens[start : start + target_tokens]
        if not window:
            break
        out.append(ENC.decode(window))
        if start + target_tokens >= len(tokens):
            break
    return out
