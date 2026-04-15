import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { buildTools } from "@/app/api/chat/tools";
import { loadSkillPrompts } from "@/agent/skillLoader";
import { recordEvent } from "@/lib/analytics";

export const runtime = "nodejs";

type IncomingMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequest = {
  sessionId?: string;
  productId?: string;
  locale?: string;
  mode?: "deals" | "compare" | "reviews" | "find";
  messages: IncomingMessage[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;

  const sessionId =
    body.sessionId ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
  const productId = body.productId ?? "chronos-elite";

  const skills = await loadSkillPrompts();
  const tools = buildTools();

  await recordEvent({
    type: "session_start",
    sessionId,
    at: new Date().toISOString(),
    productId,
    userAgent: req.headers.get("user-agent") ?? undefined,
    locale: body.locale,
  });

  const system = [
    "You are an in-store retail assistant. Be concise, helpful, and mobile-friendly.",
    "You can call tools to fetch reviews, compare products, check stock, issue deal QR codes, suggest bundles, ping staff, and guide checkout.",
    body.mode ? `The user selected mode: ${body.mode}.` : "",
    "",
    "Agent skills:",
    skills.Compare ? `\n[Compare]\n${skills.Compare}` : "",
    skills.Quote ? `\n[Quote]\n${skills.Quote}` : "",
    skills.Bundle ? `\n[Bundle]\n${skills.Bundle}` : "",
    skills.DealQR ? `\n[DealQR]\n${skills.DealQR}` : "",
    skills.StockPulse ? `\n[StockPulse]\n${skills.StockPulse}` : "",
    skills.StaffPing ? `\n[StaffPing]\n${skills.StaffPing}` : "",
    skills.Purchase ? `\n[Purchase]\n${skills.Purchase}` : "",
    "",
    `Context: sessionId=${sessionId}, productId=${productId}.`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-latest"),
    system,
    messages: body.messages,
    tools,
  });

  return result.toTextStreamResponse({
    headers: {
      "x-session-id": sessionId,
      "x-product-id": productId,
    },
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST { sessionId?, productId?, mode?, messages: [{role, content}] }",
  });
}

