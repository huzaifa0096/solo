export const dynamic = "force-static";

export default function StoryPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-14 leading-relaxed">
      <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)]">
        The thesis
      </div>
      <h1 className="text-3xl font-semibold tracking-tight mt-1">
        Solo is a proof that AI can run a business
        — only because Locus exists.
      </h1>

      <section className="mt-10 space-y-4 text-[var(--color-ink)]">
        <p>
          For the last two years, every model release made AI <em>more</em>{" "}
          capable. Better reasoning. Better tool use. Longer context. A million
          startups built &quot;agents&quot; that do real work — from booking
          calendars to writing code to running ops.
        </p>
        <p>
          And every one of them hit the same wall: <strong>you can&apos;t let
          the agent touch money</strong>. The moment you connect a wallet to a
          prompt, a single bad input — adversarial, confused, hallucinated —
          can drain the account. So we kept agents on the read-only side of
          the universe.
        </p>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          What Locus actually built
        </h2>
        <p>
          OpenAI, Google, Visa, Coinbase — everyone&apos;s building payment
          rails for agents. That&apos;s the easy half. <strong>The hard half is
          the control layer</strong>: identities, budgets, vendor allowlists,
          per-tx limits, audit trails. Locus is the only company shipping it.
        </p>
        <p>
          With Locus, you don&apos;t just hand an agent a wallet. You hand it a{" "}
          <em>policy</em> — &quot;you may spend up to $20 per day, only with
          these vendors, never more than $1.50 per call.&quot; Every transaction
          checks against that policy. Every payment lands in a public ledger.
        </p>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          What Solo proves
        </h2>
        <p>
          Solo is a one-agent SaaS. Customers pay in USDC for a real service —
          code review, resume critique, market scans. The agent uses its own
          Locus wallet to pay for the Anthropic API calls it makes to fulfill
          each order.
        </p>
        <p>
          Revenue in: real USDC, on Base, traceable. <br />
          Costs out: real USDC, on Base, traceable. <br />
          Profit: visible to anyone with a browser.
        </p>
        <p>
          The agent is Claude. The CEO is Claude. The CFO is Claude. The only
          human in the loop is the one who set the policy in the .env file —
          and that policy is what makes it safe to leave the agent running.
        </p>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Without Locus, this is impossible
        </h2>
        <p>
          Drop the policy layer and Solo becomes a liability. A user with a
          long enough input could push token usage past the cost of the
          deliverable. A jailbroken prompt could route payments to an attacker.
          A bug in the agent could loop forever, paying Anthropic into
          insolvency.
        </p>
        <p>
          With Locus, none of that happens. The cap holds. The allowlist holds.
          The audit log holds. <em>The agent is allowed to be wrong without
          the business being wrong.</em>
        </p>
        <p>
          That&apos;s the bet of the next decade of software, and Solo is the
          smallest possible proof of it.
        </p>
      </section>

      <section className="mt-12">
        <div className="panel p-6">
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-2">
            See it run
          </div>
          <ul className="text-sm space-y-1.5">
            <li>
              →{" "}
              <a href="/" className="text-[var(--color-accent)] hover:underline">
                Buy a service from Solo
              </a>{" "}
              and watch the agent fulfil it live.
            </li>
            <li>
              →{" "}
              <a
                href="/dashboard"
                className="text-[var(--color-accent)] hover:underline"
              >
                See the public P&amp;L
              </a>{" "}
              — every txn the agent has ever made.
            </li>
            <li>
              →{" "}
              <a
                href="/demo"
                className="text-[var(--color-accent)] hover:underline"
              >
                Try to make the agent misbehave
              </a>{" "}
              and watch Locus block it.
            </li>
          </ul>
        </div>
      </section>

      <p className="mt-10 text-xs text-[var(--color-ink-dim)] mono">
        Built for Locus&apos; Paygentic Hackathon #4 · May 2026
      </p>
    </div>
  );
}
