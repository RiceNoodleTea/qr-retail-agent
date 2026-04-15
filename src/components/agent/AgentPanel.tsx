"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useChatClient } from "@/components/agent/ChatClient";

export type AgentProduct = {
  id: string;
  name: string;
  price: number;
  heroImageSrc: string;
  specs: { label: string; value: string }[];
};

type Props = {
  product: AgentProduct;
};

function formatMoneyUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const MOCK_SIMILAR: AgentProduct[] = [
  {
    id: "chronos-elite",
    name: "Chronos Elite",
    price: 1450,
    heroImageSrc: "/next.svg",
    specs: [
      { label: "Crystal", value: "Sapphire" },
      { label: "Battery", value: "N/A (automatic)" },
      { label: "Water resistance", value: "5 ATM" },
    ],
  },
  {
    id: "vanguard-classic",
    name: "Vanguard Classic",
    price: 1250,
    heroImageSrc: "/next.svg",
    specs: [
      { label: "Crystal", value: "Mineral" },
      { label: "Battery", value: "48h" },
      { label: "Water resistance", value: "3 ATM" },
    ],
  },
  {
    id: "atlas-lite",
    name: "Atlas Lite",
    price: 690,
    heroImageSrc: "/next.svg",
    specs: [
      { label: "Crystal", value: "Mineral" },
      { label: "Battery", value: "72h" },
      { label: "Water resistance", value: "5 ATM" },
    ],
  },
];

function SpecsTable({
  left,
  right,
}: {
  left: AgentProduct;
  right: AgentProduct;
}) {
  const rows = useMemo(() => {
    const labels = new Set<string>();
    for (const s of left.specs) labels.add(s.label);
    for (const s of right.specs) labels.add(s.label);
    return Array.from(labels.values());
  }, [left.specs, right.specs]);

  const leftMap = useMemo(() => new Map(left.specs.map((s) => [s.label, s.value])), [left.specs]);
  const rightMap = useMemo(
    () => new Map(right.specs.map((s) => [s.label, s.value])),
    [right.specs]
  );

  return (
    <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-black/5 bg-white">
      <div className="grid grid-cols-3 gap-px bg-black/5">
        <div className="bg-white px-3 py-2 text-xs font-semibold text-zinc-500">
          Spec
        </div>
        <div className="bg-white px-3 py-2 text-xs font-semibold text-zinc-900">
          {left.name}
        </div>
        <div className="bg-white px-3 py-2 text-xs font-semibold text-zinc-900">
          {right.name}
        </div>
        {rows.map((label) => (
          <div key={label} className="contents">
            <div className="bg-white px-3 py-2 text-xs text-zinc-600">
              {label}
            </div>
            <div className="bg-white px-3 py-2 text-xs text-zinc-900">
              {leftMap.get(label) ?? "—"}
            </div>
            <div className="bg-white px-3 py-2 text-xs text-zinc-900">
              {rightMap.get(label) ?? "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsGuide() {
  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-zinc-50 ring-1 ring-black/5 p-4">
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          How to ask
        </div>
        <ul className="mt-2 grid gap-2 text-sm text-zinc-700">
          <li>“What’s the overall score and how many reviews?”</li>
          <li>“What buyers are saying (good and bad)?”</li>
          <li>“Any recurring issues I should know?”</li>
        </ul>
      </div>

      <div className="mt-4 rounded-2xl bg-white ring-1 ring-black/5 p-4">
        <div className="text-sm font-semibold">Review snapshot (mock)</div>
        <div className="mt-2 text-3xl font-semibold tracking-tight">4.6</div>
        <div className="text-sm text-zinc-600">out of 5 • 1,284 reviews</div>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-900/10 p-3">
            <div className="text-xs font-semibold text-emerald-900">
              What buyers like
            </div>
            <div className="mt-1 text-emerald-950">
              Clarity, comfort, and quiet movement.
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 ring-1 ring-rose-900/10 p-3">
            <div className="text-xs font-semibold text-rose-900">
              What buyers dislike
            </div>
            <div className="mt-1 text-rose-950">
              Some mention strap break-in time; a few report minor accuracy drift.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DealsGuide() {
  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-zinc-50 ring-1 ring-black/5 p-4">
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          How to ask
        </div>
        <ul className="mt-2 grid gap-2 text-sm text-zinc-700">
          <li>“Do you have any in-store deals right now?”</li>
          <li>“What bundle gives the best value?”</li>
          <li>“Check if my color is in stock before I buy.”</li>
        </ul>
      </div>
    </div>
  );
}

function CompareGuide({ product }: { product: AgentProduct }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = useMemo(
    () => MOCK_SIMILAR.find((p) => p.id === pickedId) ?? null,
    [pickedId]
  );
  const [dividerAnswer, setDividerAnswer] = useState("");
  const [recommendation, setRecommendation] = useState<string | null>(null);

  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-zinc-50 ring-1 ring-black/5 p-4">
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          How to ask
        </div>
        <ul className="mt-2 grid gap-2 text-sm text-zinc-700">
          <li>Pick a similar product below.</li>
          <li>Ask: “Compare these two objectively.”</li>
          <li>Answer the final “dividing question” to get a recommendation.</li>
        </ul>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          Similar options
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {MOCK_SIMILAR.filter((p) => p.id !== product.id)
            .slice(0, 2)
            .map((p) => {
              const selected = p.id === pickedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPickedId(p.id);
                    setDividerAnswer("");
                    setRecommendation(null);
                  }}
                  className={[
                    "rounded-2xl bg-white ring-1 ring-black/5 p-3 text-left shadow-sm",
                    selected ? "outline outline-2 outline-black/80" : "",
                  ].join(" ")}
                >
                  <div className="rounded-xl bg-zinc-50 ring-1 ring-black/5 p-2">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={p.heroImageSrc}
                        alt={p.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-zinc-600">
                    {formatMoneyUSD(p.price)}
                  </div>
                  <div className="mt-2 text-xs font-medium text-zinc-900">
                    I prefer this
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {picked ? (
        <div className="mt-4 rounded-2xl bg-white ring-1 ring-black/5 p-4">
          <div className="text-sm font-semibold">Side-by-side (mock)</div>
          <SpecsTable left={product} right={picked} />

          <div className="mt-4 rounded-2xl bg-zinc-50 ring-1 ring-black/5 p-4 text-sm text-zinc-700">
            <div className="font-semibold text-zinc-900">
              Objective summary
            </div>
            <p className="mt-1 leading-6">
              {product.name} leans premium on materials and finishing;{" "}
              {picked.name} focuses on value and battery convenience. Both cover
              everyday use, but they optimize for different priorities.
            </p>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold tracking-wide text-zinc-500">
              Dividing question
            </div>
            <div className="mt-2 rounded-2xl bg-zinc-50 ring-1 ring-black/5 p-4">
              <div className="text-sm font-semibold">
                What matters more: premium materials or longer battery life?
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={dividerAnswer}
                  onChange={(e) => setDividerAnswer(e.target.value)}
                  placeholder="Type your preference…"
                  className="flex-1 rounded-xl bg-white ring-1 ring-black/5 px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const lower = dividerAnswer.trim().toLowerCase();
                    if (!lower) return;
                    if (lower.includes("battery") || lower.includes("value")) {
                      setRecommendation(
                        `Recommendation: ${picked.name} — better fit if you prioritize battery/value.`
                      );
                      return;
                    }
                    setRecommendation(
                      `Recommendation: ${product.name} — better fit if you prioritize premium materials/finishing.`
                    );
                  }}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                >
                  Decide
                </button>
              </div>
            </div>
          </div>

          {recommendation ? (
            <div className="mt-4 rounded-2xl bg-emerald-50 ring-1 ring-emerald-900/10 p-4 text-sm text-emerald-950">
              <div className="font-semibold">Result</div>
              <div className="mt-1">{recommendation}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FindGuide() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState("");

  const question = useMemo(() => {
    const a0 = (answers[0] ?? "").toLowerCase();
    if (step === 0) return "What type of product are you looking for?";
    if (step === 1) return "What’s your price range (roughly)?";
    if (step === 2) {
      if (a0.includes("watch")) return "Do you prefer classic, sporty, or smart?";
      return "What style do you prefer (minimal, bold, premium, value)?";
    }
    if (step === 3) return "Any must-have features?";
    return "What’s the one thing you care about most?";
  }, [answers, step]);

  const done = step >= 5;

  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-zinc-50 ring-1 ring-black/5 p-4">
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          How it works
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-700">
          Answer five quick questions. The agent will narrow down to exactly one
          best-fit product.
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-white ring-1 ring-black/5 p-4">
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          Question {Math.min(step + 1, 5)} of 5
        </div>
        <div className="mt-2 text-sm font-semibold">{question}</div>
        <div className="mt-3 flex gap-2">
          <input
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Type your answer…"
            className="flex-1 rounded-xl bg-zinc-50 ring-1 ring-black/5 px-3 py-2 text-sm outline-none"
            disabled={done}
          />
          <button
            type="button"
            disabled={done}
            onClick={() => {
              const v = current.trim();
              if (!v) return;
              setAnswers((prev) => [...prev, v]);
              setCurrent("");
              setStep((s) => s + 1);
            }}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          {answers.map((a, i) => (
            <div
              key={`${i}-${a}`}
              className="rounded-xl bg-zinc-50 ring-1 ring-black/5 px-3 py-2 text-sm text-zinc-700"
            >
              <span className="font-semibold text-zinc-900">A{i + 1}:</span>{" "}
              {a}
            </div>
          ))}
        </div>

        {done ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 ring-1 ring-emerald-900/10 p-4 text-sm text-emerald-950">
            <div className="font-semibold">Mock recommendation</div>
            <div className="mt-1">
              Based on your answers, I’d recommend <b>Vanguard Classic</b>.
              (Next we’ll have Claude ask/decide with real product data.)
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AgentPanel({ product }: Props) {
  const chat = useChatClient();
  const mode = chat.mode;
  const setMode = chat.setMode;

  return (
    <div className="rounded-[28px] bg-white shadow-sm ring-1 ring-black/5 p-5">
      <div>
        <div className="text-sm font-semibold">Assistant</div>
        <div className="text-xs text-zinc-600">Guided help for {product.name}</div>
      </div>

      <div className="mt-4 grid gap-2">
        {(
          [
            ["reviews", "Check Reviews", "💬"],
            ["compare", "Compare Products", "⇄"],
            ["find", "Find Another Product", "➜"],
          ] as const
        ).map(([id, label, icon]) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={[
                "w-full rounded-2xl shadow-sm ring-1 px-4 py-4 flex items-center justify-between text-left",
                active
                  ? "bg-black text-white ring-black/10"
                  : "bg-white text-zinc-900 ring-black/5",
              ].join(" ")}
              aria-pressed={active}
            >
              <div className="font-semibold">{label}</div>
              <div className={active ? "text-white" : "text-zinc-900"}>{icon}</div>
            </button>
          );
        })}

        {mode === "deals" ? (
          <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-900/10 px-4 py-3 text-sm text-amber-950">
            <div className="font-semibold">Deals mode</div>
            <div className="mt-1">
              You opened discounts/deals. Ask for a deal QR, bundle value, or stock
              availability.
            </div>
          </div>
        ) : null}
      </div>

      {mode === "reviews" ? <ReviewsGuide /> : null}
      {mode === "compare" ? <CompareGuide product={product} /> : null}
      {mode === "find" ? <FindGuide /> : null}
      {mode === "deals" ? <DealsGuide /> : null}

      <div className="mt-5 rounded-2xl bg-zinc-50 ring-1 ring-black/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-900">Chat</div>
          {chat.status === "streaming" ? (
            <button
              type="button"
              onClick={chat.stop}
              className="rounded-full bg-white px-3 py-2 text-xs font-semibold ring-1 ring-black/5"
            >
              Stop
            </button>
          ) : null}
        </div>

        {chat.error ? (
          <div className="mt-3 rounded-2xl bg-rose-50 ring-1 ring-rose-900/10 px-4 py-3 text-sm text-rose-950">
            <div className="font-semibold">Chat error</div>
            <div className="mt-1 break-words">{chat.error}</div>
          </div>
        ) : null}

        <div className="mt-3 grid gap-2">
          {chat.messages.length === 0 ? (
            <div className="text-sm text-zinc-600">
              Type a message in the bar at the bottom to start.
            </div>
          ) : (
            chat.messages.slice(-12).map((m) => (
              <div
                key={m.id}
                className={[
                  "rounded-2xl px-4 py-3 text-sm leading-6 break-words",
                  m.role === "user"
                    ? "bg-white ring-1 ring-black/5 text-zinc-900"
                    : "bg-zinc-900 text-white",
                ].join(" ")}
              >
                {m.content || (m.role === "assistant" ? "…" : "")}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

