import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder, getTrace } from "@/lib/ledger";
import { getService } from "@/lib/services";
import { OrderWatcher } from "@/components/OrderWatcher";
import { TraceStream } from "@/components/TraceStream";
import { Markdown } from "@/components/Markdown";
import { usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  const service = getService(order.serviceId);
  if (!service) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
            Order · <span className="mono">{order.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">
            {service.name}
          </h1>
        </div>
        <div className="text-right">
          <div className="mono text-2xl text-[var(--color-accent)]">
            {usd(order.priceUSD)}
          </div>
          <div className="text-[10px] mono uppercase tracking-widest text-[var(--color-ink-dim)]">
            paid · USDC
          </div>
        </div>
      </div>

      <OrderWatcher orderId={order.id} initialStatus={order.status} />

      <TraceStream
        orderId={order.id}
        initialTrace={getTrace(order.id)}
        terminal={["delivered", "failed", "refunded"].includes(order.status)}
      />

      {order.deliverable && order.status === "delivered" && (
        <div className="panel p-6 mt-6">
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-3">
            Deliverable
          </div>
          <Markdown source={order.deliverable} />
          <div className="mt-6 pt-4 border-t hairline flex items-center justify-between text-xs text-[var(--color-ink-dim)]">
            <span>
              Settled · agent paid {usd(order.costUSD)} for Anthropic API
            </span>
            <Link
              href="/dashboard"
              className="mono hover:text-[var(--color-accent)]"
            >
              see full ledger →
            </Link>
          </div>
        </div>
      )}

      {order.status === "failed" && order.deliverable && (
        <div className="panel p-6 mt-6 border-[var(--color-danger)]">
          <div className="text-xs uppercase tracking-widest text-[var(--color-danger)] mb-2">
            Failed
          </div>
          <p className="text-sm text-[var(--color-ink-dim)]">
            {order.deliverable.replace(/^__FAILED__:\s*/, "")}
          </p>
          <p className="text-xs text-[var(--color-ink-dim)] mt-4">
            This is exactly the kind of failure Locus is designed to surface
            cleanly — the agent didn&apos;t silently overspend.
          </p>
        </div>
      )}
    </div>
  );
}
