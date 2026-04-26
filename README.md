# Nicholas Klos — A Conversational Portfolio

A single-page, chat-first portfolio. The page _is_ the chat — no separate
About / Projects / Contact routes. Visitors ask questions and the assistant
surfaces case-study cards, bio, and contact info inline.

Built with Next.js 15, React 19, TypeScript, Tailwind v4. Currently wired to
a local keyword-based stub that follows the same `[[CARDS: …]] [[CTX: …]]`
directive contract a real Claude integration would use, so the UI behaves
end-to-end without an API key.

## Features

- Swiss-minimalist design: serif display + sans body + mono metadata
- Persistent hero, faked token-by-token streaming, regenerate button
- Context-aware follow-up suggestions (work / bio / contact / general)
- Theme toggle: Light / Cream / Ink (persists to `localStorage`)
- Share-via-URL-hash: copy a URL that rehydrates the conversation
- Keyboard: ⌘K focus, ↵ send, ⇧↵ newline, ↑/↓ recall history, 1–N starter prompts
- Mobile: under 880px the sidebar collapses to a compact header

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Editing the content

All user-facing copy lives in [`src/lib/about.ts`](src/lib/about.ts):

- `name`, `email`, social links, `currently`, `voice`
- `experience` entries
- `caseStudies` — each card has `id`, `title`, `tag`, `mark`
  (`"grid" | "wave" | "spark"`), `summary`, `stack`, `outcomes`, `lesson`,
  and optional `links: { github, live }`

The conversation logic is split between:

- [`src/lib/system-prompt.ts`](src/lib/system-prompt.ts) — the system prompt
  for the future real-Claude wiring
- [`src/lib/stub-reply.ts`](src/lib/stub-reply.ts) — the keyword-based fake
  used today; swap one call site in `ConversationalPortfolio.tsx` to use a
  real `/api/chat` route later
- [`src/lib/parse-reply.ts`](src/lib/parse-reply.ts) — `[[CARDS]]` / `[[CTX]]`
  parsing, suggestion sets, transcript encode/decode, fake streaming

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Google Fonts via `next/font`: Instrument Serif, Inter Tight, JetBrains Mono

## Deployment

Pushes to `main` deploy on [Vercel](https://vercel.com).

## License

MIT.
