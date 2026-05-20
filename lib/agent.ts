/**
 * The Solo agent runtime.
 *
 * Lifecycle for a single paid order:
 *   1. Verify the order is in 'paid' state.
 *   2. Run the policy check (daily spend cap, vendor allowlist).
 *   3. Estimate the Anthropic cost for the deliverable.
 *   4. Call Anthropic to produce the deliverable.
 *   5. Compute *actual* cost from the response usage.
 *   6. Settle the Anthropic cost out of the agent's Locus wallet.
 *   7. Persist the deliverable + costs to the ledger.
 *
 * Every decision is written to the order's trace log so the order page
 * can replay the agent's reasoning live for judges.
 */

import Anthropic from "@anthropic-ai/sdk";
import { getService } from "./services";
import {
  appendTrace,
  getOrder,
  markOrderDelivered,
  markOrderFailed,
  markOrderFulfilling,
  recordTxn,
} from "./ledger";
import { checkSpend, loadPolicy } from "./policy";
import { settleVendorPayment } from "./locus";

const SOLO_MODEL = "claude-opus-4-7";

// Public Anthropic published prices for Claude Opus 4.x in USD per 1M tokens.
// Used to *estimate* spend before the call (for the policy check) and to
// *settle* the precise cost after the call. Conservative defaults.
const PRICE_PER_MTOK_INPUT = 15;
const PRICE_PER_MTOK_OUTPUT = 75;

function priceUSD(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * PRICE_PER_MTOK_INPUT +
    (outputTokens / 1_000_000) * PRICE_PER_MTOK_OUTPUT
  );
}

export interface FulfillmentResult {
  ok: boolean;
  deliverable?: string;
  costUSD: number;
  reason?: string;
}

export async function fulfillOrder(orderId: string): Promise<FulfillmentResult> {
  const order = getOrder(orderId);
  if (!order) {
    return { ok: false, costUSD: 0, reason: `Order ${orderId} not found.` };
  }
  if (order.status !== "paid") {
    return {
      ok: false,
      costUSD: 0,
      reason: `Order ${orderId} is in state '${order.status}', not 'paid'.`,
    };
  }
  const service = getService(order.serviceId);
  if (!service) {
    return {
      ok: false,
      costUSD: 0,
      reason: `Unknown service: ${order.serviceId}.`,
    };
  }

  markOrderFulfilling(order.id);
  appendTrace(order.id, "info", "Order picked up by Solo agent", `service=${service.name} · ${order.priceUSD.toFixed(2)} USDC received`);

  // Tiny pause so the trace feels readable in the live UI — not arbitrary
  // sleeps in production, just a UX choice for the demo replay.
  await tick();

  const estimatedInput = Math.max(800, Math.ceil(order.input.length / 4));
  const estimatedOutput = service.expectedTokens;
  const estimatedCost = priceUSD(estimatedInput, estimatedOutput);

  appendTrace(
    order.id,
    "spend",
    "Estimating Anthropic API cost before spending",
    `~${estimatedInput} in / ~${estimatedOutput} out tokens · estimated $${estimatedCost.toFixed(3)} on Claude Opus`,
  );
  await tick();

  const policy = loadPolicy();
  appendTrace(
    order.id,
    "policy",
    "Running Locus policy check",
    `daily cap $${policy.dailySpendCapUSD.toFixed(2)} · vendor allowlist [${policy.vendorAllowlist.join(", ")}] · per-order cap $${policy.perOrderMaxCostUSD.toFixed(2)}`,
  );
  await tick();

  const decision = checkSpend({ vendor: "anthropic", estimatedUSD: estimatedCost });
  if (!decision.ok) {
    appendTrace(order.id, "error", `Locus blocked the spend: ${decision.code}`, decision.reason);
    markOrderFailed(order.id, decision.reason);
    return {
      ok: false,
      costUSD: 0,
      reason: `Policy blocked: ${decision.reason}`,
    };
  }
  appendTrace(order.id, "policy", "Policy check passed — proceeding to Anthropic", `vendor=anthropic on allowlist · estimated spend within all caps`);
  await tick();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith("replace-with")) {
    // Demo path so the hackathon judges can see the flow even without keys.
    appendTrace(order.id, "warn", "ANTHROPIC_API_KEY not set — generating demo deliverable", "real mode would call Claude here; in demo we stub a deliverable to exercise the rest of the pipeline");
    const stub = demoDeliverable(service.name, order.input);
    const fakeCost = priceUSD(estimatedInput, estimatedOutput);
    appendTrace(order.id, "settle", "Settling vendor payment via Locus", `vendor=anthropic · amount $${fakeCost.toFixed(3)} · [DEMO]`);
    markOrderDelivered({ id: order.id, deliverable: stub, costUSD: fakeCost });
    recordTxn({
      orderId: order.id,
      kind: "cost",
      direction: "out",
      vendor: "anthropic",
      amountUSD: fakeCost,
      memo: `Anthropic API · ${service.name} · [DEMO]`,
    });
    appendTrace(order.id, "deliver", "Deliverable shipped to customer", `cost recorded · profit $${(order.priceUSD - fakeCost).toFixed(2)}`);
    return { ok: true, deliverable: stub, costUSD: fakeCost };
  }

  try {
    appendTrace(order.id, "info", "Calling Claude (Anthropic)…");
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: SOLO_MODEL,
      max_tokens: Math.min(service.expectedTokens, 8000),
      system: service.systemPrompt,
      messages: [
        {
          role: "user",
          content: `Order ${order.id} — paid $${order.priceUSD.toFixed(2)} USDC.\n\nCustomer input:\n${order.input}`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n\n");

    const inputTokens =
      response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0);
    const outputTokens = response.usage.output_tokens;
    const actualCost = priceUSD(inputTokens, outputTokens);
    appendTrace(
      order.id,
      "spend",
      "Claude returned — computing actual cost from metered usage",
      `${inputTokens} input · ${outputTokens} output tok · actual $${actualCost.toFixed(4)}`,
    );

    let onchainRef: string | undefined;
    try {
      appendTrace(order.id, "settle", "Settling Anthropic API cost via Locus", `paying vendor=anthropic $${actualCost.toFixed(4)} from agent wallet`);
      const settlement = await settleVendorPayment({
        vendor: "anthropic",
        amountUSD: actualCost,
        memo: `Anthropic API · order ${order.id}`,
        orderId: order.id,
      });
      onchainRef = settlement.onchainRef;
      if (onchainRef) {
        appendTrace(order.id, "settle", "Settled on Base", `tx=${onchainRef.slice(0, 14)}…`);
      } else {
        appendTrace(order.id, "settle", "Settlement recorded", "demo mode — no on-chain ref");
      }
    } catch (err) {
      // Settlement failure must not lose the customer their deliverable. We
      // record the cost as 'pending settlement' and surface it in the ledger.
      const msg = err instanceof Error ? err.message : String(err);
      appendTrace(order.id, "error", "Locus settlement failed — deliverable still shipped, cost recorded as pending", msg);
      recordTxn({
        orderId: order.id,
        kind: "cost",
        direction: "out",
        vendor: "anthropic",
        amountUSD: actualCost,
        memo: `Anthropic API · settlement failed: ${msg}`,
      });
      markOrderDelivered({ id: order.id, deliverable: text, costUSD: actualCost });
      return { ok: true, deliverable: text, costUSD: actualCost };
    }

    recordTxn({
      orderId: order.id,
      kind: "cost",
      direction: "out",
      vendor: "anthropic",
      amountUSD: actualCost,
      memo: `Anthropic API · ${inputTokens} in / ${outputTokens} out tok`,
      onchainRef,
    });
    markOrderDelivered({ id: order.id, deliverable: text, costUSD: actualCost });
    appendTrace(order.id, "deliver", "Deliverable shipped to customer", `profit $${(order.priceUSD - actualCost).toFixed(2)} · margin ${Math.round(((order.priceUSD - actualCost) / order.priceUSD) * 100)}%`);
    return { ok: true, deliverable: text, costUSD: actualCost };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    appendTrace(order.id, "error", "Fulfilment failed", reason);
    markOrderFailed(order.id, reason);
    return { ok: false, costUSD: 0, reason };
  }
}

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 350));
}

function demoDeliverable(serviceName: string, input: string): string {
  return [
    `# ${serviceName} — Solo deliverable (demo)`,
    "",
    `*This deliverable was generated in **DEMO mode** because no \`ANTHROPIC_API_KEY\` was set.*`,
    `In production, the Solo agent calls Claude with a service-specific system`,
    `prompt, then settles the API cost from its Locus wallet — all visible in`,
    `the audit log on the dashboard.`,
    "",
    `## Echo of customer input`,
    "```",
    input.slice(0, 1200),
    "```",
    "",
    `## What you'd see with a real key`,
    "- a scored verdict",
    "- 3 highest-impact edits with before/after",
    "- structured findings, no padding",
    "",
    `Set \`ANTHROPIC_API_KEY\` in \`.env\` and re-run an order to see the real output.`,
  ].join("\n");
}
