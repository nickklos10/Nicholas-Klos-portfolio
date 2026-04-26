export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatEvent =
  | { kind: "text"; delta: string }
  | { kind: "tool"; name: string; input: unknown; output: unknown }
  | { kind: "ctx"; ctx: "work" | "bio" | "contact" | "general" }
  | { kind: "error"; message: string }
  | { kind: "done" };

export async function* streamChat(
  messages: ChatTurn[],
  signal?: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok || !res.body) {
    yield { kind: "error", message: `HTTP ${res.status}` };
    yield { kind: "done" };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 2);

        const lines = block.split("\n");
        let event = "";
        let data = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) event = line.slice(7).trim();
          else if (line.startsWith("data: ")) data += line.slice(6);
        }
        if (!event) continue;

        let parsed: Record<string, unknown> = {};
        try {
          parsed = data ? (JSON.parse(data) as Record<string, unknown>) : {};
        } catch {
          continue;
        }

        if (event === "text") {
          yield { kind: "text", delta: String(parsed.delta ?? "") };
        } else if (event === "tool") {
          yield {
            kind: "tool",
            name: String(parsed.name),
            input: parsed.input,
            output: parsed.output,
          };
        } else if (event === "ctx") {
          const ctx = String(parsed.ctx) as "work" | "bio" | "contact" | "general";
          yield { kind: "ctx", ctx };
        } else if (event === "error") {
          yield { kind: "error", message: String(parsed.message ?? "unknown error") };
        } else if (event === "done") {
          yield { kind: "done" };
          return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
