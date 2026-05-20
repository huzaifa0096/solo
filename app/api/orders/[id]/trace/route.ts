import { NextResponse } from "next/server";
import { getOrder, getTrace } from "@/lib/ledger";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    status: order.status,
    deliveredAt: order.deliveredAt ?? null,
    trace: getTrace(id),
  });
}
