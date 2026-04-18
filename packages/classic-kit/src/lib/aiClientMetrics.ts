/**
 * Клиентские метрики live AI (без внешнего бэкенда). В production можно проксировать в аналитику.
 */

export type AiLiveMetricEvent =
  | { type: "live_fetch_start"; at: number }
  | { type: "live_fetch_end"; at: number; ok: boolean; ms: number; intent?: string }
  | { type: "live_output_rejected"; reason: "repetition" | "reliability" | "empty" }
  | { type: "live_aborted"; reason: "timeout" | "new_message" | "unmount" | "user_cancel" };

const MAX_BUFFER = 80;
const buffer: AiLiveMetricEvent[] = [];
let metricSink: ((e: AiLiveMetricEvent) => void) | null = null;

/** Подписка на метрики (аналитика, Sentry breadcrumbs). Один sink на процесс. */
export function setAiMetricSink(next: ((e: AiLiveMetricEvent) => void) | null): void {
  metricSink = next;
}

export function emitAiMetric(e: AiLiveMetricEvent): void {
  buffer.push(e);
  if (buffer.length > MAX_BUFFER) buffer.splice(0, buffer.length - MAX_BUFFER);
  try {
    metricSink?.(e);
  } catch {
    // sink не должен ломать UI
  }
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
    console.debug("[ai-metric]", e);
  }
}

export function getAiMetricSnapshot(): readonly AiLiveMetricEvent[] {
  return [...buffer];
}

export function clearAiMetrics(): void {
  buffer.length = 0;
}
