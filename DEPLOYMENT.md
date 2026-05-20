# Deployment guide

Solo is plain Next.js — any host that runs Node 18+ with file-system write
access will work. Vercel is the fastest path.

## Vercel (recommended)

```powershell
# One-time install
pnpm dlx vercel login

# From the project root
pnpm dlx vercel
```

Choose:
- Set up & deploy: `Yes`
- Scope: your personal account
- Link to existing project: `No`
- Project name: `solo`
- Directory: `./`
- Override settings: `No`

Vercel auto-detects Next.js. After the first deploy you'll get a preview URL.
Add the environment variables in the Vercel dashboard (Settings → Environment Variables):

| Variable | Value |
|---|---|
| `LOCUS_API_KEY` | from your Locus developer dashboard |
| `LOCUS_MCP_URL` | `https://mcp.paywithlocus.com/mcp` |
| `ANTHROPIC_API_KEY` | from console.anthropic.com |
| `SOLO_AGENT_WALLET` | your agent's Locus wallet address (on Base) |
| `SOLO_DAILY_SPEND_CAP_USD` | `20` (start small) |
| `SOLO_VENDOR_ALLOWLIST` | `anthropic` |
| `NEXT_PUBLIC_SITE_URL` | your Vercel URL, e.g. `https://solo.vercel.app` |

Then redeploy: `pnpm dlx vercel --prod`.

## Important — the ledger

Solo writes to `solo.db.json` in the working directory. On Vercel's serverless
runtime, this is **ephemeral**: each function invocation gets a fresh
container, so the ledger won't persist between requests.

Two options for the hackathon:

**A — Self-host on a VPS (Fly.io, Railway, Render).** They give you a persistent
disk. Same `pnpm dev` command works; just deploy as a Node service. This is
what I'd do for the actual demo.

**B — Move the ledger to a hosted Postgres** (Neon, Supabase). The public API
of `lib/ledger.ts` stays the same; swap the JSON file with `pg` / `postgres`.
Half an hour of work.

For the hackathon submission, I recommend **Railway** — fastest VPS-style
deploy with persistent storage:

```powershell
pnpm dlx @railway/cli login
pnpm dlx @railway/cli init
pnpm dlx @railway/cli up
```

## Local production test

```powershell
pnpm build
pnpm start
```

Make sure the production build works before deploying.

## DNS / sharing

When you have the live URL, update:
- `NEXT_PUBLIC_SITE_URL` in env (so OG metadata uses the real URL)
- README.md (top of file)
- SUBMISSION.md (the "Live demo" line)
- Devfolio project page
- Pinned message in Locus Discord #show-and-tell
