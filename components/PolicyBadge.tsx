import { loadPolicy } from "@/lib/policy";

export function PolicyBadge({ spendToday }: { spendToday: number }) {
  const policy = loadPolicy();
  const pct = Math.min(
    100,
    Math.round((spendToday / Math.max(0.0001, policy.dailySpendCapUSD)) * 100),
  );
  const tone =
    pct >= 90 ? "var(--color-danger)" : pct >= 60 ? "var(--color-warn)" : "var(--color-accent)";

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
          Locus policy
        </span>
        <span className="text-[10px] mono text-[var(--color-ink-dim)]">
          enforced on every tx
        </span>
      </div>
      <div className="mt-3 space-y-3">
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-[var(--color-ink-dim)]">
              Daily spend cap
            </span>
            <span className="mono text-sm">
              ${spendToday.toFixed(2)} / ${policy.dailySpendCapUSD.toFixed(2)}
            </span>
          </div>
          <div className="h-1.5 rounded-full mt-1 bg-[var(--color-line)] overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${pct}%`,
                background: tone,
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-ink-dim)]">Vendor allowlist</span>
          <span className="mono">{policy.vendorAllowlist.join(" · ")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-ink-dim)]">Per-order cap</span>
          <span className="mono">${policy.perOrderMaxCostUSD.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
