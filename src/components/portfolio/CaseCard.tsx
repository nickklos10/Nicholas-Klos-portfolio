"use client";

import React from "react";
import type { CaseStudy } from "@/lib/about";
import { ProjectMark } from "./marks";

export function CaseCard({ data, accent }: { data: CaseStudy; accent: string }) {
  return (
    <div
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow =
          "0 12px 32px -12px color-mix(in srgb, var(--accent) 50%, transparent)";
        e.currentTarget.style.background = "var(--surface)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.background = "var(--surface)";
      }}
      style={{
        border: "1px solid var(--line)",
        background: "var(--surface)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        transition: "all 0.25s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--ink-soft)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {data.tag}
        </div>
        <ProjectMark kind={data.mark} accent={accent} />
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          lineHeight: 1.05,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
        }}
      >
        {data.title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          lineHeight: 1.55,
          color: "var(--ink-soft)",
        }}
      >
        {data.summary}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
        {data.stack.map((s) => (
          <span
            key={s}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.04em",
              padding: "3px 8px",
              border: "1px solid var(--line)",
              color: "var(--ink-soft)",
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "6px 0 0 0",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {data.outcomes.map((o, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "baseline",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--ink)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: accent,
                width: 18,
                flexShrink: 0,
              }}
            >
              0{i + 1}
            </span>
            <span>{o}</span>
          </li>
        ))}
      </ul>
      {data.lesson && (
        <div
          style={{
            marginTop: 6,
            paddingTop: 10,
            borderTop: "1px dashed var(--line)",
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontStyle: "italic",
            color: "var(--ink)",
            lineHeight: 1.4,
          }}
        >
          &ldquo;{data.lesson}&rdquo;
        </div>
      )}
      {(data.links?.github || data.links?.live) && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 4,
            paddingTop: 10,
            borderTop: "1px solid var(--line)",
          }}
        >
          {data.links?.github && (
            <a
              href={data.links.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.1em",
                color: "var(--ink)",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "5px 10px",
                border: "1px solid var(--line)",
              }}
            >
              ↗ Github
            </a>
          )}
          {data.links?.live && (
            <a
              href={data.links.live}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.1em",
                color: accent,
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "5px 10px",
                border: `1px solid ${accent}`,
              }}
            >
              ↗ Live
            </a>
          )}
        </div>
      )}
    </div>
  );
}
