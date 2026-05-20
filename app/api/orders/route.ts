import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/ledger";
import { getService } from "@/lib/services";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { serviceId?: string; input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const serviceId = (body.serviceId ?? "").toString();
  const input = (body.input ?? "").toString().trim();
  if (!serviceId || !input) {
    return NextResponse.json(
      { error: "serviceId and input are required" },
      { status: 400 },
    );
  }
  const service = getService(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Unknown service" }, { status: 400 });
  }
  if (input.length > 16_000) {
    return NextResponse.json(
      { error: "Input too long (16k char max)" },
      { status: 400 },
    );
  }
  const order = createOrder({
    serviceId,
    priceUSD: service.priceUSD,
    input,
  });
  return NextResponse.json({ id: order.id });
}
