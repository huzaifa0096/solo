import { NextResponse } from "next/server";
import { pnlSummary, recentTxns, recentOrders } from "@/lib/ledger";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    pnl: pnlSummary(),
    recentOrders: recentOrders(15),
    recentTxns: recentTxns(30),
  });
}
