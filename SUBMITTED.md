# Devfolio draft submitted ✅

The Solo project has been created on Devfolio as a **draft** and seeded with
nearly everything. You review and hit publish.

## Current state

**Project URL (Devfolio):** https://devfolio.co/projects/solo-5a5e
**Hackathon dashboard:** https://paygentic-week4.devfolio.co/dashboard
**Project slug:** `solo-5a5e`
**Status:** draft (your call when to publish)

| Field | Status |
|---|---|
| Name | ✅ `Solo` |
| Tagline | ✅ `A SaaS where the CEO is an AI.` |
| Problem story (problemSolved) | ✅ filled |
| Challenges story (challengesSurmounted) | ✅ filled |
| Hashtags (9) | ✅ React, Next.js, TypeScript, USDC, Base, Anthropic, Claude, MCP, Locus |
| Platforms | ✅ Web |
| Pictures (5 screenshots) | ✅ landing, /demo, /dashboard, /order with trace, /story |
| Links | ✅ hackathon + paywithlocus.com |
| Video URL | ⛔ blank — you record (see `VIDEO_SCRIPT.md`) |
| Track application | ⛔ Devfolio MCP returned an upstream "OK is not valid JSON" error every retry — known bug their side. **Manually apply via web UI**: see steps below. |
| GitHub link | ⛔ no public repo yet — see steps below. Local commits ready to push. |
| Live demo link | ⛔ not deployed — see `DEPLOYMENT.md`. |

## What you must do before publishing (in priority order)

### 1. Apply to the track on the web UI (5 minutes)
The track is the only one for Week 4 — **"Using LocusFounder to Build a Business!"** — $600 / $300 / $100 prizes.

1. Open https://devfolio.co/projects/solo-5a5e/edit
2. Scroll to the **Tracks** section
3. Click "Apply" on the Week 4 track
4. Paste the application text from `SUBMISSION.md` → "Track application" section, or use this:

> Solo is exactly the "agent-operated digital services business" the track description calls out — a Claude-powered solopreneur that accepts orders (Locus Checkout), fulfills them autonomously using a wrapped API provider (Anthropic via the Anthropic SDK), and settles payment end-to-end through Locus (vendor=anthropic, on-allowlist, within budget caps). What makes it forget there was no person running it: real revenue and real costs both flow through Locus; the policy layer (cap + allowlist) is the differentiator demonstrated live on `/demo`; the agent narrates every decision on the order page; and the architecture means the same template can spin up new businesses on demand — the LocusFounder thesis of treating businesses as ephemeral, deployable units.

5. Save.

### 2. Push code to a public GitHub repo (10 minutes)
The repo is already initialized and committed locally. You only need to create the remote and push.

```powershell
# In a fresh PowerShell window
cd "D:\Locus' Paygentic Hackathon - #4"

# Open https://github.com/new in your browser, create a PUBLIC repo named "solo".
# Don't initialize with a README. Then come back and run:

git remote add origin https://github.com/<YOUR_USERNAME>/solo.git
git push -u origin main
```

Then add the link to the Devfolio project: edit page → "Links" → add `https://github.com/<YOUR_USERNAME>/solo`.

### 3. Deploy publicly (30 minutes)
Follow `DEPLOYMENT.md`. Railway is recommended (the JSON-file ledger needs persistent disk).

Once deployed, add the URL to:
- Devfolio "Links" section
- `NEXT_PUBLIC_SITE_URL` in your env on Railway (so OG metadata uses the real URL)

### 4. Record the 90-second demo video (60 minutes)
Follow `VIDEO_SCRIPT.md`. Upload unlisted to YouTube. Add the URL to:
- Devfolio "Video" field
- README

### 5. Final review + publish
1. Open https://devfolio.co/projects/solo-5a5e/edit
2. Confirm: name, tagline, story, screenshots, hashtags, links, video, track application
3. Click **Save & Publish**
4. Verify it appears at https://paygentic-week4.devfolio.co/projects

**Do this at least 6 hours before the deadline (May 25, 11:59 PM PT = May 26, 11:59 AM PKT).**

## Optional but powerful (do if you have time)

- **Discord visibility:** Join discord.gg/locus → post in #show-and-tell with a 1-line hook, screenshot, and link to the live demo. Tag judges politely.
- **Pre-fund the agent wallet** with ~$5 of real USDC on Base and run one real order in your demo video — irrefutable proof.
- **Tweet Solo's first day P&L** — even one post drives traffic. "Day 1: 6 orders. $20 revenue. $2.42 spent. 88% margin. The agent ran itself."
- **A second screenshot of the /demo policy-blocked state** — showing red "BLOCKED · VENDOR_BLOCKED" — makes the story visceral.

## What I did automatically

- Created the Devfolio project (`createHackathonProject`)
- Uploaded all 5 screenshots via signed URLs
- Filled name, tagline, hashtags, platforms, pictures, links, problem story, challenges story
- Committed each change with a meaningful commit message (visible on the project's submission history)
- Initialized the local git repo, made the first commit
- Verified the project state via `getMyHackathonProject`

## Quick reference

```
Project slug:    solo-5a5e
Track UUID:      7197c323233f4c2f824f89939eeb2ff3
Hackathon slug:  paygentic-week4
Deadline:        2026-05-26 06:59 UTC (= May 25 11:59 PM PT = May 26 11:59 AM PKT)
```

**Files for the steps above:**
- `SUBMISSION.md` — the Devfolio write-up (still useful as a single source of truth)
- `DEPLOYMENT.md` — Vercel / Railway deploy guide
- `VIDEO_SCRIPT.md` — 90-second demo storyboard
- `CHECKLIST.md` — full 5-day plan
