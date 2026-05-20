import { PolicyDemo } from "@/components/PolicyDemo";
import { loadPolicy } from "@/lib/policy";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  const policy = loadPolicy();
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
        Policy in action
      </div>
      <h1 className="text-3xl font-semibold tracking-tight mt-1">
        See what Locus stops Solo from doing.
      </h1>
      <p className="text-[var(--color-ink-dim)] mt-4 leading-relaxed">
        Anyone can build an AI that <em>spends</em> money. The hard problem is
        making sure it doesn&apos;t spend the <em>wrong</em> money. Click any
        scenario below to fire it against Solo&apos;s policy layer. Locus
        intercepts the bad ones before they ever reach the network.
      </p>

      <div className="panel p-4 mt-8">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-3">
          Active policy (from .env)
        </div>
        <ul className="text-sm mono space-y-1.5">
          <li className="flex justify-between">
            <span className="text-[var(--color-ink-dim)]">daily cap</span>
            <span>${policy.dailySpendCapUSD.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[var(--color-ink-dim)]">per-order cap</span>
            <span>${policy.perOrderMaxCostUSD.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[var(--color-ink-dim)]">vendor allowlist</span>
            <span>{policy.vendorAllowlist.join(" · ")}</span>
          </li>
        </ul>
      </div>

      <PolicyDemo />

      <p className="mt-10 text-xs text-[var(--color-ink-dim)] leading-relaxed">
        These are the same checks the agent runs before every Anthropic API
        call. In Solo, the policy lives in <span className="mono">lib/policy.ts</span>{" "}
        and the agent invokes it from <span className="mono">lib/agent.ts</span>{" "}
        before any vendor settlement.
      </p>
    </div>
  );
}
