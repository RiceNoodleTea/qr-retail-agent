import Link from "next/link";

export default function Home() {
  return (
    <div className="pt-6">
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6">
        <div className="text-xs font-medium text-zinc-500">Demo</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          QR Retail Agent
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Scan a QR code near a product to get instant, guided help: reviews,
          comparisons, and finding the best alternative.
        </p>

        <div className="mt-5">
          <Link
            href="/p/chronos-elite"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white"
          >
            Open sample product
          </Link>
        </div>
      </div>
    </div>
  );
}
