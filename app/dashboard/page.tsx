import { pnlSummary, recentOrders, recentTxns } from "@/lib/ledger";
import { usd, relativeTime, shortRef } from "@/lib/format";
import { PolicyBadge } from "@/components/PolicyBadge";
import { LiveRefresh } from "@/components/LiveRefresh";
import { isDemoMode } from "@/lib/locus";
import { getService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const pnl = pnlSummary();
  const orders = recentOrders(15);
  const txns = recentTxns(30);
  const demo = isDemoMode();

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <LiveRefresh />

      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
            Public P&amp;L · {demo ? "demo mode" : "live"}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">
            Solo&apos;s books
          </h1>
        </div>
        <a
          href="/"
          className="text-xs mono text-[var(--color-ink-dim)] hover:text-[var(--color-accent)]"
        >
          ← back to services
        </a>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Stat
          label="Revenue"
          value={usd(pnl.revenueUSD)}
          hint={`${pnl.ordersDelivered} delivered`}
          tone="accent"
        />
        <Stat
          label="Costs"
          value={usd(pnl.costUSD)}
          hint="paid via Locus"
          tone="warn"
        />
        <Stat
          label="Profit"
          value={usd(pnl.profitUSD)}
          hint={pnl.revenueUSD > 0 ? `${margin(pnl)}% margin` : "no revenue yet"}
          tone={pnl.profitUSD >= 0 ? "accent" : "danger"}
        />
        <Stat
          label="In queue"
          value={`${pnl.ordersPending}`}
          hint="paid + fulfilling"
          tone="ink"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div className="md:col-span-2 panel p-5">
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-3">
            Recent orders
          </div>
          {orders.length === 0 ? (
            <div className="text-sm text-[var(--color-ink-dim)] py-6 text-center mono">
              no orders yet — be the first
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-[var(--color-ink-dim)]">
                <tr>
                  <th className="text-left pb-2 font-normal">Order</th>
                  <th className="text-left pb-2 font-normal">Service</th>
                  <th className="text-right pb-2 font-normal">Paid</th>
                  <th className="text-right pb-2 font-normal">Cost</th>
                  <th className="text-right pb-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const svc = getService(o.serviceId);
                  return (
                    <tr key={o.id} className="border-t hairline">
                      <td className="py-2 mono text-xs">
                        <a
                          href={`/order/${o.id}`}
                          className="hover:text-[var(--color-accent)]"
                        >
                          {o.id.slice(0, 8)}
                        </a>
                        <span className="text-[var(--color-ink-dim)] ml-2">
                          {relativeTime(o.createdAt)}
                        </span>
                      </td>
                      <td className="py-2">{svc?.name ?? o.serviceId}</td>
                      <td className="py-2 mono text-right">
                        {usd(o.priceUSD)}
                      </td>
                      <td className="py-2 mono text-right text-[var(--color-ink-dim)]">
                        {o.status === "delivered" ? usd(o.costUSD) : "—"}
                      </td>
                      <td className="py-2 text-right">
                        <StatusPill status={o.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <PolicyBadge spendToday={pnl.spendToday} />
      </div>

      <div className="panel p-5 mt-4">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-3">
          Audit log · every txn the agent makes
        </div>
        {txns.length === 0 ? (
          <div className="text-sm text-[var(--color-ink-dim)] py-6 text-center mono">
            no transactions yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-[var(--color-ink-dim)]">
              <tr>
                <th className="text-left pb-2 font-normal">When</th>
                <th className="text-left pb-2 font-normal">Kind</th>
                <th className="text-left pb-2 font-normal">Vendor</th>
                <th className="text-left pb-2 font-normal">Memo</th>
                <th className="text-right pb-2 font-normal">Amount</th>
                <th className="text-right pb-2 font-normal">On-chain</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-t hairline">
                  <td className="py-2 mono text-xs text-[var(--color-ink-dim)]">
                    {relativeTime(t.createdAt)}
                  </td>
                  <td className="py-2">
                    <KindPill kind={t.kind} direction={t.direction} />
                  </td>
                  <td className="py-2 mono text-xs">{t.vendor ?? "—"}</td>
                  <td className="py-2 text-xs text-[var(--color-ink-dim)] truncate max-w-xs">
                    {t.memo ?? "—"}
                  </td>
                  <td
                    className="py-2 mono text-right"
                    style={{
                      color:
                        t.direction === "in"
                          ? "var(--color-accent)"
                          : "var(--color-warn)",
                    }}
                  >
                    {t.direction === "in" ? "+" : "-"}
                    {usd(t.amountUSD)}
                  </td>
                  <td className="py-2 mono text-xs text-[var(--color-ink-dim)] text-right">
                    {shortRef(t.onchainRef)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function margin(pnl: { revenueUSD: number; profitUSD: number }): string {
  if (pnl.revenueUSD <= 0) return "0";
  return ((pnl.profitUSD / pnl.revenueUSD) * 100).toFixed(0);
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "accent" | "warn" | "danger" | "ink";
}) {
  const color =
    tone === "accent"
      ? "var(--color-accent)"
      : tone === "warn"
        ? "var(--color-warn)"
        : tone === "danger"
          ? "var(--color-danger)"
          : "var(--color-ink)";
  return (
    <div className="panel p-5">
      <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
        {label}
      </div>
      <div className="mono text-3xl font-semibold mt-2" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-[var(--color-ink-dim)] mt-1">{hint}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    pending_payment: { bg: "#1a1d24", color: "#9aa1ad", label: "awaiting" },
    paid: { bg: "#1a1d24", color: "#f5b454", label: "paid" },
    fulfilling: { bg: "#1a1d24", color: "#f5b454", label: "working" },
    delivered: { bg: "#0f2418", color: "#5cf0a1", label: "delivered" },
    failed: { bg: "#241010", color: "#ff6b6b", label: "failed" },
    refunded: { bg: "#1a1d24", color: "#9aa1ad", label: "refunded" },
  };
  const s = styles[status] ?? styles.pending_payment;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[10px] mono uppercase tracking-widest"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function KindPill({
  kind,
  direction,
}: {
  kind: string;
  direction: "in" | "out";
}) {
  const label = direction === "in" ? "revenue ↓" : `${kind} ↑`;
  const color =
    direction === "in" ? "var(--color-accent)" : "var(--color-warn)";
  return (
    <span
      className="inline-block text-[10px] mono uppercase tracking-widest"
      style={{ color }}
    >
      {label}
    </span>
  );
}
