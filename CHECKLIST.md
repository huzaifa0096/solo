# Pre-submission checklist

Today is 2026-05-20. Deadline: **2026-05-25** (confirm exact time on Locus Discord).

Tick these off before submitting. Each one moves win-probability meaningfully.

## Day 0 — today (most urgent)

- [ ] **Join Locus Discord** (https://discord.gg/locus). Lurk for an hour, read #announcements and #show-and-tell.
- [ ] **Confirm submission deadline** — exact time + timezone. DM a mod or check pinned messages.
- [ ] **Clarify the Week 4 theme** — politely ask in #general or DM Cole/Wes:
  > "Quick clarification — does 'Using LocusFounder to build a business' mean projects must use the LocusFounder SMS agent specifically, or build on Locus rails generally? I want to make sure my submission hits the brief."
- [ ] **Sign up at paywithlocus.com** and get your API key.
- [ ] **Get Anthropic API key** from console.anthropic.com (if you don't have one).
- [ ] Drop both keys into `.env`. Run `pnpm dev` and place a real order end to end.

## Day 1 — tomorrow

- [ ] Fix anything that broke under real keys (likely the Locus MCP tool names — `create_checkout` and `send_payment` are educated guesses; the real names may differ. Find them via `tools/list` on the MCP server, then update `lib/locus.ts`).
- [ ] Deploy to **Railway** (preferred — persistent disk) or Vercel. See `DEPLOYMENT.md`.
- [ ] Set the deployed URL as `NEXT_PUBLIC_SITE_URL`.
- [ ] Hit the live URL, run one paid order, screenshot the dashboard with real numbers.

## Day 2

- [ ] If the theme is literal "LocusFounder" — add a flow where you SMS LocusFounder to spawn a Solo service. (Likely your write-up reframes it: "I asked LocusFounder to build me an AI-owned SaaS, this is what it would have generated.")
- [ ] Polish: animations, typos, copy.
- [ ] Stress-test the `/demo` policy page — every scenario clicks and returns expected results.

## Day 3 — video day

- [ ] Record the 90-second demo per `VIDEO_SCRIPT.md`.
- [ ] Upload unlisted to YouTube. Grab the link.
- [ ] Post in Discord #show-and-tell — short intro, video link, live URL. Tag judges politely.

## Day 4

- [ ] Devfolio account → create project → paste `SUBMISSION.md` content → upload cover image → save as draft.
- [ ] Get one other person to load the live URL and try to break it. Fix what they find.
- [ ] Final pass: spelling, mobile layout, edge cases.

## Day 5 — submit (with buffer)

- [ ] **At least 6 hours before the deadline:** submit on Devfolio. Don't wait for the wire.
- [ ] Post submission link in Discord.
- [ ] Confirm submission shows on https://paygentic-week4.devfolio.co/projects.

---

## Win-amplifier moves (do these if you have time)

- [ ] Wire up a **public Twitter/X bot** that tweets Solo's daily P&L. (Even mocked — schedule a few pre-written tweets.)
- [ ] Add a **"Hire Solo" CTA** for B2B — implies the platform could scale.
- [ ] Build a **shareable "deliverable" link** — each order's deliverable has a "share on X" button.
- [ ] Pre-fund the agent wallet with ~$5 of real USDC on Base. **Demonstrate the real on-chain transaction** in the video — that's irrefutable proof.
- [ ] After submission, **show up to the judging call** (if there is one) with the live URL open.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Locus MCP tool names differ from my guess | Find real names via `tools/list` early; the wrapper in `lib/locus.ts` is small and easy to update |
| Anthropic isn't a Locus-supported vendor for direct settlement | Reframe: Locus tracks the *budget allocation*, actual API billing is via Anthropic's normal channel. Same audit story. |
| Deadline missed by misread timezone | Submit 6 hours early |
| Judges think it's "just a website" | The video proves the live on-chain settlement happening |
| Theme is literally LocusFounder | Reframe write-up: "I would have used LocusFounder to ship this — Solo is exactly what it would build" |
