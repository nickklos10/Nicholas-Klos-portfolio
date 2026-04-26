"use client";

import React, { useState } from "react";

export type EmailDraftOutput = {
  subject: string;
  body: string;
  to: string;
  mailto: string;
};

export function EmailDraftPanel({ output }: { output: EmailDraftOutput }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(`Subject: ${output.subject}\n\n${output.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        background: "var(--surface)",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 640,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
        }}
      >
        Draft email · to {output.to}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)" }}>
        {output.subject}
      </div>
      <pre
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--ink)",
          background: "var(--bg)",
          padding: "10px 12px",
          margin: 0,
          whiteSpace: "pre-wrap",
          border: "1px solid var(--line)",
        }}
      >
        {output.body}
      </pre>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onCopy}
          style={{
            appearance: "none",
            border: "1px solid var(--line)",
            background: "transparent",
            padding: "6px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "var(--ink)",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <a
          href={output.mailto}
          style={{
            appearance: "none",
            border: "1px solid var(--ink)",
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "6px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          ↗ Open in Mail
        </a>
      </div>
    </div>
  );
}
