#!/usr/bin/env node
/**
 * Одноразовый замер RTT по ключам из `apps/classic/.env.local`.
 * Выводит только имена провайдеров и миллисекунды (ключи не печатаются).
 *
 * Usage: node scripts/benchmark-live-ai-latency.mjs [path/to/.env.local]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function parseDotEnv(content) {
  /** @type {Record<string, string>} */
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq <= 0) continue;
    const key = s.slice(0, eq).trim();
    let val = s.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const PROMPT = "Ок";

const OPEN_BODY = {
  temperature: 0.25,
  top_p: 0.9,
  max_tokens: 64,
  frequency_penalty: 0.35,
  presence_penalty: 0.1,
  messages: [
    { role: "system", content: "Отвечай предельно кратко на русском." },
    { role: "user", content: PROMPT }
  ]
};

async function timeGemini(apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: PROMPT }] }],
    systemInstruction: { parts: [{ text: "Отвечай предельно кратко на русском." }] },
    generationConfig: { temperature: 0.25, topP: 0.9, maxOutputTokens: 128 }
  };
  const t0 = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await res.json();
  return Date.now() - t0;
}

async function timeOpenAiCompatible(url, bearer, model) {
  const t0 = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, ...OPEN_BODY })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await res.json();
  return Date.now() - t0;
}

const envPath = process.argv[2] || path.join(ROOT, "apps/classic/.env.local");
const raw = fs.readFileSync(envPath, "utf8");
const env = parseDotEnv(raw);

const jobs = [];

if (env.NEXT_PUBLIC_GEMINI_API_KEY) {
  const model = env.NEXT_PUBLIC_GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  jobs.push({
    name: "gemini",
    run: () => timeGemini(env.NEXT_PUBLIC_GEMINI_API_KEY, model)
  });
}
if (env.NEXT_PUBLIC_TOGETHER_API_KEY) {
  const model =
    env.NEXT_PUBLIC_TOGETHER_MODEL?.trim() || "meta-llama/Llama-3.3-70B-Instruct-Turbo";
  jobs.push({
    name: "together",
    run: () =>
      timeOpenAiCompatible(
        "https://api.together.xyz/v1/chat/completions",
        env.NEXT_PUBLIC_TOGETHER_API_KEY,
        model
      )
  });
}
if (env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
  const model =
    env.NEXT_PUBLIC_OPENROUTER_MODEL?.trim() ||
    "openrouter/auto";
  jobs.push({
    name: "openrouter",
    run: () =>
      timeOpenAiCompatible(
        "https://openrouter.ai/api/v1/chat/completions",
        env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        model
      )
  });
}
if (env.NEXT_PUBLIC_GROK_API_KEY) {
  const model = env.NEXT_PUBLIC_GROK_MODEL?.trim() || "grok-3-mini";
  jobs.push({
    name: "grok",
    run: () =>
      timeOpenAiCompatible(
        "https://api.x.ai/v1/chat/completions",
        env.NEXT_PUBLIC_GROK_API_KEY,
        model
      )
  });
}
if (env.NEXT_PUBLIC_GROQ_API_KEY) {
  const model = env.NEXT_PUBLIC_GROQ_MODEL?.trim() || "llama-3.1-8b-instant";
  jobs.push({
    name: "groq",
    run: () =>
      timeOpenAiCompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        env.NEXT_PUBLIC_GROQ_API_KEY,
        model
      )
  });
}

if (jobs.length === 0) {
  console.error("Нет ключей в", envPath);
  process.exit(1);
}

const results = await Promise.all(
  jobs.map(async (j) => {
    try {
      const ms = await j.run();
      return { name: j.name, ms, ok: true };
    } catch (e) {
      return { name: j.name, ms: NaN, ok: false, err: e instanceof Error ? e.message : String(e) };
    }
  })
);

results.sort((a, b) => (Number.isFinite(a.ms) ? a.ms : 1e15) - (Number.isFinite(b.ms) ? b.ms : 1e15));

console.log("Порядок по скорости (параллельный замер, мс):");
for (const r of results) {
  if (r.ok) console.log(`  ${r.name}: ${Math.round(r.ms)} ms`);
  else console.log(`  ${r.name}: FAIL (${r.err})`);
}
