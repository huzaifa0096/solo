# Solo — the world's first AI-owned business

> An autonomous solopreneur built on Locus. Customers pay USDC for a real AI service; the agent uses its own Locus wallet to pay for the Anthropic API calls it makes to fulfill those orders. Closed economic loop, on-chain, in public.

Built for [Locus' Paygentic Hackathon #4](https://paygentic-week4.devfolio.co/) — Week 4 theme: **using LocusFounder to build a business**.

## What's actually here

```
solo/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx            # Landing + service picker
│   ├── checkout/[id]/      # Pay-with-Locus checkout
│   ├── order/[id]/         # Customer's deliverable view
│   ├── dashboard/          # Public P&L + audit log
│   └── api/                # Order, payment, fulfillment routes
├── lib/
│   ├── locus.ts            # Locus MCP client (Claude Agent SDK)
│   ├── agent.ts            # Self-paying agent runtime
│   ├── policy.ts           # Budget cap + vendor allowlist enforcement
│   ├── ledger.ts           # SQLite-backed P&L ledger
│   └── services.ts         # The service catalog Solo sells
├── components/             # UI primitives
├── .env.example            # Set LOCUS_API_KEY + ANTHROPIC_API_KEY
└── package.json
```

## Quickstart

```powershell
pnpm install
Copy-Item .env.example .env  # then edit values
pnpm dev
```

Visit http://localhost:3000.

## How it works

1. **Customer** picks a service ("AI code review", "Resume critique", "Market scan") and pays $2–5 USDC via Locus checkout.
2. **Solo agent** receives the payment in its Locus wallet (on Base). The order goes into a fulfilment queue.
3. **Agent runtime** spins up a Claude Agent SDK session connected to the Locus MCP server. The agent:
   - Validates the order against its **policy layer** (daily spend cap, vendor allowlist).
   - Calls Anthropic to produce the deliverable.
   - Settles the API cost out of its own Locus wallet (the part of the loop Locus uniquely enables).
   - Writes the txn to the public ledger.
4. **Customer** gets a delivery link. **Public dashboard** shows live revenue, costs, profit, and the on-chain audit log.

## Why this is the right shape for Week 4

- **Closed loop.** Agent earns AND spends, both via Locus. Most demos only show one side.
- **Locus's *unique* value is the demo.** The story line "without the spending cap, a bad prompt could drain this agent in 5 minutes" only works on Locus's policy/control layer — not on raw payment rails.
- **Live and on-chain.** Judges click the dashboard and see real Base txns refresh in real time.
- **Buildable solo in 5 days.** Next.js + Claude Agent SDK + Locus MCP + SQLite ledger.

## License

MIT
