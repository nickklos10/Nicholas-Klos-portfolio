---
title: F1GPT
slug: f1gpt
kind: project
tags: [rag, nextjs, openai, langchain]
---

A specialised Formula 1 chat application with retrieval-augmented generation
over scraped season + driver data. Asks like "who's leading the constructors'
standings?" work end-to-end — the model isn't just guessing, it's grounded in
data scraped from the season.

**Stack:** Next.js, OpenAI, LangChain, custom scraping, vector retrieval, TypeScript.

**Outcomes:**
- End-to-end RAG over a scraped F1 corpus.
- Streaming chat UI with cited sources.
- Deployed and live on Vercel.

**What was hard.** Every interesting bug was in retrieval. The model could
write a coherent paragraph from any chunks I gave it; the question was whether
those chunks were the right ones. Most of my time went into chunking strategy,
query rewriting, and the boring eval loop of "did the right chunk land in the
top three for this question?"

**Lesson:** most of the work in a RAG app is the retrieval, not the model.

Repo: https://github.com/nickklos10/f1-chat
Live: https://f1-chat-lilac.vercel.app/
