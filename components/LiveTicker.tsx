import type { Txn } from "@/lib/ledger";
import { relativeTime } from "@/lib/format";

export function LiveTicker({ txns }: { txns: Txn[] }) {
  if (txns.length === 0) return null;
  return (
    <div className="panel mt-10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b hairline">
        <div className="flex items-center gap-2">
          <span className="dot" />
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-ink-dim)]">
            Live ledger
          </span>
        </div>
        <a
          href="/dashboard"
          className="text-[10px] mono text-[var(--color-ink-dim)] hover:text-[var(--color-accent)]"
        >
          full audit log →
        </a>
      </div>
      <ul className="divide-y hairline">
        {txns.slice(0, 5).map((t) => (
          <li
            key={t.id}
            className="px-4 py-2.5 flex items-center justify-between gap-4 text-sm"
          >
            <span className="mono text-[10px] uppercase tracking-widest w-16 text-[var(--color-ink-dim)]">
              {relativeTime(t.createdAt)}
            </span>
            <span className="flex-1 text-[var(--color-ink-dim)] truncate">
              {t.memo ?? `${t.direction === "in" ? "received" : "paid"} ${t.vendor ?? ""}`}
            </span>
            <span
              className="mono w-20 text-right"
              style={{
                color:
                  t.direction === "in"
                    ? "var(--color-accent)"
                    : "var(--color-warn)",
              }}
            >
              {t.direction === "in" ? "+" : "-"}${t.amountUSD.toFixed(3)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
