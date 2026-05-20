# Demo video script — 90 seconds

Record at **1080p, 30fps**. Use OBS, Loom, or QuickTime + ScreenFlow. No mic noise — record voiceover separately if possible, then mix.

The goal: in 90 seconds, prove the closed loop is real, and prove Locus's control layer makes it possible. No fluff.

---

## Shot list (with on-screen action + voiceover)

### 0:00–0:08 · Hook
**Screen:** Landing page hero with animated stats counting up.

**VO:**
> "This is a SaaS. The CEO is an AI. Real customers pay it real money. It pays for its own infrastructure. And it doesn't go bankrupt — because of Locus."

### 0:08–0:25 · Customer pays
**Screen:** Click on "AI Code Review" → paste a snippet of vulnerable code → click "Pay $3 USDC".

**VO:**
> "Someone wants a code review. They pay 3 USDC on Base. The funds land in Solo's Locus wallet."

**Screen:** Checkout page → "Simulate payment" (or, in real mode, real Locus checkout) → redirect to order page.

### 0:25–0:50 · Agent reasons live (THE moment)
**Screen:** Order page, status moves through "paid → fulfilling". The agent log fills in real time with policy events:
- *"Estimating Anthropic API cost: ~0.32 USD"*
- *"Locus policy check: daily cap $20, vendor allowlist [anthropic], per-order cap $1.50"*
- *"Policy passed — proceeding to Anthropic"*
- *"Settling Anthropic API cost via Locus: paying anthropic $0.31"*
- *"Deliverable shipped to customer"*

**VO:**
> "Watch the agent think. It estimates the cost. Locus checks the policy: is the vendor allowlisted? Is the spend under the cap? Only then does the agent call Claude. When the call returns, the agent settles the cost back through Locus. Every step on the audit trail."

### 0:50–1:05 · The deliverable
**Screen:** Scroll down to show the rendered Markdown deliverable with the agent's review.

**VO:**
> "The customer gets a real review. Solo earned 3 USDC. It spent about 31 cents on Anthropic. Profit, 2.69 USDC. All visible, all on-chain."

### 1:05–1:25 · The differentiator
**Screen:** Navigate to `/demo`. Click "Try to pay an unallowlisted vendor (OpenAI)" → red "BLOCKED" appears. Click "Spend more than daily cap" → red "BLOCKED" appears.

**VO:**
> "Now here's why Locus is the only payment infrastructure that makes this safe. Try to make Solo pay OpenAI — blocked, not on the allowlist. Try to drain it with one massive call — blocked, over the daily cap. Bad prompts hit the wall, not the wallet."

### 1:25–1:30 · Close
**Screen:** Navigate to `/dashboard`. P&L stats animate. Audit log scrolls.

**VO:**
> "Solo. An AI running its own business. Built on Locus, because that's the only place it could exist."

---

## Editing notes

- Cut hard between shots — no slow transitions
- Subtitles on for everything (judges may watch muted in Discord)
- End frame: just the URL of your live deployment, big, centered
- Total length cap: **95 seconds max**. Trim VO if needed; cut shot 4 first.

## Upload plan

1. YouTube unlisted (preferred — supports Devfolio embed)
2. Backup: Loom public link
3. Add link to README, SUBMISSION.md, and Devfolio project page
