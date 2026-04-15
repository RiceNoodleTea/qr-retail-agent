import { appendJsonl, ensureDir, readJsonl } from "@/lib/data";

export type SessionEvent =
  | {
      type: "session_start";
      sessionId: string;
      at: string;
      productId: string;
      userAgent?: string;
      locale?: string;
    }
  | {
      type: "mode_select";
      sessionId: string;
      at: string;
      mode: "deals" | "compare" | "reviews" | "find";
    }
  | {
      type: "chat_message";
      sessionId: string;
      at: string;
      role: "user" | "assistant";
      content: string;
    }
  | {
      type: "purchase_start";
      sessionId: string;
      at: string;
      productId: string;
      variantId?: string;
      bundleId?: string;
    }
  | {
      type: "deal_issued";
      sessionId: string;
      at: string;
      productId: string;
      token: string;
      expiresAt: string;
    }
  | {
      type: "staff_ping";
      sessionId: string;
      at: string;
      productId: string;
      summary: string;
    };

const ANALYTICS_DIR = "analytics";
const EVENTS_FILE = "analytics/events.jsonl";

export async function recordEvent(event: SessionEvent) {
  await ensureDir(ANALYTICS_DIR);
  await appendJsonl(EVENTS_FILE, event);
}

export async function listEvents(): Promise<SessionEvent[]> {
  return readJsonl<SessionEvent>(EVENTS_FILE);
}

export async function listSessionsSummary() {
  const events = await listEvents();
  const bySession = new Map<string, { sessionId: string; productId?: string; startedAt?: string; modes: string[]; lastAt?: string }>();

  for (const e of events) {
    const s =
      bySession.get(e.sessionId) ??
      { sessionId: e.sessionId, modes: [] as string[] };
    if (e.type === "session_start") {
      s.productId = e.productId;
      s.startedAt = e.at;
      s.lastAt = e.at;
    } else if (e.type === "mode_select") {
      if (!s.modes.includes(e.mode)) s.modes.push(e.mode);
      s.lastAt = e.at;
    } else {
      s.lastAt = e.at;
    }
    bySession.set(e.sessionId, s);
  }

  return Array.from(bySession.values()).sort((a, b) => {
    const aa = a.lastAt ?? a.startedAt ?? "";
    const bb = b.lastAt ?? b.startedAt ?? "";
    return bb.localeCompare(aa);
  });
}

