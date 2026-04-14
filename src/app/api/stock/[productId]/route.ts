import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/data";

type StockVariant = { variantId: string; available: boolean; qty: number };
type StockRecord = { productId: string; variants: StockVariant[] };
type StockFile = { stock: StockRecord[] };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const data = await readJsonFile<StockFile>("stock.json");
  const record = data.stock.find((s) => s.productId === productId);
  if (!record) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(record);
}

