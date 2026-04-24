import { NextResponse } from "next/server";
import { readEnvWithMonorepoFallback } from "../_lib/env";

export const runtime = "nodejs";

type ProviderId = "gemini" | "together" | "openrouter" | "grok" | "groq";

function hasAnyEnv(primary: string, pub: string): boolean {
  const val = readEnvWithMonorepoFallback(primary, pub);
  return Boolean(val?.trim());
}

export async function GET() {
  const enabled: ProviderId[] = [];
  if (hasAnyEnv("GEMINI_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY")) enabled.push("gemini");
  if (hasAnyEnv("TOGETHER_API_KEY", "NEXT_PUBLIC_TOGETHER_API_KEY")) enabled.push("together");
  if (hasAnyEnv("OPENROUTER_API_KEY", "NEXT_PUBLIC_OPENROUTER_API_KEY")) enabled.push("openrouter");
  if (hasAnyEnv("GROK_API_KEY", "NEXT_PUBLIC_GROK_API_KEY")) enabled.push("grok");
  if (hasAnyEnv("GROQ_API_KEY", "NEXT_PUBLIC_GROQ_API_KEY")) enabled.push("groq");
  return NextResponse.json({ enabled }, { headers: { "Cache-Control": "no-store" } });
}
