import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    sessionId: string;
    productId: string;
    summary: string;
  };

  if (!body?.sessionId || !body?.productId || !body?.summary) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  await recordEvent({
    type: "staff_ping",
    sessionId: body.sessionId,
    at: new Date().toISOString(),
    productId: body.productId,
    summary: body.summary,
  });

  return NextResponse.json({ ok: true });
}

