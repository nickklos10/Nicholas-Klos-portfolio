"use client";

import React, { useState } from "react";

export type Theme = "light" | "cream" | "ink";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "cream", label: "Cream" },
  { value: "ink", label: "Ink" },
];

export function TweaksPanel({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (t: Theme) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 50,
        fontFamily: "var(--font-mono)",
      }}
    >
      {open && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            padding: "12px 14px",
            marginBottom: 8,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 180,
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: "0.14em",
              color: "var(--ink-soft)",
              textTransform: "uppercase",
            }}
          >
            Theme
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => onChange(o.value)}
                style={{
                  flex: 1,
                  appearance: "none",
                  border: `1px solid ${theme === o.value ? "var(--ink)" : "var(--line)"}`,
                  background: theme === o.value ? "var(--ink)" : "transparent",
                  color: theme === o.value ? "var(--bg)" : "var(--ink)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "6px 8px",
                  cursor: "pointer",
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle theme panel"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--ink)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--ink-soft)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        style={{
          appearance: "none",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--ink-soft)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "8px 12px",
          cursor: "pointer",
          display: "block",
          marginLeft: "auto",
          transition: "all 0.18s",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        {open ? "× Close" : "◐ Theme"}
      </button>
    </div>
  );
}
