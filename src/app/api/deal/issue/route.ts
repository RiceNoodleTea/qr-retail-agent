import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { recordEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { sessionId?: string; productId?: string; minutesValid?: number }
    | null;

  const sessionId =
    body?.sessionId ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
  const productId = body?.productId ?? "chronos-elite";
  const minutesValid =
    typeof body?.minutesValid === "number" ? body.minutesValid : 15;

  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + minutesValid * 60_000).toISOString();

  await recordEvent({
    type: "deal_issued",
    sessionId,
    at: now.toISOString(),
    productId,
    token,
    expiresAt,
  });

  return NextResponse.json({
    sessionId,
    productId,
    token,
    expiresAt,
    qrPayload: JSON.stringify({
      t: token,
      s: sessionId,
      p: productId,
      exp: expiresAt,
    }),
    terms:
      "In-store only. Redeem at the counter before expiry. One-time use. May require showing the product at checkout.",
  });
}

