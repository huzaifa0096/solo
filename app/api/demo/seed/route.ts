import { NextRequest, NextResponse } from "next/server";
import { ensureSeedData } from "@/lib/seed";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const force = req.nextUrl.searchParams.get("force") === "1";
  const result = ensureSeedData(force);
  return NextResponse.json(result);
}

export const GET = POST;
