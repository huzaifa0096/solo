# Solo

> **A SaaS where the CEO is an AI.**
> Customers pay USDC on Base for a real service. Solo's agent pays for its own Anthropic API calls from its own Locus wallet. Closed economic loop, on-chain, in public — and impossible without Locus's control layer.

[![Built for Locus Paygentic #4](https://img.shields.io/badge/Locus_Paygentic-%234-5cf0a1?style=flat-square)](https://paygentic-week4.devfolio.co/)
[![USDC on Base](https://img.shields.io/badge/USDC-Base-2151f5?style=flat-square)](https://base.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Claude Opus](https://img.shields.io/badge/Anthropic-Claude_Opus-cc785c?style=flat-square)](https://anthropic.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

![Solo landing page](assets/screenshots/live-1-landing.png)

---

## The pitch

For two years every model release made AI *more* capable. The next bottleneck isn't intelligence — **it's trust.** The moment you connect a wallet to a prompt, one adversarial input can drain the account.

OpenAI, Google, Visa, Coinbase — everyone is building payment rails for agents. That's the easy half. The hard half is the **control layer**: identities, budgets, vendor allowlists, per-tx caps, audit trails. **[Locus](https://paywithlocus.com) is the only company shipping it.**

**Solo is the smallest possible proof that the control layer matters.** Without it, Solo is a liability. With it, it's a small, real, auditable business that runs unattended.

---

## What it does

1. **Customer** picks a service — *AI Code Review · Resume Critique · Market Scan* — and pays USDC on Base.
2. **Solo's agent** receives payment in its [Locus](https://paywithlocus.com) wallet.
3. Before any spend, the agent runs the **policy check** — daily cap, vendor allowlist, per-order limit.
4. Agent calls **Claude (Anthropic)** to produce the deliverable.
5. Agent settles the API cost back through Locus — `vendor=anthropic`.
6. Customer gets the deliverable. **Every txn lands in a public audit log.**

```
┌─────────────┐    USDC      ┌─────────────────────┐    USDC     ┌──────────────┐
│  Customer   │─────────────▶│  Solo agent wallet  │────────────▶│  Anthropic   │
│ (any human) │   $2-$5      │     (Locus, Base)   │   ~$0.30    │   (vendor)   │
└─────────────┘              └──────────┬──────────┘             └──────────────┘
                                        │
                                        │ policy gate every spend
                                        │ (cap, allowlist, per-tx)
                                        ▼
                              ┌──────────────────────┐
                              │  Public audit ledger │
                              │  (P&L, every txn)    │
                              └──────────────────────┘
```

## See it run

### 🟢 Live agent reasoning (the hero feature)

Every order page streams every agent decision in real time. The control layer made visible.

![Live agent log](assets/screenshots/live-3-order-trace.png)

### 📊 Public P&L

Revenue, costs, profit, and every transaction the agent has ever made — auditable by anyone with a browser.

![Public P&L dashboard](assets/screenshots/live-4-dashboard.png)

### 🚫 Policy in action

Try to make Solo misbehave. Locus blocks it.

![Policy demo](assets/screenshots/live-5-demo-policy.png)

---

## Quickstart

Requires **Node 18+** and **pnpm** (or npm / yarn).

```powershell
git clone https://github.com/huzaifa0096/solo.git
cd solo
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Open `http://localhost:3000`. The app boots in **DEMO mode** without keys — the dashboard pre-seeds with 6 historical orders so you can click through the whole customer journey before wiring up Locus + Anthropic.

To run with real keys, set in `.env`:

```ini
LOCUS_API_KEY=...           # from paywithlocus.com dashboard
ANTHROPIC_API_KEY=...       # from console.anthropic.com
SOLO_DAILY_SPEND_CAP_USD=20 # the policy that protects the agent
SOLO_VENDOR_ALLOWLIST=anthropic
```

---

## Architecture

```
solo/
├── app/
│   ├── page.tsx                     # Landing + animated stats + live ticker
│   ├── services/[id]/page.tsx       # Service detail + order form
│   ├── checkout/[id]/page.tsx       # Locus checkout (real or demo)
│   ├── order/[id]/page.tsx          # ⭐ Status + live agent trace + deliverable
│   ├── dashboard/page.tsx           # Public P&L + audit log + policy badge
│   ├── demo/page.tsx                # ⭐ Interactive policy violations
│   ├── story/page.tsx               # The Locus thesis, narrative
│   └── api/                         # Order, payment, fulfillment, trace, demo
│
├── lib/
│   ├── agent.ts                     # ⭐ Self-paying agent runtime with full trace
│   ├── policy.ts                    # Daily cap + vendor allowlist + per-order cap
│   ├── locus.ts                     # Locus MCP client (real + demo modes)
│   ├── ledger.ts                    # JSON-file order + txn store with trace events
│   ├── seed.ts                      # 6 demo orders for first-impression dashboard
│   └── services.ts                  # Service catalog (3 services)
│
├── components/
│   ├── TraceStream.tsx              # ⭐ Live agent reasoning panel
│   ├── PolicyDemo.tsx               # ⭐ Interactive policy violation buttons
│   ├── Markdown.tsx                 # Hand-rolled, no deps
│   ├── OrderWatcher.tsx             # Status pipeline with polling
│   ├── ServiceCard.tsx, PolicyBadge.tsx, LiveTicker.tsx, AnimatedStat.tsx
│   └── OrderForm.tsx, CheckoutLauncher.tsx, LiveRefresh.tsx
│
└── docs: SUBMISSION.md  VIDEO_SCRIPT.md  DEPLOYMENT.md  CHECKLIST.md
```

## Stack notes

- **Next.js 15 + Turbopack.** Webpack's RSC bundler crashes on `#` in cwd (treats it as URL fragment). Turbopack handles it cleanly.
- **Tailwind v3.** Tailwind v4's `@tailwindcss/postcss` has the same `#` bug. v3's PostCSS plugin sidesteps it.
- **JSON-file ledger.** Hackathon-appropriate — no native deps, no DB to manage, easy to inspect. Public API of `lib/ledger.ts` stays the same if you swap in Postgres later.
- **Anthropic SDK** for the customer-facing deliverable (cost-metered) and **Locus MCP** (Bearer-token auth at `https://mcp.paywithlocus.com/mcp`) for payments.

## Live demo & links

- **Devfolio submission:** https://devfolio.co/projects/solo-5a5e
- **Hackathon:** https://paygentic-week4.devfolio.co/
- **Powered by Locus:** https://paywithlocus.com

## License

MIT — see [LICENSE](LICENSE).

---

Built for [Locus' Paygentic Hackathon #4](https://paygentic-week4.devfolio.co/), May 2026. Track: **"Using LocusFounder to Build a Business!"**
