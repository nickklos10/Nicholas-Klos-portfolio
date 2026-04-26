"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { ABOUT } from "@/lib/about";
import {
  decodeTranscript,
  encodeTranscript,
  nowStamp,
  suggestionsFor,
  type Ctx,
} from "@/lib/parse-reply";
import { streamChat, type ChatTurn } from "@/lib/chat-client";
import { runSlashCommand } from "@/lib/slash-commands";
import { Crosshair, Dot } from "./marks";
import { Message, type Msg, type ToolEvent } from "./Message";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { TweaksPanel, type Theme } from "./TweaksPanel";

const ACCENT = "#FF5B1F";

const THEMES: Record<
  Theme,
  {
    bg: string;
    surface: string;
    ink: string;
    inkSoft: string;
    line: string;
    subtle: string;
  }
> = {
  light: {
    bg: "#FAFAF7",
    surface: "#FFFFFF",
    ink: "#0E0E0C",
    inkSoft: "#605D55",
    line: "#E6E3DC",
    subtle: "#F2EFE8",
  },
  cream: {
    bg: "#F2EBDD",
    surface: "#FAF5E9",
    ink: "#1B1A14",
    inkSoft: "#6B6552",
    line: "#DDD3BD",
    subtle: "#E8DFCB",
  },
  ink: {
    bg: "#0C0C0A",
    surface: "#141412",
    ink: "#F4F1E8",
    inkSoft: "#9A968A",
    line: "#262521",
    subtle: "#1B1A17",
  },
};

function cssVars(theme: Theme): React.CSSProperties {
  const t = THEMES[theme];
  return {
    "--bg": t.bg,
    "--surface": t.surface,
    "--ink": t.ink,
    "--ink-soft": t.inkSoft,
    "--line": t.line,
    "--subtle": t.subtle,
    "--accent": ACCENT,
    "--font-display": "var(--font-instrument-serif), 'Times New Roman', serif",
    "--font-body": "var(--font-inter-tight), system-ui, sans-serif",
    "--font-mono": "var(--font-jetbrains-mono), ui-monospace, monospace",
  } as React.CSSProperties;
}

const STORAGE_KEY = "pf-theme";

function loadTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "cream" || v === "ink") return v;
  return "light";
}

export function ConversationalPortfolio() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    setTheme(loadTheme());
  }, []);
  const onTheme = useCallback((t: Theme) => {
    setTheme(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  }, []);

  // Keep <body> in sync with the theme so the page never flashes the wrong color
  useEffect(() => {
    const t = THEMES[theme];
    document.body.style.background = t.bg;
    document.body.style.color = t.ink;
  }, [theme]);

  const vars = cssVars(theme);

  // Deferred to useEffect to avoid SSR/client hydration mismatch
  const [sessionId, setSessionId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [headerStamp, setHeaderStamp] = useState("");

  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      role: "assistant",
      content: `Hi, I'm a chat interface speaking on behalf of ${ABOUT.name.split(" ")[0]}. Ask me anything about my work, my background, or how to get in touch. There are starter questions on the left, or just type below.`,
      t: "",
      ctx: "general",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    setSessionId(
      Math.random().toString(36).slice(2, 6).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 6).toUpperCase(),
    );
    const d = new Date();
    setStartedAt(d.toISOString().slice(0, 16).replace("T", " "));
    setHeaderStamp(nowStamp());

    // Hydrate transcript from URL hash if present
    if (window.location.hash.startsWith("#c=")) {
      const t = decodeTranscript(window.location.hash.slice(3));
      if (t && t.length) {
        setMessages(t as Msg[]);
        return;
      }
    }
    // Otherwise stamp the welcome message now that we're on the client
    setMessages((m) =>
      m.map((msg) => (msg.t ? msg : { ...msg, t: nowStamp() })),
    );
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const lastCtx = useMemo<Ctx>(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "assistant" && m.ctx) return m.ctx;
    }
    return "general";
  }, [messages]);
  const suggestions = suggestionsFor(lastCtx);
  const userHistory = useMemo(
    () => messages.filter((m) => m.role === "user").map((m) => m.content),
    [messages],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = useCallback(
    async (text: string, opts: { regenerate?: boolean } = {}) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setHistoryIdx(-1);

      const slash = trimmed.startsWith("/") ? runSlashCommand(trimmed) : null;
      if (slash && !opts.regenerate) {
        const userMsg: Msg = { role: "user", content: trimmed, t: nowStamp() };
        const replyMsg: Msg = {
          role: "assistant",
          content: slash.reply,
          t: nowStamp(),
          ctx: slash.ctx,
        };
        setMessages((m) => [...m, userMsg, replyMsg]);
        setInput("");
        slash.sideEffect?.();
        return;
      }

      let baseMessages: Msg[];
      if (opts.regenerate) {
        baseMessages = messages.slice();
        while (
          baseMessages.length &&
          baseMessages[baseMessages.length - 1].role === "assistant"
        ) {
          baseMessages.pop();
        }
      } else {
        baseMessages = [
          ...messages,
          { role: "user" as const, content: trimmed, t: nowStamp() },
        ];
      }

      const placeholder: Msg = {
        role: "assistant",
        content: "",
        t: nowStamp(),
        streaming: true,
        tools: [],
      };
      setMessages([...baseMessages, placeholder]);
      if (!opts.regenerate) setInput("");
      setBusy(true);

      const history: ChatTurn[] = baseMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const updateLast = (mut: (last: Msg) => Msg) => {
        setMessages((m) => {
          const copy = m.slice();
          const last = copy[copy.length - 1];
          if (last && last.streaming) copy[copy.length - 1] = mut(last);
          return copy;
        });
      };

      try {
        for await (const evt of streamChat(history)) {
          if (evt.kind === "text") {
            updateLast((last) => ({ ...last, content: last.content + evt.delta }));
          } else if (evt.kind === "tool") {
            updateLast((last) => ({
              ...last,
              tools: [
                ...(last.tools ?? []),
                { name: evt.name, output: evt.output } as ToolEvent,
              ],
            }));
          } else if (evt.kind === "ctx") {
            updateLast((last) => ({ ...last, ctx: evt.ctx as Ctx }));
          } else if (evt.kind === "error") {
            updateLast((last) => ({
              ...last,
              content:
                last.content ||
                "The chat hit a snag. You can still email me at " + ABOUT.email + ".",
              streaming: false,
              ctx: "contact",
            }));
          } else if (evt.kind === "done") {
            updateLast((last) => ({ ...last, streaming: false }));
          }
        }
      } catch {
        updateLast((last) => ({
          ...last,
          content:
            last.content ||
            "The chat hit a snag. You can still email me at " + ABOUT.email + ".",
          streaming: false,
          ctx: "contact",
        }));
      } finally {
        setBusy(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [messages, busy],
  );

  const regenerate = useCallback(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        send(messages[i].content, { regenerate: true });
        return;
      }
    }
  }, [messages, send]);

  const onShare = useCallback(async () => {
    const enc = encodeTranscript(messages);
    const url = `${location.origin}${location.pathname}#c=${enc}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 1800);
    } catch {
      window.history.replaceState(null, "", `#c=${enc}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 1800);
    }
  }, [messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
      return;
    }
    if (e.key === "ArrowUp" && input === "" && userHistory.length) {
      e.preventDefault();
      const next =
        historyIdx < 0 ? userHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setInput(userHistory[next] || "");
      return;
    }
    if (e.key === "ArrowDown" && historyIdx >= 0) {
      e.preventDefault();
      const next = historyIdx + 1;
      if (next >= userHistory.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(next);
        setInput(userHistory[next]);
      }
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (document.activeElement === inputRef.current) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= suggestions.length) {
        e.preventDefault();
        send(suggestions[n - 1].text);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [suggestions, send]);

  const isDark = theme === "ink";
  const hasConversation = messages.length > 1 || messages[0]?.role === "user";

  return (
    <div
      style={{
        ...vars,
        background: "var(--bg)",
        color: "var(--ink)",
        minHeight: "100vh",
        display: "flex",
        fontFamily: "var(--font-body)",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes pf-blink { 50% { opacity: 0; } }
        @keyframes pf-cursor { 50% { opacity: 0.2; } }
        @keyframes pf-fadeUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        ::selection { background: var(--accent); color: ${isDark ? "#0C0C0A" : "#fff"}; }
        textarea::placeholder { color: var(--ink-soft); opacity: 0.7; }
        button:focus-visible, textarea:focus-visible, a:focus-visible { outline: 1px solid var(--accent); outline-offset: 2px; }
        @media (max-width: 880px) {
          .pf-sidebar { display: none !important; }
          .pf-mobile { display: block !important; }
          .pf-toprail { padding: 12px 18px !important; }
          .pf-conversation { padding: 20px 18px !important; }
          .pf-composer { padding: 12px 18px !important; }
          .pf-suggestrow { padding: 0 18px 10px !important; }
        }
      `}</style>

      <Sidebar
        msgCount={messages.length}
        theme={theme}
        sessionId={sessionId}
        startedAt={startedAt}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          position: "relative",
        }}
      >
        <MobileHeader />

        <div
          className="pf-toprail"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 28px",
            borderBottom: "1px solid var(--line)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            background: "var(--surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Crosshair />
            <span>A Conversational Portfolio</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={onShare}
              style={{
                appearance: "none",
                border: "1px solid transparent",
                background: "transparent",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--ink-soft)",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "5px 10px",
                borderRadius: 999,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ink)";
                e.currentTarget.style.background = "var(--subtle)";
                e.currentTarget.style.borderColor = "var(--line)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--ink-soft)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              {shareToast ? "✓ COPIED" : "↗ SHARE"}
            </button>
            <span>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Dot /> Live
            </span>
          </div>
        </div>

        <div
          style={{
            padding: hasConversation ? "16px 28px 12px" : "44px 28px 12px",
            maxWidth: 880,
            width: "100%",
            margin: "0 auto",
            transition: "padding 0.4s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              marginBottom: hasConversation ? 8 : 14,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                color: "var(--ink-soft)",
                textTransform: "uppercase",
              }}
            >
              <Image
                src="/npe-icon.jpeg"
                alt=""
                width={14}
                height={14}
                style={{
                  display: "block",
                  mixBlendMode: theme === "ink" ? "screen" : "multiply",
                  filter: theme === "ink" ? "invert(1)" : "none",
                }}
              />
              <span>New Private Equity · FDE</span>
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                color: "var(--ink-soft)",
              }}
            >
              {headerStamp}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: hasConversation ? "clamp(28px, 4vw, 40px)" : "clamp(48px, 7vw, 92px)",
              lineHeight: hasConversation ? 1.05 : 0.95,
              letterSpacing: "-0.025em",
              margin: 0,
              color: "var(--ink)",
              textWrap: "balance" as React.CSSProperties["textWrap"],
              transition: "font-size 0.4s ease",
            }}
          >
            {hasConversation ? (
              <>
                Ask{" "}
                <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>
                  anything.
                </span>
              </>
            ) : (
              <>
                Hello, I&apos;m Nicholas&apos;s
                <br />
                <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>
                  digital twin.
                </span>
              </>
            )}
          </h1>
        </div>

        <div
          ref={scrollRef}
          className="pf-conversation"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 28px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 880,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  animation:
                    i === messages.length - 1 ? "pf-fadeUp 0.25s ease" : "none",
                }}
              >
                <Message
                  msg={m}
                  accent={ACCENT}
                  isLast={i === messages.length - 1}
                  onRegenerate={regenerate}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="pf-suggestrow"
          style={{
            padding: "12px 28px 14px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
          }}
        >
          <div
            style={{
              maxWidth: 880,
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--ink-soft)",
                textTransform: "uppercase",
                marginRight: 4,
              }}
            >
              {hasConversation ? "Follow-ups" : "Try"}
            </span>
            {suggestions.map((s, i) => (
              <button
                key={`${lastCtx}-${i}`}
                onClick={() => send(s.text)}
                disabled={busy}
                style={{
                  appearance: "none",
                  border: "1px solid var(--line)",
                  borderRadius: 999,
                  background: "var(--bg)",
                  padding: "7px 14px",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--ink)",
                  cursor: busy ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.18s",
                  animation: "pf-fadeUp 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!busy) {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--accent)";
                    e.currentTarget.style.background = "var(--subtle)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.color = "var(--ink)";
                  e.currentTarget.style.background = "var(--bg)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9.5,
                    color: "var(--ink-soft)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="pf-composer"
          style={{
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
            padding: "16px 28px",
          }}
        >
          <div
            style={{
              maxWidth: 880,
              margin: "0 auto",
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--accent)",
                letterSpacing: "0.05em",
                paddingBottom: 10,
                animation: "pf-cursor 1.2s steps(2) infinite",
              }}
            >
              &gt;_
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={
                busy
                  ? "Thinking…"
                  : "Ask about my work, background, or how to get in touch…   (⌘K to focus, ↑ for last)"
              }
              disabled={busy}
              style={{
                flex: 1,
                appearance: "none",
                resize: "none",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: 16,
                lineHeight: 1.5,
                color: "var(--ink)",
                padding: "8px 0",
                minHeight: 24,
                maxHeight: 160,
              }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(160, t.scrollHeight) + "px";
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={busy || !input.trim()}
              onMouseEnter={(e) => {
                if (!busy && input.trim()) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 0 var(--ink), 0 6px 16px -6px var(--accent)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  input.trim() && !busy
                    ? "0 1px 0 var(--ink), 0 2px 0 var(--line)"
                    : "0 1px 0 var(--line)";
              }}
              style={{
                appearance: "none",
                border: "1px solid var(--ink)",
                borderRadius: 6,
                background: input.trim() && !busy ? "var(--ink)" : "transparent",
                color: input.trim() && !busy ? "var(--bg)" : "var(--ink-soft)",
                padding: "10px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: busy || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 0.18s",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow:
                  input.trim() && !busy
                    ? "0 1px 0 var(--ink), 0 2px 0 var(--line)"
                    : "0 1px 0 var(--line)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  fontSize: 13,
                  lineHeight: 1,
                }}
              >
                ↵
              </span>
              Send
            </button>
          </div>
          <div
            style={{
              maxWidth: 880,
              margin: "8px auto 0",
              paddingLeft: 28,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--ink-soft)",
              letterSpacing: "0.06em",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              ↵ send · ⇧↵ newline · ↑ recall · ⌘K focus · 1–{suggestions.length} starters
            </span>
            <span>powered by claude</span>
          </div>
        </div>
      </main>

      <TweaksPanel theme={theme} onChange={onTheme} />
    </div>
  );
}
