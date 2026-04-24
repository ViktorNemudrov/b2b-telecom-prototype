import { NextRequest, NextResponse } from "next/server";
import { readEnvWithMonorepoFallback } from "../_lib/env";

const PROVIDERS: Record<string, { url: string; keyEnv: string; publicKeyEnv: string }> = {
  groq: { url: "https://api.groq.com/openai/v1/chat/completions", keyEnv: "GROQ_API_KEY", publicKeyEnv: "NEXT_PUBLIC_GROQ_API_KEY" },
  together: { url: "https://api.together.xyz/v1/chat/completions", keyEnv: "TOGETHER_API_KEY", publicKeyEnv: "NEXT_PUBLIC_TOGETHER_API_KEY" },
  openrouter: { url: "https://openrouter.ai/api/v1/chat/completions", keyEnv: "OPENROUTER_API_KEY", publicKeyEnv: "NEXT_PUBLIC_OPENROUTER_API_KEY" },
  grok: { url: "https://api.x.ai/v1/chat/completions", keyEnv: "GROK_API_KEY", publicKeyEnv: "NEXT_PUBLIC_GROK_API_KEY" }
};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const provider = (req.headers.get("x-llm-provider") ?? "groq").toLowerCase();
  const cfg = PROVIDERS[provider];
  if (!cfg) {
    return NextResponse.json({ error: "unknown provider" }, { status: 400 });
  }
  const key = readEnvWithMonorepoFallback(cfg.keyEnv, cfg.publicKeyEnv);
  if (!key?.trim()) {
    return NextResponse.json({ error: "missing API key for provider" }, { status: 503 });
  }
  const body = await req.json();
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key.trim()}`,
      "Content-Type": "application/json",
      ...(provider === "openrouter"
        ? {
            Referer: process.env.NEXT_PUBLIC_OPENROUTER_REFERER ?? "https://localhost"
          }
        : {})
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" }
  });
}
