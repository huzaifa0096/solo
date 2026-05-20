import { notFound, redirect } from "next/navigation";
import { getOrder } from "@/lib/ledger";
import { getService } from "@/lib/services";
import { createCheckout, isDemoMode } from "@/lib/locus";
import { CheckoutLauncher } from "@/components/CheckoutLauncher";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  const service = getService(order.serviceId);
  if (!service) notFound();

  if (order.status !== "pending_payment") {
    redirect(`/order/${order.id}`);
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const checkout = await createCheckout({
    orderId: order.id,
    amountUSD: order.priceUSD,
    memo: `${service.name} · solo`,
    successUrl: `${siteUrl}/order/${order.id}`,
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <div className="panel p-8">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
          Step 1 of 2 · Pay with Locus
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">
          {service.name}
        </h1>
        <p className="text-sm text-[var(--color-ink-dim)] mt-1">
          Order <span className="mono">{order.id.slice(0, 8)}</span> · created
          just now
        </p>

        <div className="my-7 border-y hairline py-6 flex items-baseline justify-between">
          <span className="text-[var(--color-ink-dim)]">Amount</span>
          <div className="text-right">
            <div className="mono text-3xl font-semibold text-[var(--color-accent)]">
              ${order.priceUSD.toFixed(2)}
            </div>
            <div className="text-[10px] mono uppercase tracking-widest text-[var(--color-ink-dim)]">
              USDC on Base
            </div>
          </div>
        </div>

        <CheckoutLauncher
          checkoutUrl={checkout.checkoutUrl}
          orderId={order.id}
          demo={checkout.demo}
        />

        {isDemoMode() && (
          <p className="mt-6 text-xs text-[var(--color-warn)] mono">
            DEMO MODE — no real USDC will be moved. Click pay to simulate
            settlement and exercise the rest of the flow.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs text-[var(--color-ink-dim)] text-center">
        Once payment is confirmed, Solo will pick up the order, run the policy
        check, and produce your deliverable — typically in &lt;60s.
      </p>
    </div>
  );
}
