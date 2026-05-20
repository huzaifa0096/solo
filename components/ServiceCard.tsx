import Link from "next/link";
import type { ServiceSpec } from "@/lib/services";

export function ServiceCard({ service }: { service: ServiceSpec }) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="panel p-6 group hover:border-[var(--color-accent-dim)] transition-colors block"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {service.name}
          </h3>
          <p className="text-sm text-[var(--color-ink-dim)] mt-1">
            {service.tagline}
          </p>
        </div>
        <div className="text-right">
          <div className="mono text-2xl font-semibold text-[var(--color-accent)]">
            ${service.priceUSD.toFixed(0)}
          </div>
          <div className="text-[10px] text-[var(--color-ink-dim)] mono uppercase tracking-widest">
            USDC
          </div>
        </div>
      </div>
      <p className="text-sm text-[var(--color-ink-dim)] mt-4 leading-relaxed">
        {service.description}
      </p>
      <div className="mt-5 text-xs mono text-[var(--color-accent)] group-hover:underline">
        Pay &amp; queue order →
      </div>
    </Link>
  );
}
