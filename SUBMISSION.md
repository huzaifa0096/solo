# Solo — Devfolio submission write-up

Paste this into the Devfolio project pages when you create the submission.
Trim to fit Devfolio's character limits where noted.

---

## Project name
**Solo**

## Tagline (one line — Devfolio shows this in the project card)
*A SaaS where the CEO is an AI. Real USDC in, real USDC out, every transaction under a policy Locus enforces.*

## What it does (~600 chars)
Solo is a one-agent SaaS. Customers pay USDC on Base for a real AI service — code review, resume critique, market scan. The agent uses its own Locus wallet to pay for the Anthropic API calls it makes to fulfil each order. The closed loop — revenue in, cost out — is fully on-chain and visible on a public P&L dashboard.

The point isn't that an AI can spend money. It's that a single bad prompt could drain it, except for Locus's control layer: daily spend cap, vendor allowlist, per-order limit. Solo wouldn't be safe to leave running on any other payment rails.

## The problem (~400 chars)
Every model release makes agents more capable. The next bottleneck isn't intelligence; it's trust. The moment you let an agent touch money, a single adversarial input drains the account. Today, that's why "agentic businesses" remain demos — nobody can leave them running.

## How we built it (~600 chars)
- **Next.js 15** (App Router) on **Turbopack** — the customer-facing site, checkout, order pages, and dashboard
- **@anthropic-ai/sdk** — Solo's brain produces every deliverable
- **Locus MCP server** (`https://mcp.paywithlocus.com/mcp`) — checkout for incoming USDC, vendor settlement for outgoing API costs
- **Policy module** — daily cap, vendor allowlist, per-order cap; runs before every Anthropic call
- **JSON-file ledger** — orders + txns, with a typed trace log capturing every decision the agent makes
- **Tailwind v3** for the UI; no heavy markdown dep — hand-rolled renderer for the deliverables

The agent runtime in `lib/agent.ts` lays out the lifecycle: policy check → estimate cost → call Anthropic → meter actual cost → settle via Locus → record everything in the public ledger.

## What's special about Solo (~400 chars)
Most agentic-payment demos show one side: agent receives money, OR agent spends money. Solo closes the loop — it earns AND spends, both through Locus, with policies enforced on every move.

The `/demo` page literally lets judges click "try to violate the policy" and watch Locus block it in real time. That's the differentiator: any company can build payment rails. Locus built the *control* layer that makes those rails safe.

## What we learned
- Locus's MCP-first design is the right shape for agent payments — discovery + auth in one Bearer header
- Path resolvers (Webpack, Tailwind v4) all break on `#` in the cwd; Turbopack + Tailwind v3 sidestep this
- The "agent trace" UX is the actual hero feature: judges want to *see* the agent decide, not just see the outcome

## Built with
`next`, `react`, `@anthropic-ai/sdk`, `@anthropic-ai/claude-agent-sdk`, `tailwindcss`, `typescript`

## Tags
`AI` `Agentic Payments` `USDC` `Base` `Locus` `Next.js` `Anthropic`

## Links

- Live demo: **[FILL IN AFTER VERCEL DEPLOY]**
- GitHub repo: **[FILL IN AFTER PUSH]**
- Demo video (90s): **[FILL IN AFTER RECORDING]**

## Cover image
Use a clean screenshot of `/dashboard` showing real numbers (revenue, costs, profit, audit log). The seed data already populates 6 orders so it looks busy.
