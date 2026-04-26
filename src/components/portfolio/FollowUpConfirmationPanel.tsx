"use client";

import React from "react";

export type FollowUpConfirmationOutput = { ok: boolean; id: number };

export function FollowUpConfirmationPanel({ output }: { output: FollowUpConfirmationOutput }) {
  return (
    <div
      style={{
        border: "1px dashed var(--line)",
        background: "var(--subtle)",
        padding: "12px 14px",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        color: "var(--ink)",
        maxWidth: 480,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          marginRight: 8,
        }}
      >
        Relayed · #{output.id.toString().padStart(4, "0")}
      </span>
      Passed this to Nicholas — he&apos;ll get back to you.
    </div>
  );
}
