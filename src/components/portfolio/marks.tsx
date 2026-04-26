"use client";

import React from "react";

export function Portrait({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-label="Nicholas"
      style={{ display: "block" }}
    >
      <path
        d="M16 28 C 16 17, 24 11, 32 11 C 40 11, 48 17, 48 29 C 48 36, 46 41, 43 44 L 43 49"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M21 41 C 22 47, 27 51, 32 51 C 36 51, 41 49, 43 45"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M19 22 C 22 14, 30 11, 38 13 C 43 14, 47 18, 48 24"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 17 C 26 14, 32 13, 36 14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M23 28 L 28 27" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M37 27 L 42 28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="26" cy="32" r="1.1" fill="currentColor" />
      <circle cx="39" cy="32" r="1.1" fill="currentColor" />
      <path
        d="M32 33 L 31 39 L 33.5 40"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 45 C 30 46.5, 34 46.5, 36 45"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9 63 C 12 56, 18 52, 24 51"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M55 63 C 52 56, 46 52, 40 51"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M27 52 L 30 56 L 32 53 L 34 56 L 37 52"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="42" cy="38" r="0.9" fill="var(--accent)" />
    </svg>
  );
}

export function Crosshair({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: "block" }}>
      <line x1="5" y1="0" x2="5" y2="10" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function Dot({ color }: { color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color || "var(--accent)",
      }}
    />
  );
}

export function ProjectMark({
  kind,
  accent,
}: {
  kind: "grid" | "wave" | "spark";
  accent: string;
}) {
  const stroke = accent;
  const muted = "var(--ink-soft)";
  if (kind === "grid") {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
        {[0, 1, 2, 3].map((c) =>
          [0, 1, 2].map((r) => (
            <rect
              key={`${c}-${r}`}
              x={2 + c * 15}
              y={2 + r * 15}
              width="12"
              height="12"
              stroke={r === 1 && c === 2 ? stroke : muted}
              fill={r === 1 && c === 2 ? stroke : "none"}
              strokeWidth="1"
            />
          )),
        )}
      </svg>
    );
  }
  if (kind === "wave") {
    const pts = Array.from({ length: 33 }, (_, i) => {
      const x = i * 2;
      const y = 24 + Math.sin(i * 0.5) * 10 + Math.cos(i * 0.27) * 6;
      return `${x},${y.toFixed(1)}`;
    }).join(" ");
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
        <polyline points={pts} stroke={stroke} strokeWidth="1.2" fill="none" />
        <line
          x1="0"
          y1="24"
          x2="64"
          y2="24"
          stroke={muted}
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
      </svg>
    );
  }
  const bars = [12, 22, 18, 30, 24, 36, 28, 40];
  return (
    <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={2 + i * 7.5}
          y={44 - h}
          width="5"
          height={h}
          fill={i === bars.length - 1 ? stroke : muted}
          opacity={i === bars.length - 1 ? 1 : 0.5}
        />
      ))}
    </svg>
  );
}
