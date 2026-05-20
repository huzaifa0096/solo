"use client";

/**
 * Stat tile with a soft fade-in on mount.
 *
 * We render the formatted value server-side so the initial paint is correct
 * (no hydration mismatch, no $0.00 flash for screenshots). The "animation" is
 * just an opacity fade — keeps the tile feeling alive without rolling our own
 * tween, which was the source of a hydration bug where the client kept
 * shown=0 forever.
 */

import { useEffect, useState } from "react";

export function AnimatedStat({
  label,
  value,
  format,
  tone,
  hint,
}: {
  label: string;
  value: number;
  format: "usd" | "int";
  tone: "accent" | "warn" | "ink";
  hint?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const color =
    tone === "accent"
      ? "var(--color-accent)"
      : tone === "warn"
        ? "var(--color-warn)"
        : "var(--color-ink)";

  const formatted =
    format === "usd"
      ? `$${value.toFixed(2)}`
      : Math.round(value).toString();

  return (
    <div
      className="panel p-4 transition-opacity duration-700"
      style={{ opacity: mounted ? 1 : 0.4 }}
    >
      <div className="text-[10px] uppercase tracking-widest text-[var(--color-ink-dim)]">
        {label}
      </div>
      <div className="mono text-2xl font-semibold mt-1.5" style={{ color }}>
        {formatted}
      </div>
      {hint && (
        <div className="text-[10px] mono text-[var(--color-ink-dim)] mt-1">
          {hint}
        </div>
      )}
    </div>
  );
}
