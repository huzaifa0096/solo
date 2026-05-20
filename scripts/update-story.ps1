# Update the existing draft with full story content (problemSolved + challengesSurmounted)
# and the track application.
. (Join-Path $PSScriptRoot 'devfolio.ps1')
Devfolio-Init | Out-Null

$problemSolved = @'
Every model release has made agents more capable. The next bottleneck isn't intelligence; it's trust. The moment you connect an agent to a wallet, a single adversarial input — a confused customer prompt, a jailbreak, a runaway loop — can drain the account. That's why "agentic businesses" remain demos: nobody can leave them running without a human on the kill switch.

Locus's bet is that the missing piece isn't another set of payment rails — OpenAI, Google, Visa, and Coinbase are all building those — it's the **control layer** on top: identities, daily budgets, vendor allowlists, per-call caps, audit trails. Locus is the only company shipping that piece.

Solo is the smallest possible proof of why that piece matters. It's a one-agent SaaS where the CEO, the engineer, and the CFO are all the same Claude instance. Customers pay USDC on Base for a real service (code review, resume critique, market scan). The agent fulfills the order with Anthropic, then settles its own API cost back through Locus — vendor=anthropic, within a $20/day cap and $1.50/order limit. Bad prompts hit the wall, not the wallet.

Without Locus's policy enforcement, Solo would be a liability. With it, it's a small, real, auditable business that runs unattended.
'@

$challenges = @'
**1. Designing the trust boundary.** Most agentic-payment demos show one side: agent receives money OR agent spends money. Closing the loop required treating Anthropic as a *vendor* whose payment goes through Locus, not a side-billed service. The agent's policy check runs *before* any spend, on every call.

**2. Making policy violations visible.** Judges shouldn't have to take "our agent respects the cap" on faith. I built `/demo` — an interactive page that fires policy violations on demand (try paying OpenAI, try a $100 call, try a $0.40 call) and shows the Locus rejection in real time. The control layer made tangible.

**3. The agent-reasoning trace.** When an order is fulfilling, the order page streams every agent decision live — "estimating Anthropic API cost", "running Locus policy check", "vendor=anthropic on allowlist", "settling $0.31 via Locus", "deliverable shipped". This is what trustworthy agent execution looks like.

**4. Cwd with a `#` character broke half the JS toolchain.** Webpack's RSC bundler treats `#` as a URL fragment and crashes on module manifest stringification. Tailwind v4's CSS importer injects a null byte before `#`. Solved by switching to Turbopack and Tailwind v3 — a clean swap that turned hours of build errors into a working pipeline.

**5. Demo-readiness without real keys.** The whole pipeline works without a Locus API key or Anthropic key — the seed loads 6 historical orders with realistic numbers, the simulate endpoint marks orders paid, and the agent generates a stub deliverable explaining what real mode would produce. Reviewers can click through the entire customer journey before deciding to wire up real credentials.
'@

$update = @{
    hackathonSlug = 'paygentic-week4'
    projectSlug = 'solo-5a5e'
    commitMessage = 'Add story: problem and challenges'
    problemSolved = $problemSolved
    challengesSurmounted = $challenges
}

try { Devfolio-Tool -Name 'updateHackathonProject' -Arguments $update } catch { "ERROR: $_" }
