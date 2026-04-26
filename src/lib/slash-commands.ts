import { ABOUT } from "@/lib/about";
import type { Ctx } from "@/lib/parse-reply";

export type SlashResult = {
  reply: string;
  ctx?: Ctx;
  sideEffect?: () => void;
};

const KOANS = [
  "An eval that everyone passes is not an eval.",
  "The model gets the credit; the data gets the work.",
  "Most fine-tuning is a wish that data cleaning had been finished.",
  "If retrieval misses, no amount of prompting will save you.",
  "A fast wrong answer is worse than a slow right one — and harder to debug.",
];

const TEAS = [
  "Most 'AI products' are still UI problems wearing a model costume.",
  "Cleaner features beat fancier models, almost always.",
  "Auth done right at the start saves weeks later.",
  "If the layers aren't clean, the dashboards lie.",
  "The deploy is half the project.",
];

function pick<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

export const SLASH_COMMANDS: Record<string, () => SlashResult> = {
  "/whoami": () => ({
    reply: `${ABOUT.name} — ${ABOUT.role}, ${ABOUT.industry}.\nemail: ${ABOUT.email}`,
    ctx: "bio",
  }),
  "/sudo": () => ({
    reply:
      "permission elevated for 1 turn — fine, the unfiltered version: " + pick(TEAS),
    ctx: "general",
  }),
  "/tea": () => ({ reply: pick(TEAS), ctx: "general" }),
  "/koan": () => ({ reply: pick(KOANS), ctx: "general" }),
  "/cv": () => ({
    reply: "Opening resume…",
    ctx: "contact",
    sideEffect: () => {
      if (ABOUT.resumeUrl && ABOUT.resumeUrl !== "#") {
        window.open(ABOUT.resumeUrl, "_blank", "noopener,noreferrer");
      }
    },
  }),
  "/help": () => ({
    reply:
      "Hidden commands: /whoami /sudo /tea /koan /cv /help. Or just talk normally.",
    ctx: "general",
  }),
};

export function runSlashCommand(input: string): SlashResult | null {
  const cmd = input.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? "";
  const handler = SLASH_COMMANDS[cmd];
  return handler ? handler() : null;
}
