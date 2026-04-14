import { NextResponse } from "next/server";
import { listSessionsSummary } from "@/lib/analytics";

export async function GET() {
  const sessions = await listSessionsSummary();
  return NextResponse.json({ sessions });
}

