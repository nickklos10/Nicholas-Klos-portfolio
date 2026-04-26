"use client";

import React from "react";

export type ScheduleCallOutput = { url: string; label: string };

export function ScheduleCallPanel({ output }: { output: ScheduleCallOutput }) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        background: "var(--surface)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        maxWidth: 480,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
        }}
      >
        Calendly · 30 min
      </div>
      <a
        href={output.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          appearance: "none",
          border: "1px solid var(--ink)",
          background: "var(--ink)",
          color: "var(--bg)",
          padding: "6px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        ↗ {output.label}
      </a>
    </div>
  );
}
