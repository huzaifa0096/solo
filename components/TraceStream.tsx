"use client";

import { useEffect, useState } from "react";

type Level = "info" | "policy" | "spend" | "settle" | "deliver" | "warn" | "error";

interface TraceEvent {
  ts: number;
  level: Level;
  message: string;
  detail?: string;
}

const LEVEL_STYLE: Record<Level, { tag: string; color: string }> = {
  info: { tag: "info", color: "#9aa1ad" },
  policy: { tag: "policy", color: "#5cf0a1" },
  spend: { tag: "spend", color: "#f5b454" },
  settle: { tag: "settle", color: "#5cf0a1" },
  deliver: { tag: "deliver", color: "#5cf0a1" },
  warn: { tag: "warn", color: "#f5b454" },
  error: { tag: "error", color: "#ff6b6b" },
};

export function TraceStream({
  orderId,
  initialTrace,
  terminal,
}: {
  orderId: string;
  initialTrace: TraceEvent[];
  terminal: boolean;
}) {
  const [trace, setTrace] = useState<TraceEvent[]>(initialTrace);
  const [done, setDone] = useState(terminal);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/orders/${orderId}/trace`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = (await r.json()) as { status: string; trace: TraceEvent[] };
        setTrace(j.trace);
        if (["delivered", "failed", "refunded"].includes(j.status)) {
          setDone(true);
        }
      } catch {
        /* ignore */
      }
    }, 700);
    return () => clearInterval(interval);
  }, [done, orderId]);

  if (trace.length === 0) {
    return (
      <div className="panel p-6 mt-6">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-3">
          Agent log
        </div>
        <div className="text-sm text-[var(--color-ink-dim)] mono">
          waiting for the agent to pick this up…
        </div>
      </div>
    );
  }

  return (
    <div className="panel p-6 mt-6">
      <div className="flex items-baseline justify-between mb-4">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
          Agent log · live
        </div>
        <div className="text-[10px] mono text-[var(--color-ink-dim)]">
          {trace.length} {trace.length === 1 ? "event" : "events"}
        </div>
      </div>
      <ol className="space-y-2.5">
        {trace.map((e, i) => {
          const sty = LEVEL_STYLE[e.level];
          return (
            <li
              key={i}
              className="grid grid-cols-[64px_1fr] gap-3 text-sm leading-snug"
            >
              <span
                className="mono text-[10px] uppercase tracking-widest pt-0.5"
                style={{ color: sty.color }}
              >
                {sty.tag}
              </span>
              <div>
                <div className="text-[var(--color-ink)]">{e.message}</div>
                {e.detail && (
                  <div className="mono text-xs text-[var(--color-ink-dim)] mt-0.5">
                    {e.detail}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
