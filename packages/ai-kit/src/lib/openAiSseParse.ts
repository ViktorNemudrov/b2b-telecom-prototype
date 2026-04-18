/**
 * Parses one SSE line from OpenAI-compatible streaming (Groq, OpenRouter, etc.).
 * Handles CRLF and "data:" with or without space after the colon.
 */
export function parseOpenAiSseLine(line: string): "done" | { delta: string } | null {
  const t = line.replace(/\r$/, "").trimEnd();
  if (!t) return null;
  if (!t.startsWith("data:")) return null;
  const payload = t.startsWith("data: ") ? t.slice(6) : t.slice(5);
  const data = payload.trim();
  if (data === "[DONE]") return "done";
  if (data === "") return null;
  try {
    const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string | null } }> };
    const chunk = json.choices?.[0]?.delta?.content;
    if (typeof chunk !== "string" || chunk.length === 0) return null;
    return { delta: chunk };
  } catch {
    return null;
  }
}
