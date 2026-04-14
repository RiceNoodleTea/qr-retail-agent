"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AgentPanel } from "@/components/agent/AgentPanel";

type Variant = {
  id: string;
  name: string;
  chip: string;
  imageFilter: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  currency: "USD";
  summary: string;
  differentiators: string[];
  specs: { label: string; value: string }[];
  variants: Variant[];
  heroImageSrc: string;
};

const MOCK_PRODUCT: Product = {
  id: "chronos-elite",
  name: "Chronos Elite",
  price: 899,
  currency: "USD",
  summary:
    "The ultimate synthesis of temporal precision and aesthetic restraint. Crafted for those who value every second.",
  differentiators: [
    "Sapphire crystal clarity",
    "Whisper-quiet automatic movement",
    "All-day comfort leather strap",
  ],
  specs: [
    { label: "Case", value: "40mm stainless steel" },
    { label: "Crystal", value: "Sapphire" },
    { label: "Movement", value: "Automatic" },
    { label: "Water resistance", value: "5 ATM" },
    { label: "Warranty", value: "2 years" },
  ],
  variants: [
    {
      id: "black",
      name: "Black",
      chip: "#1f1f1f",
      imageFilter: "hue-rotate(0deg) saturate(1.05)",
    },
    {
      id: "sand",
      name: "Sand",
      chip: "#d7c7a8",
      imageFilter: "hue-rotate(30deg) saturate(0.95) brightness(1.05)",
    },
    {
      id: "sage",
      name: "Sage",
      chip: "#8f9e84",
      imageFilter: "hue-rotate(95deg) saturate(1.0)",
    },
  ],
  heroImageSrc: "/next.svg",
};

function formatMoneyUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function ProductPage() {
  const [variantId, setVariantId] = useState(MOCK_PRODUCT.variants[0]?.id);

  const variant = useMemo(() => {
    return (
      MOCK_PRODUCT.variants.find((v) => v.id === variantId) ??
      MOCK_PRODUCT.variants[0]
    );
  }, [variantId]);

  const scrollToAgent = (mode: "deals" | "compare" | "reviews") => {
    const el = document.getElementById("agent");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?mode=${mode}`
    );
  };

  return (
    <div className="pb-28">
      <div className="rounded-[28px] bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="p-5">
          <div className="rounded-[26px] bg-zinc-50 ring-1 ring-black/5 p-5">
            <div className="relative mx-auto w-full aspect-square max-w-[320px]">
              <Image
                src={MOCK_PRODUCT.heroImageSrc}
                alt={MOCK_PRODUCT.name}
                fill
                priority
                className="object-contain"
                style={{ filter: variant?.imageFilter }}
              />
            </div>
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {MOCK_PRODUCT.name}
              </h1>
              <div className="mt-1 text-lg font-semibold">
                {formatMoneyUSD(MOCK_PRODUCT.price)}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {MOCK_PRODUCT.variants.map((v) => {
                const selected = v.id === variant?.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={[
                      "h-8 w-8 rounded-full ring-1 ring-black/10",
                      selected ? "outline outline-2 outline-black/80" : "",
                    ].join(" ")}
                    style={{ backgroundColor: v.chip }}
                    aria-label={`Color: ${v.name}`}
                  />
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-600">
            {MOCK_PRODUCT.summary}
          </p>

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => scrollToAgent("deals")}
              className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-4 py-4 flex items-center justify-between text-left"
            >
              <div className="font-semibold">View Discounts/Deals</div>
              <div className="text-zinc-900">🏷️</div>
            </button>
            <button
              type="button"
              onClick={() => scrollToAgent("compare")}
              className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-4 py-4 flex items-center justify-between text-left"
            >
              <div className="font-semibold">Compare with others</div>
              <div className="text-zinc-900">⇄</div>
            </button>
            <button
              type="button"
              onClick={() => scrollToAgent("reviews")}
              className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-4 py-4 flex items-center justify-between text-left"
            >
              <div className="font-semibold">Check Reviews</div>
              <div className="text-zinc-900">💬</div>
            </button>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold tracking-wide text-zinc-500">
              What makes it different
            </div>
            <ul className="mt-2 grid gap-2">
              {MOCK_PRODUCT.differentiators.map((d) => (
                <li
                  key={d}
                  className="rounded-2xl bg-zinc-50 ring-1 ring-black/5 px-4 py-3 text-sm"
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold tracking-wide text-zinc-500">
              Specs
            </div>
            <dl className="mt-2 divide-y divide-black/5 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
              {MOCK_PRODUCT.specs.map((s) => (
                <div key={s.label} className="px-4 py-3 flex gap-3">
                  <dt className="w-40 text-sm font-medium text-zinc-700">
                    {s.label}
                  </dt>
                  <dd className="text-sm text-zinc-900">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section id="agent" className="mt-6">
        <AgentPanel
          product={{
            id: MOCK_PRODUCT.id,
            name: MOCK_PRODUCT.name,
            price: MOCK_PRODUCT.price,
            heroImageSrc: MOCK_PRODUCT.heroImageSrc,
            specs: MOCK_PRODUCT.specs,
          }}
        />
      </section>

      <div className="fixed left-0 right-0 bottom-0 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-[420px] px-4 pb-4">
          <div className="rounded-full bg-white/90 backdrop-blur shadow-sm ring-1 ring-black/10 px-3 py-2 flex items-center gap-2">
            <input
              placeholder="I want something else"
              className="flex-1 bg-transparent outline-none text-sm px-2 py-2"
            />
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-amber-800 text-white grid place-items-center"
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

