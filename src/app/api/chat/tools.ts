import { tool } from "ai";
import { z } from "zod";
import { readJsonFile } from "@/lib/data";
import { recordEvent } from "@/lib/analytics";
import crypto from "node:crypto";

type Product = {
  id: string;
  name: string;
  currency: string;
  price: number;
  summary: string;
  differentiators: string[];
  specs: { label: string; value: string }[];
  heroImageSrc: string;
  variants: { id: string; name: string; chip: string; imageFilter: string }[];
  comparableProductIds: string[];
  bundles: { id: string; title: string; items: string[]; bundlePrice: number }[];
};
type ProductsFile = { products: Product[] };

type ReviewSummary = {
  productId: string;
  ratingAvg: number;
  ratingCount: number;
  pros: string[];
  cons: string[];
  notableQuotes: string[];
};
type ReviewsFile = { reviews: ReviewSummary[] };

type StockVariant = { variantId: string; available: boolean; qty: number };
type StockRecord = { productId: string; variants: StockVariant[] };
type StockFile = { stock: StockRecord[] };

async function getProducts() {
  const data = await readJsonFile<ProductsFile>("products.json");
  return data.products;
}

export function buildTools() {
  return {
    compareProducts: tool({
      description:
        "Multi-product spec comparison table via API. Returns side-by-side specs plus an objective summary seed.",
      inputSchema: z.object({
        sessionId: z.string(),
        productId: z.string(),
        otherProductId: z.string(),
      }),
      execute: async ({ sessionId, productId, otherProductId }) => {
        const products = await getProducts();
        const left = products.find((p) => p.id === productId);
        const right = products.find((p) => p.id === otherProductId);
        if (!left || !right) {
          return { error: "not_found" as const };
        }

        const labels = Array.from(
          new Set([...left.specs.map((s) => s.label), ...right.specs.map((s) => s.label)])
        );
        const leftMap = new Map(left.specs.map((s) => [s.label, s.value]));
        const rightMap = new Map(right.specs.map((s) => [s.label, s.value]));

        await recordEvent({
          type: "mode_select",
          sessionId,
          at: new Date().toISOString(),
          mode: "compare",
        });

        return {
          left: { id: left.id, name: left.name, price: left.price, currency: left.currency },
          right: { id: right.id, name: right.name, price: right.price, currency: right.currency },
          table: labels.map((label) => ({
            label,
            left: leftMap.get(label) ?? null,
            right: rightMap.get(label) ?? null,
          })),
        };
      },
    }),

    fetchReviewSummary: tool({
      description: "Review fetching and display via API.",
      inputSchema: z.object({
        sessionId: z.string(),
        productId: z.string(),
      }),
      execute: async ({ sessionId, productId }) => {
        const data = await readJsonFile<ReviewsFile>("reviews.json");
        const summary = data.reviews.find((r) => r.productId === productId);
        if (!summary) return { error: "not_found" as const };

        await recordEvent({
          type: "mode_select",
          sessionId,
          at: new Date().toISOString(),
          mode: "reviews",
        });

        return summary;
      },
    }),

    getBundles: tool({
      description: "Curated product bundles via API with combined pricing.",
      inputSchema: z.object({
        sessionId: z.string(),
        productId: z.string(),
      }),
      execute: async ({ sessionId, productId }) => {
        const products = await getProducts();
        const product = products.find((p) => p.id === productId);
        if (!product) return { error: "not_found" as const };

        await recordEvent({
          type: "mode_select",
          sessionId,
          at: new Date().toISOString(),
          mode: "deals",
        });

        return { productId, bundles: product.bundles ?? [] };
      },
    }),

    issueDealQr: tool({
      description:
        "Generates a session-locked, in-store exclusive discount QR for counter redemption.",
      inputSchema: z.object({
        sessionId: z.string(),
        productId: z.string(),
        minutesValid: z.number().int().min(1).max(60).default(15),
      }),
      execute: async ({ sessionId, productId, minutesValid }) => {
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

        return {
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
        };
      },
    }),

    checkStock: tool({
      description: "Live inventory and variant availability check via API.",
      inputSchema: z.object({
        sessionId: z.string(),
        productId: z.string(),
        variantId: z.string().optional(),
      }),
      execute: async ({ sessionId, productId, variantId }) => {
        const data = await readJsonFile<StockFile>("stock.json");
        const record = data.stock.find((s) => s.productId === productId);
        if (!record) return { error: "not_found" as const };

        await recordEvent({
          type: "mode_select",
          sessionId,
          at: new Date().toISOString(),
          mode: "deals",
        });

        if (!variantId) return record;
        return {
          productId,
          variant: record.variants.find((v) => v.variantId === variantId) ?? null,
        };
      },
    }),

    staffPing: tool({
      description: "Escalates to floor staff with customer context and product interest.",
      inputSchema: z.object({
        sessionId: z.string(),
        productId: z.string(),
        summary: z.string().min(1).max(800),
      }),
      execute: async ({ sessionId, productId, summary }) => {
        await recordEvent({
          type: "staff_ping",
          sessionId,
          at: new Date().toISOString(),
          productId,
          summary,
        });
        return { ok: true };
      },
    }),

    startPurchase: tool({
      description:
        "Leads the user to make a purchase. Returns concise in-store checkout steps and captures purchase intent.",
      inputSchema: z.object({
        sessionId: z.string(),
        productId: z.string(),
        variantId: z.string().optional(),
        bundleId: z.string().optional(),
      }),
      execute: async ({ sessionId, productId, variantId, bundleId }) => {
        await recordEvent({
          type: "purchase_start",
          sessionId,
          at: new Date().toISOString(),
          productId,
          variantId,
          bundleId,
        });

        return {
          ok: true,
          nextSteps: [
            "Go to the counter (or ask me to ping staff).",
            "Show the product to the associate and say: “I’m ready to check out.”",
            variantId ? `Tell them your preferred variant: ${variantId}.` : "Tell them your preferred color/variant.",
            bundleId ? `Ask for bundle: ${bundleId}.` : "If you want add-ons, ask for the best-value bundle.",
            "If you have a deal QR from me, show it before they ring you up.",
          ],
          receiptHint: "If you’d like, I can recap your choice in one line for the associate.",
        };
      },
    }),
  };
}

