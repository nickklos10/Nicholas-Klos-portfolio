from app.rag.chunker import Chunk, chunk_markdown


def test_short_doc_yields_single_chunk():
    body = "# Title\n\nA short paragraph that fits well below the budget."
    chunks = chunk_markdown(body, target_tokens=500, overlap_tokens=80)
    assert len(chunks) == 1
    assert chunks[0].text.startswith("# Title")
    assert chunks[0].ord == 0
    assert chunks[0].tokens > 0


def test_long_doc_splits_on_headings():
    body = (
        "# A\n\n" + ("alpha " * 400) + "\n\n"
        "## B\n\n" + ("beta " * 400) + "\n\n"
        "## C\n\n" + ("gamma " * 400)
    )
    chunks = chunk_markdown(body, target_tokens=500, overlap_tokens=80)
    assert len(chunks) >= 2
    assert all(isinstance(c, Chunk) for c in chunks)
    assert [c.ord for c in chunks] == list(range(len(chunks)))
    # Each chunk respects the budget within tolerance
    assert all(c.tokens <= 700 for c in chunks)


def test_overlap_repeats_some_text():
    body = ("word " * 1200)
    chunks = chunk_markdown(body, target_tokens=300, overlap_tokens=80)
    assert len(chunks) >= 2
    overlap_text = chunks[0].text[-200:]
    assert any(overlap_text[-40:] in c.text for c in chunks[1:])
