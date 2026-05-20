/**
 * Locus client — wraps the Locus MCP server for the Solo agent.
 *
 * Two surfaces:
 *  1. `createCheckout` — produce a USDC checkout URL the customer pays into.
 *  2. `settleVendorPayment` — agent pays a vendor (e.g. Anthropic) out of its
 *     own Locus wallet for API costs it incurred fulfilling an order.
 *
 * In DEMO_MODE (no LOCUS_API_KEY set) both calls simulate cleanly so the rest
 * of the app — checkout flow, fulfillment, dashboard — can be exercised end
 * to end without real credentials. Once LOCUS_API_KEY is set, the same calls
 * route through the real MCP server.
 */

export const LOCUS_MCP_URL =
  process.env.LOCUS_MCP_URL ?? "https://mcp.paywithlocus.com/mcp";

export function isDemoMode(): boolean {
  const k = process.env.LOCUS_API_KEY;
  return !k || k.startsWith("replace-with") || k === "your-locus-api-key";
}

export interface CheckoutResponse {
  checkoutUrl: string;
  reference: string;
  demo: boolean;
}

export async function createCheckout(args: {
  orderId: string;
  amountUSD: number;
  memo: string;
  successUrl: string;
}): Promise<CheckoutResponse> {
  if (isDemoMode()) {
    // Demo mode: route the user back to our own /api/payments/simulate to
    // mark the order as paid. Real flow would hit Locus checkout.
    const u = new URL("/api/payments/simulate", siteUrl());
    u.searchParams.set("order", args.orderId);
    return {
      checkoutUrl: u.toString(),
      reference: `demo-${args.orderId}`,
      demo: true,
    };
  }

  const res = await callLocusTool("create_checkout", {
    amount_usd: args.amountUSD,
    memo: args.memo,
    metadata: { order_id: args.orderId },
    success_url: args.successUrl,
  });

  const url = pickString(res, [
    "checkout_url",
    "url",
    "hosted_url",
    "payment_link",
  ]);
  const reference = pickString(res, ["id", "reference", "checkout_id"]);
  if (!url) {
    throw new Error(
      `Locus create_checkout did not return a URL. Raw response: ${JSON.stringify(
        res,
      ).slice(0, 400)}`,
    );
  }
  return { checkoutUrl: url, reference: reference ?? args.orderId, demo: false };
}

export interface SettlementResult {
  onchainRef?: string;
  demo: boolean;
}

export async function settleVendorPayment(args: {
  vendor: string;
  amountUSD: number;
  memo: string;
  orderId: string;
}): Promise<SettlementResult> {
  if (isDemoMode()) {
    return { demo: true };
  }
  const res = await callLocusTool("send_payment", {
    vendor: args.vendor,
    amount_usd: args.amountUSD,
    memo: args.memo,
    metadata: { order_id: args.orderId },
  });
  const onchainRef = pickString(res, ["tx_hash", "onchain_ref", "hash"]);
  return { onchainRef, demo: false };
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function pickString(
  obj: unknown,
  keys: string[],
): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of keys) {
    const v = (obj as Record<string, unknown>)[k];
    if (typeof v === "string" && v.length) return v;
  }
  return undefined;
}

/**
 * Generic JSON-RPC call to the Locus MCP server.
 *
 * Locus exposes payment primitives as MCP tools, so we hit the standard MCP
 * `tools/call` method. The exact tool names (e.g. `send_payment`,
 * `create_checkout`) are discovered at runtime via `tools/list` — here we
 * call by name and let the server surface a clear error if a tool isn't
 * available, which the caller upstream catches and converts to a refund.
 */
async function callLocusTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const body = {
    jsonrpc: "2.0",
    id: cryptoRandomId(),
    method: "tools/call",
    params: { name: toolName, arguments: args },
  };
  const res = await fetch(LOCUS_MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOCUS_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Locus MCP ${toolName} failed (${res.status}): ${text.slice(0, 400)}`,
    );
  }
  const json = (await res.json()) as {
    result?: { content?: Array<{ type: string; text?: string }> };
    error?: { message?: string };
  };
  if (json.error) {
    throw new Error(`Locus MCP ${toolName} error: ${json.error.message}`);
  }
  const text = json.result?.content?.find((c) => c.type === "text")?.text;
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }
  return json.result ?? {};
}

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2);
}
