"use client";

import { useEffect, useRef } from "react";
import { suggestionsFor, type Ctx } from "@/lib/parse-reply";

const IDLE_MS = 60_000;

export function AfkNudger({
  inputRef,
  ctx,
  enabled,
  onConsume,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  ctx: Ctx;
  enabled: boolean;
  onConsume: () => void;
}) {
  const timer = useRef<number | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (!enabled || ranOnce.current) return;

    const reset = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(fire, IDLE_MS);
    };

    const fire = () => {
      if (ranOnce.current) return;
      const el = inputRef.current;
      if (!el || document.activeElement === el || el.value) return;
      const suggestions = suggestionsFor(ctx);
      const hint = suggestions[0]?.text;
      if (!hint) return;
      ranOnce.current = true;
      onConsume();
      typeAndFade(el, hint);
    };

    window.addEventListener("keydown", reset);
    window.addEventListener("pointerdown", reset);
    reset();

    return () => {
      window.removeEventListener("keydown", reset);
      window.removeEventListener("pointerdown", reset);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [enabled, ctx, inputRef, onConsume]);

  return null;
}

function typeAndFade(el: HTMLTextAreaElement, text: string) {
  const original = el.placeholder;
  let i = 0;
  el.placeholder = "";
  el.style.transition = "opacity 0.6s";
  const tick = () => {
    if (document.activeElement === el || el.value) {
      el.placeholder = original;
      return;
    }
    if (i <= text.length) {
      el.placeholder = text.slice(0, i);
      i++;
      window.setTimeout(tick, 28);
      return;
    }
    window.setTimeout(() => {
      el.style.opacity = "0.6";
      window.setTimeout(() => {
        el.placeholder = original;
        el.style.opacity = "1";
      }, 1800);
    }, 1200);
  };
  tick();
}
