# Add the track application — Solo applies to the only Week 4 track.
. (Join-Path $PSScriptRoot 'devfolio.ps1')
Devfolio-Init | Out-Null

$application = @'
Solo is exactly the **"agent-operated digital services business"** the track description calls out — a Claude-powered solopreneur that accepts orders (Locus Checkout), fulfills them autonomously using a wrapped API provider (Anthropic via the Anthropic SDK), and settles payment end-to-end through Locus (vendor=anthropic, on-allowlist, within budget caps).

**What makes it forget there was no person running it:**

- **Real revenue, real costs, real profit.** Every customer dollar lands in the agent's Locus wallet; every Anthropic API cent flows back out through Locus. The public P&L dashboard at `/dashboard` shows the books in real time.
- **The policy layer is the differentiator, not an afterthought.** The `/demo` page lets judges deliberately attempt bad spends and watch Locus block them. Without that layer, a single jailbroken prompt could drain the wallet — with it, Solo is safe to leave running.
- **The agent narrates itself.** The order page streams every reasoning step the agent takes — estimate, policy check, API call, settlement — so the full closed loop is visible per order.
- **Buildable as a unit.** The architecture (`lib/agent.ts`, `lib/policy.ts`, `lib/locus.ts`) means the same template could spin up new agent-operated businesses on demand — the LocusFounder thesis of treating businesses as ephemeral, deployable units.
'@

$update = @{
    hackathonSlug = 'paygentic-week4'
    projectSlug = 'solo-5a5e'
    commitMessage = 'Apply to LocusFounder track'
    tracksToApplyTo = @(
        @{
            trackUUID = '7197c323233f4c2f824f89939eeb2ff3'
            application = $application
        }
    )
}

try { Devfolio-Tool -Name 'updateHackathonProject' -Arguments $update } catch { "ERROR: $_" }
