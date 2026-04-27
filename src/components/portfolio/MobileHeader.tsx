"use client";

import React from "react";
import { ABOUT } from "@/lib/about";
import { Portrait } from "./marks";
import type { Theme } from "./TweaksPanel";

const THEMES: Theme[] = ["light", "cream", "ink"];

export function MobileHeader({
  theme,
  onTheme,
}: {
  theme?: Theme;
  onTheme?: (t: Theme) => void;
}) {
  return (
    <div
      className="pf-mobile"
      style={{
        display: "none",
        padding: "20px 20px 14px",
        borderBottom: "1px solid var(--line)",
        background: "var(--surface)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink)" }}
      >
        <Portrait size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}
          >
            {ABOUT.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              color: "var(--ink-soft)",
              marginTop: 3,
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
              overflow: "hidden",
            }}
          >
            {ABOUT.role}
          </div>
        </div>
        {theme && onTheme && (
          <button
            onClick={() =>
              onTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length])
            }
            aria-label={`Theme: ${theme} (tap to cycle)`}
            style={{
              flexShrink: 0,
              appearance: "none",
              border: "1px solid var(--line)",
              background: "var(--bg)",
              color: "var(--ink-soft)",
              width: 36,
              height: 36,
              borderRadius: 18,
              fontSize: 16,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ◐
          </button>
        )}
      </div>
    </div>
  );
}
