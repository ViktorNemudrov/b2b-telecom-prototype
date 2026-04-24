import { NextRequest, NextResponse } from "next/server";
import { readEnvWithMonorepoFallback } from "../_lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const key = readEnvWithMonorepoFallback("GEMINI_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY");
  if (!key) {
    return NextResponse.json({ error: "missing Gemini key" }, { status: 503 });
  }
  const payload = (await req.json()) as { model?: string; body?: Record<string, unknown> };
  const model = payload.model?.trim();
  if (!model) {
    return NextResponse.json({ error: "missing model" }, { status: 400 });
  }
  const inner = payload.body;
  if (!inner || typeof inner !== "object") {
    return NextResponse.json({ error: "missing body" }, { status: 400 });
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inner),
    cache: "no-store"
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" }
  });
}
