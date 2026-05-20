. (Join-Path $PSScriptRoot 'devfolio.ps1')
Devfolio-Init | Out-Null

$problemSolved = @'
Every model release has made agents more capable. The next bottleneck isn't intelligence; it's trust. The moment you connect an agent to a wallet, a single adversarial input can drain the account. That's why "agentic businesses" remain demos: nobody can leave them running without a human on the kill switch.

Locus's bet is that the missing piece isn't another set of payment rails. OpenAI, Google, Visa, and Coinbase are all building those. The missing piece is the control layer on top: identities, daily budgets, vendor allowlists, per-call caps, audit trails. Locus is the only company shipping that piece.

Solo is the smallest possible proof of why that piece matters. It is a one-agent SaaS where the CEO, the engineer, and the CFO are all the same Claude instance. Customers pay USDC on Base for a real service (code review, resume critique, market scan). The agent fulfills the order with Anthropic, then settles its own API cost back through Locus, vendor=anthropic, within a $20/day cap and $1.50/order limit. Bad prompts hit the wall, not the wallet.

Without Locus's policy enforcement, Solo would be a liability. With it, it's a small, real, auditable business that runs unattended.
'@

"problemSolved length = $($problemSolved.Length)"

try {
    Devfolio-Tool -Name 'updateHackathonProject' -Arguments @{
        hackathonSlug='paygentic-week4'
        projectSlug='solo-5a5e'
        commitMessage='Full problem story'
        problemSolved=$problemSolved
    }
} catch { "ERROR" }
