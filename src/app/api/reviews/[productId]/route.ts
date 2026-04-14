import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/data";

type ReviewSummary = {
  productId: string;
  ratingAvg: number;
  ratingCount: number;
  pros: string[];
  cons: string[];
  notableQuotes: string[];
};

type ReviewsFile = { reviews: ReviewSummary[] };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const data = await readJsonFile<ReviewsFile>("reviews.json");
  const summary = data.reviews.find((r) => r.productId === productId);
  if (!summary) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(summary);
}

