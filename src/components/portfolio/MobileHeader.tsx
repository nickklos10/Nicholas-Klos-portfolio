"use client";

import React from "react";
import { ABOUT } from "@/lib/about";
import { Portrait } from "./marks";

export function MobileHeader() {
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
        <div>
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
              marginTop: 2,
            }}
          >
            {ABOUT.role}, working in {ABOUT.industry}.
          </div>
        </div>
      </div>
    </div>
  );
}
