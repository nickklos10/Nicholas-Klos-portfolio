"use client";

import React from "react";
import Image from "next/image";
import { ABOUT } from "@/lib/about";
import { Portrait, Crosshair, Dot } from "./marks";

type Theme = "light" | "cream" | "ink";

function SidebarLink({
  href,
  label,
  external,
  first,
  last,
  onClick,
}: {
  href: string;
  label: string;
  external?: boolean;
  first?: boolean;
  last?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.08em",
        color: "var(--ink)",
        textDecoration: "none",
        padding: "8px 10px",
        borderTop: first ? "1px solid var(--line)" : "1px solid var(--line)",
        borderBottom: last ? "1px solid var(--line)" : undefined,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "0 -10px",
        transition: "all 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--subtle)";
        e.currentTarget.style.color = "var(--accent)";
        e.currentTarget.style.transform = "translateX(2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--ink)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--ink-soft)" }}>→</span>
    </a>
  );
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
          fontSize: mono ? 11 : 13.5,
          color: "var(--ink)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function Sidebar({
  msgCount,
  theme,
  sessionId,
  startedAt,
}: {
  msgCount: number;
  theme: Theme;
  sessionId: string;
  startedAt: string;
}) {
  return (
    <aside
      className="pf-sidebar"
      style={{
        width: 280,
        flexShrink: 0,
        borderRight: "1px solid var(--line)",
        background: "var(--surface)",
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "var(--ink-soft)",
          opacity: 0.6,
        }}
      >
        <Crosshair />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 10,
            color: "var(--ink)",
          }}
        >
          <Portrait size={56} />
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            lineHeight: 1.0,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            marginTop: 6,
          }}
        >
          {ABOUT.name}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            color: "var(--ink-soft)",
            lineHeight: 1.45,
            marginTop: 6,
          }}
        >
          {ABOUT.role}, working in {ABOUT.industry}.
        </div>
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Currently @
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            border: "1px solid var(--line)",
            background: "var(--bg)",
            marginBottom: 10,
          }}
        >
          <Image
            src="/npe-icon.jpeg"
            alt="NPE"
            width={22}
            height={22}
            style={{
              display: "block",
              mixBlendMode: theme === "ink" ? "screen" : "multiply",
              filter: theme === "ink" ? "invert(1)" : "none",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              color: "var(--ink)",
              textTransform: "uppercase",
            }}
          >
            New Private Equity
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--ink)",
          }}
        >
          {ABOUT.currently}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Meta
          label="Status"
          value={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Dot />
              Open to chats
            </span>
          }
        />
        <Meta label="Email" value={ABOUT.email} mono />
        <Meta label="Session" value={sessionId} mono />
        <Meta label="Started" value={startedAt} mono />
        <Meta label="Messages" value={String(msgCount).padStart(3, "0")} mono />
        <Meta label="Model" value="stub" mono />
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <SidebarLink
          href={ABOUT.resumeUrl}
          onClick={(e) => {
            if (ABOUT.resumeUrl === "#") {
              e.preventDefault();
              alert("Drop your resume URL into ABOUT.resumeUrl");
            }
          }}
          label="↓ resume.pdf"
          first
        />
        <SidebarLink href={`mailto:${ABOUT.email}`} label="✉ direct email" />
        <SidebarLink href={ABOUT.linkedin} label="↗ linkedin" external />
        <SidebarLink href={ABOUT.github} label="↗ github" external last />
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          letterSpacing: "0.1em",
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{theme.toUpperCase()}</span>
        <span>©{new Date().getFullYear()}</span>
      </div>
    </aside>
  );
}
