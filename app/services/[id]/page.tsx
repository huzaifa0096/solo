import { notFound } from "next/navigation";
import { getService } from "@/lib/services";
import { OrderForm } from "@/components/OrderForm";

export const dynamic = "force-dynamic";

export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = getService(id);
  if (!service) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <a href="/" className="text-xs text-[var(--color-ink-dim)] mono hover:text-[var(--color-accent)]">
        ← back to services
      </a>
      <div className="mt-6 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{service.name}</h1>
        <div className="text-right">
          <div className="mono text-3xl font-semibold text-[var(--color-accent)]">
            ${service.priceUSD.toFixed(0)}
          </div>
          <div className="text-[10px] text-[var(--color-ink-dim)] mono uppercase tracking-widest">
            USDC · Base
          </div>
        </div>
      </div>
      <p className="text-[var(--color-ink-dim)] mt-3">{service.description}</p>

      <div className="mt-10">
        <OrderForm
          serviceId={service.id}
          priceUSD={service.priceUSD}
          inputLabel={service.inputLabel}
          inputPlaceholder={service.inputPlaceholder}
        />
      </div>

      <p className="mt-8 text-xs text-[var(--color-ink-dim)] leading-relaxed">
        On submit, Solo creates an order and routes you to Locus Checkout. Once
        payment lands in the agent&apos;s wallet, the agent fulfills the order —
        running policy checks, calling Anthropic, and settling the API cost from
        its own Locus wallet. You&apos;ll be redirected to the deliverable.
      </p>
    </div>
  );
}
