"use client";

import React from "react";
import { ABOUT } from "@/lib/about";
import type { Ctx } from "@/lib/parse-reply";
import { CaseCard } from "./CaseCard";
import { Dot } from "./marks";
import { EmailDraftPanel, type EmailDraftOutput } from "./EmailDraftPanel";
import { ScheduleCallPanel, type ScheduleCallOutput } from "./ScheduleCallPanel";
import {
  FollowUpConfirmationPanel,
  type FollowUpConfirmationOutput,
} from "./FollowUpConfirmationPanel";

export type ToolEvent =
  | { name: "surface_projects"; output: { ok: boolean; ids: string[] } }
  | { name: "draft_intro_email"; output: EmailDraftOutput }
  | { name: "schedule_call"; output: ScheduleCallOutput }
  | { name: "request_human_followup"; output: FollowUpConfirmationOutput };

export type Msg = {
  role: "user" | "assistant";
  content: string;
  t: string;
  streaming?: boolean;
  tools?: ToolEvent[];
  ctx?: Ctx;
};

export function Message({
  msg,
  accent,
  onRegenerate,
  isLast,
}: {
  msg: Msg;
  accent: string;
  onRegenerate: () => void;
  isLast: boolean;
}) {
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
        }}
      >
        {!isUser && <Dot />}
        <span>{isUser ? "VISITOR" : ABOUT.name.split(" ")[0].toUpperCase()}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span style={{ opacity: 0.7 }}>{msg.t}</span>
      </div>

      <div
        style={{
          maxWidth: "min(640px, 92%)",
          fontFamily: "var(--font-body)",
          fontSize: 16,
          lineHeight: 1.6,
          color: "var(--ink)",
          whiteSpace: "pre-wrap",
          textWrap: "pretty" as React.CSSProperties["textWrap"],
          padding: isUser ? "10px 14px" : "0 0 0 16px",
          background: isUser ? "var(--subtle)" : "transparent",
          border: isUser ? "1px solid var(--line)" : "none",
          borderLeft: !isUser ? `1px solid ${accent}` : "1px solid var(--line)",
        }}
      >
        {msg.content}
        {msg.streaming && !isUser && (
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: 15,
              background: accent,
              marginLeft: 3,
              verticalAlign: "text-bottom",
              animation: "pf-blink 1s steps(2) infinite",
            }}
          />
        )}
      </div>

      {(msg.tools?.length ?? 0) > 0 && !msg.streaming && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", marginTop: 4 }}>
          {msg.tools?.map((t, i) => {
            if (t.name === "surface_projects") {
              const cards = (t.output.ids || [])
                .map((id) => ABOUT.caseStudies.find((c) => c.id === id))
                .filter((c): c is NonNullable<typeof c> => Boolean(c));
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      cards.length === 1 ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 12,
                    width: "min(720px, 100%)",
                  }}
                >
                  {cards.map((c) => (
                    <CaseCard key={c.id} data={c} accent={accent} />
                  ))}
                </div>
              );
            }
            if (t.name === "draft_intro_email") return <EmailDraftPanel key={i} output={t.output} />;
            if (t.name === "schedule_call") return <ScheduleCallPanel key={i} output={t.output} />;
            if (t.name === "request_human_followup")
              return <FollowUpConfirmationPanel key={i} output={t.output} />;
            return null;
          })}
        </div>
      )}

      {!isUser && !msg.streaming && isLast && msg.content && (
        <button
          onClick={onRegenerate}
          style={{
            appearance: "none",
            border: "1px solid transparent",
            background: "transparent",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            padding: "5px 12px",
            marginLeft: 12,
            borderRadius: 999,
            cursor: "pointer",
            display: "inline-flex",
            gap: 6,
            alignItems: "center",
            transition: "all 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = accent;
            e.currentTarget.style.background = "var(--subtle)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--ink-soft)";
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          ↺ Regenerate
        </button>
      )}
    </div>
  );
}
