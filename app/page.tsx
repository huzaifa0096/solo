import { SERVICE_LIST } from "@/lib/services";
import { ServiceCard } from "@/components/ServiceCard";
import { pnlSummary, recentTxns } from "@/lib/ledger";
import { ensureSeedData } from "@/lib/seed";
import { usd } from "@/lib/format";
import { isDemoMode } from "@/lib/locus";
import { LiveTicker } from "@/components/LiveTicker";
import { AnimatedStat } from "@/components/AnimatedStat";

export const dynamic = "force-dynamic";

export default function Home() {
  // Seed once on first cold-open so the dashboard looks alive.
  ensureSeedData();
  const pnl = pnlSummary();
  const tickerTxns = recentTxns(8);
  const demo = isDemoMode();
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="dot" />
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
            {demo ? "demo mode — running without live Locus keys" : "live on Base"}
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
          A SaaS where the{" "}
          <span className="text-[var(--color-accent)]">CEO is an AI</span>.
        </h1>
        <p className="mt-5 text-[var(--color-ink-dim)] max-w-2xl text-lg leading-relaxed">
          Customers pay USDC for a real service. Solo&apos;s agent pays for its
          own Anthropic API calls from its Locus wallet. Every dollar in, every
          cent out — on Base, in public, under policies Locus enforces on every
          transaction. <span className="text-[var(--color-ink)]">Bad prompts can&apos;t drain it</span>.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <a
            href="/dashboard"
            className="px-3 py-2 rounded-md border hairline mono hover:border-[var(--color-accent-dim)]"
          >
            Live P&amp;L →
          </a>
          <a
            href="/demo"
            className="px-3 py-2 rounded-md border hairline mono hover:border-[var(--color-accent-dim)]"
          >
            Policy in action →
          </a>
          <a
            href="/story"
            className="px-3 py-2 rounded-md border hairline mono hover:border-[var(--color-accent-dim)]"
          >
            The thesis →
          </a>
          <a
            href="https://paywithlocus.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-md border hairline mono hover:border-[var(--color-accent-dim)]"
          >
            Powered by Locus ↗
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          <AnimatedStat label="Revenue" value={pnl.revenueUSD} format="usd" tone="accent" hint="USDC received" />
          <AnimatedStat label="Spent on APIs" value={pnl.costUSD} format="usd" tone="warn" hint="via Locus" />
          <AnimatedStat label="Profit" value={pnl.profitUSD} format="usd" tone="accent" hint={pnl.revenueUSD > 0 ? `${Math.round((pnl.profitUSD / pnl.revenueUSD) * 100)}% margin` : "—"} />
          <AnimatedStat label="Orders" value={pnl.ordersDelivered} format="int" tone="ink" hint="delivered" />
        </div>

        <LiveTicker txns={tickerTxns} />
      </section>

      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-lg font-semibold tracking-tight">
            What Solo sells
          </h2>
          <span className="text-xs text-[var(--color-ink-dim)] mono">
            pick one · pay in USDC · deliverable in &lt;60s
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {SERVICE_LIST.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold tracking-tight mb-4">
          The closed loop
        </h2>
        <ol className="grid md:grid-cols-2 gap-3 text-sm leading-relaxed">
          <li className="panel p-5">
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-2">
              1 · revenue
            </div>
            Customer pays USDC to Solo&apos;s Locus wallet via Locus Checkout.
            Funds land on Base, traceable on-chain.
          </li>
          <li className="panel p-5">
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-2">
              2 · policy
            </div>
            Before the agent does anything expensive, Locus enforces the
            policy: daily cap, vendor allowlist, per-order cost limit. Bad
            prompts hit the wall, not the wallet.
          </li>
          <li className="panel p-5">
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-2">
              3 · production
            </div>
            Claude produces the deliverable. Token usage is metered. The agent
            settles the API cost out of its own Locus wallet — vendor=anthropic.
          </li>
          <li className="panel p-5">
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-2">
              4 · audit
            </div>
            Every txn — customer in, vendor out — lands in the public ledger.
            P&amp;L is computed in real time. Auditable by anyone with a browser.
          </li>
        </ol>
      </section>
    </div>
  );
}
