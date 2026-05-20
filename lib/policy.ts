import { pnlSummary } from "./ledger";

export interface AgentPolicy {
  dailySpendCapUSD: number;
  vendorAllowlist: string[];
  perOrderMaxCostUSD: number;
}

export function loadPolicy(): AgentPolicy {
  const cap = Number(process.env.SOLO_DAILY_SPEND_CAP_USD ?? "20");
  const allow = (process.env.SOLO_VENDOR_ALLOWLIST ?? "anthropic")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return {
    dailySpendCapUSD: Number.isFinite(cap) ? cap : 20,
    vendorAllowlist: allow,
    perOrderMaxCostUSD: 1.5,
  };
}

export type PolicyDecision =
  | { ok: true }
  | { ok: false; reason: string; code: "BUDGET_EXHAUSTED" | "VENDOR_BLOCKED" | "PER_ORDER_CAP" };

export function checkSpend(args: {
  vendor: string;
  estimatedUSD: number;
}): PolicyDecision {
  const policy = loadPolicy();
  const vendor = args.vendor.toLowerCase();

  if (!policy.vendorAllowlist.includes(vendor)) {
    return {
      ok: false,
      code: "VENDOR_BLOCKED",
      reason: `Vendor "${args.vendor}" is not in the agent's Locus allowlist (${policy.vendorAllowlist.join(", ")}).`,
    };
  }

  if (args.estimatedUSD > policy.perOrderMaxCostUSD) {
    return {
      ok: false,
      code: "PER_ORDER_CAP",
      reason: `Per-order cost cap of $${policy.perOrderMaxCostUSD.toFixed(2)} would be exceeded (estimate $${args.estimatedUSD.toFixed(2)}).`,
    };
  }

  const { spendToday } = pnlSummary();
  if (spendToday + args.estimatedUSD > policy.dailySpendCapUSD) {
    return {
      ok: false,
      code: "BUDGET_EXHAUSTED",
      reason: `Daily Locus spend cap of $${policy.dailySpendCapUSD.toFixed(2)} would be exceeded. Spent so far today: $${spendToday.toFixed(2)}.`,
    };
  }

  return { ok: true };
}
