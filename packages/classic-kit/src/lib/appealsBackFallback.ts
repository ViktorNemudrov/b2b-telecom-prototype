/** Query-ключ источника захода на `/appeals/` (fallback для goSmartBack без дублирования стека). */
export const APPEALS_FROM_QUERY = "from";

export type AppealsEntryFrom = "assistant" | "documents" | "finance" | "support" | "settings";

const KNOWN: ReadonlySet<string> = new Set(["assistant", "documents", "finance", "support", "settings"]);

export function isKnownAppealsFrom(raw: string | null | undefined): raw is AppealsEntryFrom {
  const n = (raw ?? "").toLowerCase().trim();
  return n !== "" && KNOWN.has(n);
}

/** Fallback, если в истории нет шага назад (прямой заход / только replace). */
export function resolveAppealsBackFallback(fromRaw: string | null | undefined): string {
  const from = (fromRaw ?? "").toLowerCase().trim();
  if (from === "assistant") return "/assistant/";
  if (from === "documents" || from === "finance") return "/documents/finance/";
  if (from === "settings") return "/settings/";
  if (from === "support") return "/support/";
  return "/support/";
}

/** Ссылка на список обращений с контекстом для кнопки «Назад». */
export function appealsListHref(from: AppealsEntryFrom, extra?: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  q.set(APPEALS_FROM_QUERY, from);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v != null && v !== "") q.set(k, v);
    }
  }
  const qs = q.toString();
  return qs ? `/appeals/?${qs}` : "/appeals/";
}

/** Сохранить только допустимый `from` при router.replace (например после ?open=). */
export function appealsPathPreservingFrom(searchParams: { get: (k: string) => string | null }): string {
  const raw = searchParams.get(APPEALS_FROM_QUERY);
  const n = (raw ?? "").toLowerCase().trim();
  if (!isKnownAppealsFrom(raw)) return "/appeals/";
  return `/appeals/?${APPEALS_FROM_QUERY}=${encodeURIComponent(n)}`;
}
