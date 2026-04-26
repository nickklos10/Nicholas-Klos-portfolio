import { ABOUT } from "./about";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const ALL_CARDS = ABOUT.caseStudies.map((c) => c.id);

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

function matches(s: string, words: string[]): boolean {
  const lower = s.toLowerCase();
  return words.some((w) => lower.includes(w));
}

export async function stubReply(history: ChatTurn[]): Promise<string> {
  const last = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const q = last.toLowerCase();

  await new Promise((r) => setTimeout(r, 350 + Math.random() * 350));

  if (
    matches(q, [
      "work",
      "project",
      "show me",
      "case",
      "build",
      "built",
      "ship",
      "made",
      "portfolio",
    ])
  ) {
    if (matches(q, ["another", "different", "more", "next"])) {
      const rotated = ALL_CARDS.slice(3).concat(ALL_CARDS.slice(0, 3));
      const ids = pick(rotated, 3).join(", ");
      return `A few more, in case the first set wasn't the right shape.\n\n[[CARDS: ${ids}]]\n\n[[CTX: work]]`;
    }
    if (matches(q, ["hard", "hardest", "difficult", "tradeoff", "stack"])) {
      return `The hardest parts were rarely the model itself — the slow grind was the data plumbing and getting evaluations honest enough to trust. On the F1 RAG project, retrieval quality was the whole game; on the crack detector, the deploy pipeline ate more time than the model. I'll always trade a fancier model for a cleaner pipeline.\n\n[[CARDS: f1gpt, concrete-crack]]\n\n[[CTX: work]]`;
    }
    const ids = pick(ALL_CARDS, 3).join(", ");
    return `Here are a few things I've shipped recently. Each card has a one-line lesson and links to the repo (and the live site, where there is one).\n\n[[CARDS: ${ids}]]\n\n[[CTX: work]]`;
  }

  if (
    matches(q, [
      "background",
      "experience",
      "research",
      "pwc",
      "solar",
      "fsec",
      "career",
      "story",
      "history",
      "about you",
      "who are you",
      "bio",
    ])
  ) {
    return `${ABOUT.summary}\n\nMy first ML work was at the Florida Solar Energy Center — statistical analysis and forecasting on solar panel performance. After that I spent a summer at PwC building Spark pipelines and Foundry models for a major Italian bank. Now I'm a Forward Deployed Engineer at New Private Equity, embedded with deal teams and building diligence + monitoring tooling on top of LLMs.\n\n[[CTX: bio]]`;
  }

  if (
    matches(q, [
      "email",
      "contact",
      "reach",
      "linkedin",
      "twitter",
      "x.com",
      "get in touch",
      "resume",
      "hire",
      "role",
      "job",
    ])
  ) {
    return `The fastest way to reach me is email — ${ABOUT.email}. I'm also on LinkedIn (${ABOUT.linkedin}) and X (${ABOUT.twitter}). If you want a quick sense of what I work on, the suggestion pills can show you a few projects first.\n\n[[CTX: contact]]`;
  }

  if (
    matches(q, [
      "current",
      "now",
      "reading",
      "today",
      "this week",
      "lately",
      "what are you doing",
      "what are you up to",
    ])
  ) {
    return `${ABOUT.currently}\n\n[[CTX: general]]`;
  }

  if (matches(q, ["why", "private equity", "pe"])) {
    return `Private equity is one of the few places where a small engineering team can have a disproportionate effect on real-world outcomes. The firm sees hundreds of deals a year — every diligence cycle is a fresh, finite, well-defined data problem. That tempo is fun, and the leverage is real.\n\n[[CTX: bio]]`;
  }

  return `I can talk about my work, my background (research, PwC, current role), or how to reach me. Pick one of the suggestions on the left, or just ask. If there's something only the real Nicholas can answer, I'll say so and point you to email.\n\n[[CTX: general]]`;
}
