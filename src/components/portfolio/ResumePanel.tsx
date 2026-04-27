"use client";

import React from "react";

export type ResumeOutput = { ok: boolean; url: string; filename: string };

export function ResumePanel({ output }: { output: ResumeOutput }) {
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
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--ink-soft)",
            textTransform: "uppercase",
          }}
        >
          Resume · PDF
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--ink)",
          }}
        >
          {output.filename}
        </div>
      </div>
      <a
        href={output.url}
        download={output.filename}
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
        ↓ Download
      </a>
    </div>
  );
}
