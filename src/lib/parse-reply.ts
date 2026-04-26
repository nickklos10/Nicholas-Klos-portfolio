export type Suggestion = { label: string; text: string };

export const SUGG_INTRO: Suggestion[] = [
  { label: "What do you do?", text: "What do you do, and what kind of work are you looking for?" },
  { label: "Walk me through your background", text: "Walk me through your background — research, PwC, and your current role." },
  { label: "Show me your work", text: "Show me a few representative projects." },
  { label: "What are you reading right now?", text: "What are you reading or building right now?" },
  { label: "How do I reach you?", text: "How do I get in touch with you, and where's your resume?" },
];

export const SUGG_AFTER_WORK: Suggestion[] = [
  { label: "What was hardest?", text: "What was the hardest part of that project?" },
  { label: "Show me another", text: "Show me a different project." },
  { label: "Stack & tradeoffs", text: "What was the stack and what tradeoffs did you make?" },
  { label: "Outcome details", text: "Can you say more about the actual measured outcomes?" },
];

export const SUGG_AFTER_BIO: Suggestion[] = [
  { label: "What kind of role next?", text: "What kind of role are you looking for next?" },
  { label: "Show me your work", text: "Show me a few representative projects." },
  { label: "Why private equity?", text: "Why are you doing this work in private equity specifically?" },
];

export const SUGG_AFTER_CONTACT: Suggestion[] = [
  { label: "Send a quick intro", text: "Draft a short intro email I could send you." },
  { label: "Show me your work first", text: "Before that — show me your work." },
];

export type Ctx = "work" | "bio" | "contact" | "general";

export function suggestionsFor(ctx: Ctx | string): Suggestion[] {
  if (ctx === "work") return SUGG_AFTER_WORK;
  if (ctx === "bio") return SUGG_AFTER_BIO;
  if (ctx === "contact") return SUGG_AFTER_CONTACT;
  return SUGG_INTRO;
}

export type SlimMessage = {
  role: "user" | "assistant";
  content: string;
  cards?: string[];
  ctx?: Ctx;
  t: string;
};

export function encodeTranscript(
  messages: { role: string; content: string; streaming?: boolean; cards?: string[]; ctx?: Ctx }[],
): string {
  const slim = messages
    .filter((m) => !m.streaming && m.content)
    .map((m) => ({ r: m.role[0], c: m.content, x: m.cards || [], k: m.ctx }));
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(slim))));
  } catch {
    return "";
  }
}

export function decodeTranscript(hash: string): SlimMessage[] | null {
  try {
    const raw = decodeURIComponent(escape(atob(hash)));
    const arr = JSON.parse(raw);
    return arr.map((m: { r: string; c: string; x?: string[]; k?: Ctx }) => ({
      role: m.r === "u" ? "user" : "assistant",
      content: m.c,
      cards: m.x || [],
      ctx: m.k,
      t: "",
    }));
  } catch {
    return null;
  }
}

export function nowStamp(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}
