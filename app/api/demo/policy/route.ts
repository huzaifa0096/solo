/**
 * Policy-in-action demo endpoint.
 *
 * Lets judges trigger specific failure modes and watch Locus's control layer
 * intercept them. None of these execute a real spend — they exercise the
 * policy module in isolation to surface the rejection.
 */

import { NextRequest, NextResponse } from "next/server";
import { checkSpend, loadPolicy } from "@/lib/policy";

export const runtime = "nodejs";

interface Scenario {
  id: string;
  label: string;
  vendor: string;
  estimatedUSD: number;
}

const SCENARIOS: Record<string, Scenario> = {
  "blocked-vendor": {
    id: "blocked-vendor",
    label: "Try to pay an unallowlisted vendor (OpenAI)",
    vendor: "openai",
    estimatedUSD: 0.5,
  },
  "per-order-cap": {
    id: "per-order-cap",
    label: "Try to spend more than per-order cap on a single call",
    vendor: "anthropic",
    estimatedUSD: 3.0,
  },
  "daily-cap": {
    id: "daily-cap",
    label: "Try to blow through the daily spending cap",
    vendor: "anthropic",
    estimatedUSD: 100.0,
  },
  "allowed-spend": {
    id: "allowed-spend",
    label: "A normal, within-policy spend",
    vendor: "anthropic",
    estimatedUSD: 0.4,
  },
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { scenario?: string };
  const s = SCENARIOS[body.scenario ?? ""];
  if (!s) {
    return NextResponse.json(
      { error: "Unknown scenario", scenarios: Object.keys(SCENARIOS) },
      { status: 400 },
    );
  }
  const policy = loadPolicy();
  const decision = checkSpend({
    vendor: s.vendor,
    estimatedUSD: s.estimatedUSD,
  });
  return NextResponse.json({
    scenario: s,
    policy: {
      dailyCapUSD: policy.dailySpendCapUSD,
      perOrderCapUSD: policy.perOrderMaxCostUSD,
      vendorAllowlist: policy.vendorAllowlist,
    },
    decision,
  });
}

export async function GET() {
  return NextResponse.json({ scenarios: Object.values(SCENARIOS) });
}
