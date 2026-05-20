"use client";

import { useState } from "react";

interface Scenario {
  id: string;
  label: string;
  vendor: string;
  estimatedUSD: number;
}

interface Decision {
  ok: boolean;
  reason?: string;
  code?: string;
}

interface Result {
  scenario: Scenario;
  decision: Decision;
}

const SCENARIOS: Scenario[] = [
  {
    id: "blocked-vendor",
    label: "Try paying a vendor that's not on the allowlist (OpenAI)",
    vendor: "openai",
    estimatedUSD: 0.5,
  },
  {
    id: "per-order-cap",
    label: "Try one call that breaches the per-order cap ($3)",
    vendor: "anthropic",
    estimatedUSD: 3.0,
  },
  {
    id: "daily-cap",
    label: "Try to drain the wallet in one shot ($100)",
    vendor: "anthropic",
    estimatedUSD: 100.0,
  },
  {
    id: "allowed-spend",
    label: "A normal, within-policy spend ($0.40 to Anthropic)",
    vendor: "anthropic",
    estimatedUSD: 0.4,
  },
];

export function PolicyDemo() {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [running, setRunning] = useState<string | null>(null);

  async function fire(scenario: Scenario) {
    setRunning(scenario.id);
    try {
      const r = await fetch("/api/demo/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenario.id }),
      });
      const j = (await r.json()) as Result;
      setResults((prev) => ({ ...prev, [scenario.id]: j }));
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="mt-8 space-y-3">
      {SCENARIOS.map((s) => {
        const result = results[s.id];
        return (
          <div key={s.id} className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm">{s.label}</div>
                <div className="mt-1 text-xs mono text-[var(--color-ink-dim)]">
                  vendor=<span className="text-[var(--color-ink)]">{s.vendor}</span>{" "}
                  · estimate=
                  <span className="text-[var(--color-ink)]">
                    ${s.estimatedUSD.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => fire(s)}
                disabled={running === s.id}
                className="px-3 py-1.5 text-xs mono rounded-md border hairline hover:border-[var(--color-accent-dim)] disabled:opacity-50"
              >
                {running === s.id ? "checking…" : "test policy →"}
              </button>
            </div>
            {result && (
              <div
                className="mt-4 pt-4 border-t hairline text-sm"
                style={{
                  color: result.decision.ok
                    ? "var(--color-accent)"
                    : "var(--color-danger)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      background: result.decision.ok
                        ? "var(--color-accent)"
                        : "var(--color-danger)",
                    }}
                  />
                  <span className="mono uppercase tracking-widest text-[10px]">
                    {result.decision.ok ? "allowed" : "blocked"}
                    {result.decision.code && ` · ${result.decision.code}`}
                  </span>
                </div>
                {!result.decision.ok && (
                  <div className="mt-2 text-xs text-[var(--color-ink-dim)] leading-relaxed">
                    {result.decision.reason}
                  </div>
                )}
                {result.decision.ok && (
                  <div className="mt-2 text-xs text-[var(--color-ink-dim)]">
                    Locus would let this spend through — within all caps and
                    allowlist.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
