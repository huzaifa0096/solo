/**
 * DEMO-MODE payment confirmation.
 *
 * When LOCUS_API_KEY is not set, the checkout flow routes here instead of to
 * Locus Checkout. This endpoint marks the order as paid, records the inbound
 * revenue, and kicks off fulfilment — exactly the same hooks the real Locus
 * webhook would fire.
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrder, markOrderPaid, recordTxn } from "@/lib/ledger";
import { fulfillOrder } from "@/lib/agent";
import { isDemoMode } from "@/lib/locus";

export const runtime = "nodejs";

async function handle(req: NextRequest): Promise<NextResponse> {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: "Simulator disabled when LOCUS_API_KEY is set" },
      { status: 400 },
    );
  }
  const orderId =
    req.nextUrl.searchParams.get("order") ??
    (await req.json().catch(() => ({ order: undefined as string | undefined })))
      .order;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }
  const order = getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status === "pending_payment") {
    const ref = `demo-tx-${order.id.slice(0, 8)}`;
    markOrderPaid(order.id, ref);
    recordTxn({
      orderId: order.id,
      kind: "revenue",
      direction: "in",
      vendor: "customer",
      amountUSD: order.priceUSD,
      memo: `USDC in · order ${order.id.slice(0, 8)} · [DEMO]`,
      onchainRef: ref,
    });
  }
  // Kick fulfilment in the background — don't block the redirect/response.
  void fulfillOrder(orderId).catch((err) => {
    console.error("fulfillment error", err);
  });
  // Redirect for GET (browser), JSON for POST (programmatic).
  if (req.method === "GET") {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${site}/order/${orderId}`);
  }
  return NextResponse.json({ ok: true, orderId });
}

export const GET = handle;
export const POST = handle;
