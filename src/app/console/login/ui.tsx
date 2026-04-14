"use client";

import { useState } from "react";

export function LoginClient({ nextPath }: { nextPath: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="pt-10">
      <div className="rounded-[28px] bg-white shadow-sm ring-1 ring-black/5 p-6">
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          Store Console
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Enter the console password to view in-store session analytics.
        </p>

        <div className="mt-5 grid gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Console password"
            className="w-full rounded-2xl bg-zinc-50 ring-1 ring-black/5 px-4 py-3 text-sm outline-none"
          />

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const r = await fetch("/api/console/login", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ password }),
                });
                if (!r.ok) {
                  const j = (await r.json().catch(() => null)) as
                    | { error?: string }
                    | null;
                  setError(j?.error ?? "login_failed");
                  return;
                }
                window.location.href = nextPath;
              } finally {
                setLoading(false);
              }
            }}
            className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {error ? (
            <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-900/10 px-4 py-3 text-sm text-rose-950">
              {error === "invalid_password"
                ? "Incorrect password."
                : error === "CONSOLE_PASSWORD_not_set"
                  ? "Server is missing CONSOLE_PASSWORD."
                  : "Unable to sign in."}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

