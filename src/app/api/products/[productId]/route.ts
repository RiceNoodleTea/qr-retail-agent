import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/data";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const data = await readJsonFile<ProductsFile>("products.json");
  const product = data.products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

