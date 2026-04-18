import { getLiveAiText, type LiveAiProviderId } from "./liveAi";

export type LiveProviderCandidate = { provider: LiveAiProviderId; apiKey: string; model: string };

const STORAGE_KEY = "b2b_live_provider_rank_v1";
/** Повторный замер не чаще чем раз в TTL (навигация по приложению не должна долбить API). */
export const LIVE_PROVIDER_RANK_TTL_MS = 4 * 60 * 60 * 1000;

const CACHE_VERSION = 1 as const;

type StoredRank = {
  v: typeof CACHE_VERSION;
  fingerprint: string;
  measuredAt: number;
  order: LiveAiProviderId[];
  ms: Partial<Record<LiveAiProviderId, number>>;
};

/** Короткий запрос: проходит валидацию чата и даёт компактный ответ для замера RTT. */
export const LIVE_PROVIDER_BENCHMARK_PROMPT = "Ок";

export function fingerprintLiveProviders(candidates: LiveProviderCandidate[]): string {
  return candidates
    .map((c) => `${c.provider}:${c.model}`)
    .sort()
    .join("\u0000");
}

export function readStoredRank(): StoredRank | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRank;
    if (parsed?.v !== CACHE_VERSION || typeof parsed.fingerprint !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredRank(data: StoredRank): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota / private mode
  }
}

/** Восстановить порядок кандидатов из кэша; `null` если отпечаток не совпал или кэш битый. */
export function orderCandidatesFromStored(
  candidates: LiveProviderCandidate[],
  stored: StoredRank
): LiveProviderCandidate[] | null {
  if (fingerprintLiveProviders(candidates) !== stored.fingerprint) return null;
  const byProvider = new Map<LiveAiProviderId, LiveProviderCandidate>();
  for (const c of candidates) byProvider.set(c.provider, c);
  const out: LiveProviderCandidate[] = [];
  for (const p of stored.order) {
    const c = byProvider.get(p);
    if (c) out.push(c);
  }
  for (const c of candidates) {
    if (!out.some((x) => x.provider === c.provider)) out.push(c);
  }
  return out;
}

export function shouldSkipLiveProviderBenchmark(): boolean {
  if (typeof navigator === "undefined") return true;
  if (process.env.NODE_ENV === "test") return true;
  try {
    return Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver);
  } catch {
    return false;
  }
}

/**
 * Параллельно шлёт короткий запрос каждому провайдеру, замеряет время до первого успешного ответа (мс).
 * Упорядочивает кандидатов от меньшей латентности к большей; полные сбои уходят в конец в исходном порядке.
 */
export async function benchmarkAndOrderLiveProviders(args: {
  candidates: LiveProviderCandidate[];
  proxyUrl?: string;
  signal?: AbortSignal;
}): Promise<{ ordered: LiveProviderCandidate[]; ms: Partial<Record<LiveAiProviderId, number>> }> {
  const { candidates, proxyUrl, signal } = args;
  if (candidates.length <= 1) {
    return { ordered: [...candidates], ms: {} };
  }

  const rows = await Promise.all(
    candidates.map(async (c) => {
      const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
      try {
        const text = await getLiveAiText({
          prompt: LIVE_PROVIDER_BENCHMARK_PROMPT,
          history: [],
          apiKey: c.apiKey,
          model: c.model,
          provider: c.provider,
          proxyUrl,
          signal
        });
        const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
        const ok = Boolean(text?.trim());
        const ms = ok ? t1 - t0 : Number.POSITIVE_INFINITY;
        return { c, ms };
      } catch {
        return { c, ms: Number.POSITIVE_INFINITY };
      }
    })
  );

  rows.sort((a, b) => a.ms - b.ms);
  const ms: Partial<Record<LiveAiProviderId, number>> = {};
  const ordered: LiveProviderCandidate[] = [];
  const failed: LiveProviderCandidate[] = [];
  for (const row of rows) {
    if (Number.isFinite(row.ms)) {
      ordered.push(row.c);
      ms[row.c.provider] = row.ms;
    } else {
      failed.push(row.c);
    }
  }
  return { ordered: [...ordered, ...failed], ms };
}
