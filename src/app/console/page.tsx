import { listEvents, listSessionsSummary } from "@/lib/analytics";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
      <div className="text-xs font-semibold tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export default async function ConsolePage() {
  const [sessions, events] = await Promise.all([
    listSessionsSummary(),
    listEvents(),
  ]);

  const dealsIssued = events.filter((e) => e.type === "deal_issued").length;
  const staffPings = events.filter((e) => e.type === "staff_ping").length;
  const chatMessages = events.filter((e) => e.type === "chat_message").length;

  return (
    <div className="pt-2">
      <div className="rounded-[28px] bg-white shadow-sm ring-1 ring-black/5 p-6">
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          Retail Console
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Session analytics
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          This dashboard summarizes what customers asked in-store (v1 mock
          storage in JSONL).
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard label="Sessions" value={`${sessions.length}`} />
          <StatCard label="Deal QR issued" value={`${dealsIssued}`} />
          <StatCard label="Staff pings" value={`${staffPings}`} />
        </div>

        <div className="mt-3">
          <StatCard label="Chat messages logged" value={`${chatMessages}`} />
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold tracking-wide text-zinc-500">
            Recent sessions
          </div>
          <div className="mt-2 overflow-hidden rounded-2xl ring-1 ring-black/5">
            <div className="divide-y divide-black/5 bg-white">
              {sessions.length === 0 ? (
                <div className="px-4 py-6 text-sm text-zinc-600">
                  No sessions yet. Once customers use the chat, events will
                  appear here.
                </div>
              ) : (
                sessions.slice(0, 30).map((s) => (
                  <div
                    key={s.sessionId}
                    className="px-4 py-3 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {s.sessionId}
                      </div>
                      <div className="text-xs text-zinc-600">
                        Product: {s.productId ?? "—"}
                      </div>
                      <div className="text-xs text-zinc-600">
                        Modes: {s.modes.length ? s.modes.join(", ") : "—"}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 text-right">
                      <div>Start: {s.startedAt ?? "—"}</div>
                      <div>Last: {s.lastAt ?? "—"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

