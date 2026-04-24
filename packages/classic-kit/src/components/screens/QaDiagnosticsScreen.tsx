"use client";

import * as React from "react";
import { Bot, ChevronDown, ChevronUp, CircleCheck, CircleX, Loader2 } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { PageBackLink } from "@shared/components/PageBackLink";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/components/ui/cn";

type Check = {
  key: string;
  label: string;
  ok: boolean;
  details: string;
};

type CheckRow = {
  key: string;
  label: string;
  status: "pending" | "running" | "passed" | "failed";
  details: string;
};

type LiveProvider = "gemini" | "together" | "openrouter" | "grok" | "groq";

const LIVE_BAD_PROVIDERS_SESSION_KEY = "b2b_live_bad_providers_v1";
const LIVE_BAD_PROVIDERS_REASON_SESSION_KEY = "b2b_live_bad_providers_reason_v1";

function readSessionDisabledProviders(): LiveProvider[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(LIVE_BAD_PROVIDERS_SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is LiveProvider =>
        p === "gemini" || p === "together" || p === "openrouter" || p === "grok" || p === "groq"
    );
  } catch {
    return [];
  }
}

function readSessionDisabledProviderReasons(): Partial<Record<LiveProvider, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(LIVE_BAD_PROVIDERS_REASON_SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: Partial<Record<LiveProvider, string>> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (!v) continue;
      if (k === "gemini" || k === "together" || k === "openrouter" || k === "grok" || k === "groq") {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function liveProviderLabel(provider: LiveProvider): string {
  if (provider === "gemini") return "Gemini";
  if (provider === "together") return "Together";
  if (provider === "openrouter") return "OpenRouter";
  if (provider === "grok") return "Grok";
  return "Groq";
}

function classifyAiResponseSource(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("google gemini")) return "Live · Google Gemini";
  if (normalized.includes("together ai")) return "Live · Together AI";
  if (normalized.includes("openrouter")) return "Live · OpenRouter";
  if (normalized.includes("grok/xai")) return "Live · Grok/xAI";
  if (normalized.includes("groq")) return "Live · Groq";
  if (normalized.includes("замоканный")) return "Mock";
  if (normalized.includes("детерминирован")) return "Детерминированный сценарий";
  if (normalized.includes("память")) return "Память диалога";
  if (normalized.includes("fallback") || normalized.includes("live")) return "Fallback/guard";
  return "Сценарий приложения";
}

function parseDeviceContext(nav: Navigator) {
  const ua = nav.userAgent.toLowerCase();
  const maxTouchPoints = typeof nav.maxTouchPoints === "number" ? nav.maxTouchPoints : 0;
  const platform = (nav.platform || "").toLowerCase();
  const isTouchMacLike = platform.includes("mac") && maxTouchPoints > 1;
  const isIos = /iphone|ipad|ipod/.test(ua) || isTouchMacLike;
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);

  return {
    ua,
    isIos,
    isSafari,
    maxTouchPoints,
    isTouchMacLike
  };
}

function buildPwaInstallabilityCheck(): Check {
  if (typeof window === "undefined") {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: false,
      details: "Недоступно вне браузера"
    };
  }

  const nav = window.navigator;
  const secureContext = window.isSecureContext || window.location.hostname === "localhost";
  const hasServiceWorker = "serviceWorker" in nav;
  const hasBeforeInstallPrompt = "onbeforeinstallprompt" in window;
  const standalone =
    (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) ||
    (nav as Navigator & { standalone?: boolean }).standalone === true;
  const { isIos, isSafari, isTouchMacLike } = parseDeviceContext(nav);

  if (standalone) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: true,
      details: "Уже установлено: приложение запущено с PWA"
    };
  }

  if (!secureContext) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: false,
      details: "Недоступно: требуется HTTPS (или localhost)"
    };
  }

  if (!hasServiceWorker) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: false,
      details: "Недоступно: браузер не поддерживает Service Worker"
    };
  }

  if (isIos && isSafari) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: true,
      details: isTouchMacLike
        ? "iPadOS Safari (desktop UA): установка через «Поделиться» → «На экран Домой»"
        : "iOS Safari: установка через «Поделиться» → «На экран Домой»"
    };
  }

  if (hasBeforeInstallPrompt) {
    return {
      key: "pwa-installability",
      label: "PWA installability",
      ok: true,
      details: "Готово к установке: ожидается событие beforeinstallprompt"
    };
  }

  return {
    key: "pwa-installability",
    label: "PWA installability",
    ok: false,
    details: "Пока недоступно: браузер не предоставляет install prompt в текущем контексте"
  };
}

function buildChecks(): Check[] {
  if (typeof window === "undefined") {
    return [
      { key: "runtime", label: "Browser runtime", ok: false, details: "Недоступно вне браузера" }
    ];
  }
  const nav = window.navigator;
  const { isIos, isSafari, maxTouchPoints, isTouchMacLike } = parseDeviceContext(nav);
  const storageOk = (() => {
    try {
      const k = "__qa_storage_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })();
  const media = nav.mediaDevices;
  const hasCameraApi = Boolean(media && "getUserMedia" in media);
  const speechOk = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const swOk = "serviceWorker" in nav;
  const pwaPromptOk = "onbeforeinstallprompt" in window;
  const standalone = (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) || (nav as Navigator & { standalone?: boolean }).standalone === true;
  const platform = `${nav.platform || "unknown"} / ${nav.userAgent}`;

  return [
    { key: "platform", label: "Платформа", ok: true, details: platform },
    {
      key: "device-detected",
      label: "Определение устройства",
      ok: true,
      details: isIos
        ? isTouchMacLike
          ? `iPadOS (desktop UA), Safari=${isSafari ? "да" : "нет"}, touchPoints=${maxTouchPoints}`
          : `iOS, Safari=${isSafari ? "да" : "нет"}, touchPoints=${maxTouchPoints}`
        : `Не iOS, Safari=${isSafari ? "да" : "нет"}, touchPoints=${maxTouchPoints}`
    },
    { key: "storage", label: "Local storage", ok: storageOk, details: storageOk ? "Работает" : "Ограничен/недоступен" },
    { key: "camera", label: "Камера (mediaDevices)", ok: hasCameraApi, details: hasCameraApi ? "getUserMedia доступен" : "Нет доступа к getUserMedia" },
    { key: "speech", label: "Озвучка (speech synthesis)", ok: speechOk, details: speechOk ? "Speech API доступен" : "Speech API не поддерживается" },
    { key: "service-worker", label: "Service Worker", ok: swOk, details: swOk ? "Поддерживается" : "Не поддерживается" },
    { key: "pwa-prompt", label: "PWA install prompt", ok: pwaPromptOk, details: pwaPromptOk ? "beforeinstallprompt поддерживается" : "Обычно недоступно в Safari (используется iOS hint)" },
    {
      key: "standalone",
      label: "Запуск приложения",
      ok: standalone,
      details: standalone ? "Приложение запущено с PWA" : "Приложение запущено не с PWA"
    },
    buildPwaInstallabilityCheck()
  ];
}

export function QaDiagnosticsScreen({ backHref = "/settings/" }: { backHref?: string }) {
  const [checks, setChecks] = React.useState<CheckRow[]>([]);
  const [isChecking, setIsChecking] = React.useState(false);
  const [lastCheckedAt, setLastCheckedAt] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [llmProbeLoading, setLlmProbeLoading] = React.useState(false);
  const [llmProbeError, setLlmProbeError] = React.useState<string | null>(null);
  const [llmProbeResults, setLlmProbeResults] = React.useState<
    Array<{
      provider: "gemini" | "together" | "openrouter" | "grok" | "groq";
      enabled: boolean;
      model: string;
      ok: boolean;
      httpStatus?: number;
      message: string;
    }>
  >([]);
  const [aiTrace, setAiTrace] = React.useState<
    Array<{
      at: string;
      source: string;
      prompt: string;
    }>
  >([]);
  const [isAiTraceExpanded, setIsAiTraceExpanded] = React.useState(false);
  const [sessionDisabledProviders, setSessionDisabledProviders] = React.useState<LiveProvider[]>([]);
  const [sessionDisabledProviderReasons, setSessionDisabledProviderReasons] = React.useState<
    Partial<Record<LiveProvider, string>>
  >({});
  const [isTechnicalExpanded, setIsTechnicalExpanded] = React.useState(false);

  const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";

  const refreshAiTrace = React.useCallback(() => {
    if (!isDev) return;
    if (typeof window === "undefined") return;
    try {
      const key = "b2b_ai_self_check_trace_v1";
      const cur = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
        at: string;
        source: string;
        prompt: string;
      }>;
      const next = Array.isArray(cur) ? cur : [];
      setAiTrace(next.slice().reverse());
    } catch {
      setAiTrace([]);
    }
  }, [isDev]);

  const refreshSessionDisabledProviders = React.useCallback(() => {
    setSessionDisabledProviders(readSessionDisabledProviders());
    setSessionDisabledProviderReasons(readSessionDisabledProviderReasons());
  }, []);

  const resetSessionDisabledProviders = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(LIVE_BAD_PROVIDERS_SESSION_KEY);
      window.sessionStorage.removeItem(LIVE_BAD_PROVIDERS_REASON_SESSION_KEY);
    } catch {
      // ignore storage errors
    }
    refreshSessionDisabledProviders();
  }, [refreshSessionDisabledProviders]);

  const runLlmDiagnostics = React.useCallback(async () => {
    setLlmProbeLoading(true);
    setLlmProbeError(null);
    try {
      const res = await fetch("/api/llm/diagnostics", { method: "GET", cache: "no-store" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}`);
      }
      const payload = (await res.json()) as {
        results?: Array<{
          provider: "gemini" | "together" | "openrouter" | "grok" | "groq";
          enabled: boolean;
          model: string;
          ok: boolean;
          httpStatus?: number;
          message: string;
        }>;
      };
      setLlmProbeResults(Array.isArray(payload.results) ? payload.results : []);
    } catch (e) {
      setLlmProbeError(e instanceof Error ? e.message : "Не удалось выполнить диагностику AI");
    } finally {
      setLlmProbeLoading(false);
    }
  }, []);

  const runChecks = React.useCallback(async () => {
    const finalChecks = buildChecks();
    setChecks(
      finalChecks.map((c) => ({
        key: c.key,
        label: c.label,
        status: "pending",
        details: "Ожидает проверки..."
      }))
    );
    setIsChecking(true);
    setCopied(false);

    for (const item of finalChecks) {
      setChecks((prev) =>
        prev.map((c) =>
          c.key === item.key
            ? {
                ...c,
                status: "running",
                details: "Проверяется..."
              }
            : c
        )
      );
      await new Promise<void>((resolve) => window.setTimeout(resolve, 110));
      setChecks((prev) =>
        prev.map((c) =>
          c.key === item.key
            ? {
                ...c,
                status: item.ok ? "passed" : "failed",
                details: item.details
              }
            : c
        )
      );
    }

    setLastCheckedAt(new Date().toISOString());
    refreshAiTrace();
    setIsChecking(false);
  }, [refreshAiTrace]);

  React.useEffect(() => {
    void runChecks();
  }, [runChecks]);

  React.useEffect(() => {
    refreshSessionDisabledProviders();
  }, [refreshSessionDisabledProviders]);

  React.useEffect(() => {
    if (!isDev) return;
    const t = window.setInterval(() => {
      refreshAiTrace();
    }, 1200);
    return () => window.clearInterval(t);
  }, [isDev, refreshAiTrace]);

  const failedChecks = React.useMemo(() => checks.filter((c) => c.status === "failed"), [checks]);
  const failedAiProviders = React.useMemo(() => llmProbeResults.filter((r) => r.enabled && !r.ok), [llmProbeResults]);
  const technicalReport = React.useMemo(() => {
    if (!failedChecks.length && !failedAiProviders.length && !llmProbeError && !sessionDisabledProviders.length) return "";
    const lines: string[] = [];
    lines.push(`timestamp: ${new Date().toISOString()}`);
    lines.push(`url: ${typeof window !== "undefined" ? window.location.href : "n/a"}`);
    if (failedChecks.length) {
      lines.push("device-checks-failed:");
      for (const c of failedChecks) lines.push(`- ${c.label}: ${c.details}`);
    }
    if (llmProbeError) lines.push(`llm-diagnostics-error: ${llmProbeError}`);
    if (sessionDisabledProviders.length) {
      lines.push("live-providers-disabled-in-session:");
      for (const provider of sessionDisabledProviders) {
        lines.push(`- ${liveProviderLabel(provider)}: ${sessionDisabledProviderReasons[provider] ?? "ошибка провайдера"}`);
      }
    }
    if (failedAiProviders.length) {
      lines.push("llm-providers-failed:");
      for (const p of failedAiProviders) {
        lines.push(
          `- ${p.provider}: HTTP ${typeof p.httpStatus === "number" ? p.httpStatus : "n/a"}, model=${p.model}, details=${p.message}`
        );
      }
    }
    return lines.join("\n");
  }, [failedChecks, failedAiProviders, llmProbeError, sessionDisabledProviders, sessionDisabledProviderReasons]);
  const technicalReportLines = React.useMemo(() => technicalReport.split("\n"), [technicalReport]);
  const hasMoreTechnicalLines = technicalReportLines.length > 4;
  const aiTraceRows = React.useMemo(
    () =>
      aiTrace.map((item) => ({
        atLabel: new Date(item.at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        variant: item.source,
        source: classifyAiResponseSource(item.source),
        prompt: item.prompt
      })),
    [aiTrace]
  );

  const copyTechnicalReport = React.useCallback(async () => {
    if (!technicalReport || typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(technicalReport);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }, [technicalReport]);

  return (
    <div className="safe-px mx-auto max-w-[760px] space-y-4 pb-8 pt-2">
      <PageBackLink href={backHref} />

      <Card>
        <CardContent className="space-y-3 pb-4 pt-4">
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Проверка устройства (QA)</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Быстрый аудит возможностей устройства и браузера для Android, iOS, Windows и macOS.
          </p>
          <button
            type="button"
            onClick={() => void runChecks()}
            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
            disabled={isChecking}
          >
            {isChecking ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Выполняется проверка...
              </span>
            ) : (
              "Обновить проверку"
            )}
          </button>
          {lastCheckedAt ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Последняя проверка:{" "}
              {new Date(lastCheckedAt).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {checks.map((c) => (
          <Card key={c.key}>
            <CardContent className="flex items-start gap-3 py-3">
              {c.status === "running" || c.status === "pending" ? (
                <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-amber-500" />
              ) : c.status === "passed" ? (
                <CircleCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
              ) : (
                <CircleX className="mt-0.5 h-5 w-5 text-rose-600" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{c.details}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/90">
        <CardContent className="space-y-3 pb-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Bot className="h-4 w-4 text-slate-500" />
                Диагностика AI в чате
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Проверка ключей и ответа провайдеров.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="h-8 rounded-xl px-3 text-xs"
              onClick={() => void runLlmDiagnostics()}
              disabled={llmProbeLoading}
            >
              {llmProbeLoading ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Проверка
                </>
              ) : (
                "Проверить AI"
              )}
            </Button>
          </div>
          {isDev && sessionDisabledProviders.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
                Dev: отключены live-провайдеры (текущая сессия)
              </div>
              <div className="mt-1 space-y-1">
                {sessionDisabledProviders.map((provider) => (
                  <div key={`qa-disabled-provider-${provider}`} className="text-[11px] text-amber-900 dark:text-amber-100">
                    <span className="font-semibold">{liveProviderLabel(provider)}:</span>{" "}
                    {sessionDisabledProviderReasons[provider] ?? "ошибка провайдера"}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 h-8 rounded-xl px-3 text-xs"
                onClick={resetSessionDisabledProviders}
              >
                Сбросить отключения
              </Button>
            </div>
          ) : null}
          {llmProbeError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {llmProbeError}
            </div>
          ) : null}
          {llmProbeResults.length > 0 ? (
            <div className="space-y-2">
              {llmProbeResults.map((item) => (
                <div
                  key={`qa-llm-probe-${item.provider}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">{item.provider}</div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold",
                        item.ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
                      )}
                    >
                      {item.ok ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
                      {item.ok ? "OK" : item.enabled ? "Ошибка" : "Нет ключа"}
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                    Модель: <span className="font-medium">{item.model}</span>
                    {typeof item.httpStatus === "number" ? ` · HTTP ${item.httpStatus}` : ""}
                  </div>
                  {!item.ok ? (
                    <div className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">{item.message}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isDev ? (
        <Card>
          <CardContent className="space-y-2 pb-4 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Self-check: источник ответов ({aiTrace.length})
              </div>
              <Button
                type="button"
                variant="secondary"
                className="h-8 rounded-xl px-3 text-xs"
                onClick={() => setIsAiTraceExpanded((v) => !v)}
              >
                {isAiTraceExpanded ? (
                  <span className="inline-flex items-center gap-1">
                    <ChevronUp className="h-3.5 w-3.5" />
                    Свернуть
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <ChevronDown className="h-3.5 w-3.5" />
                    Развернуть
                  </span>
                )}
              </Button>
            </div>
            {aiTrace.length ? (
              isAiTraceExpanded ? (
                <div className="max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                      <tr className="text-slate-700 dark:text-slate-200">
                        <th className="px-2 py-2 font-semibold">Время</th>
                        <th className="px-2 py-2 font-semibold">Вариант ответа</th>
                        <th className="px-2 py-2 font-semibold">Источник</th>
                        <th className="px-2 py-2 font-semibold">Запрос</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiTraceRows.map((row, idx) => (
                        <tr key={`${row.atLabel}-${idx}`} className="border-t border-slate-200 align-top text-slate-600 dark:border-slate-700 dark:text-slate-300">
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.atLabel}</td>
                          <td className="px-2 py-1.5">{row.variant}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.source}</td>
                          <td className="px-2 py-1.5 max-w-[260px] truncate" title={row.prompt}>
                            {row.prompt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Журнал скрыт. Нажмите «Развернуть», чтобы посмотреть все запросы.
                </div>
              )
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">Пока нет данных. Отправьте запрос в чат и откройте QA.</div>
            )}
          </CardContent>
        </Card>
      ) : null}
      {technicalReport ? (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="space-y-2 pb-4 pt-4">
            <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Техническая информация для отправки в чат
            </div>
            <pre
              className={cn(
                "overflow-auto rounded-lg bg-white/70 p-2 text-[11px] text-amber-900 whitespace-pre-wrap break-words dark:bg-slate-900/50 dark:text-amber-100",
                !isTechnicalExpanded && hasMoreTechnicalLines ? "line-clamp-4" : "max-h-52"
              )}
            >
              {technicalReport}
            </pre>
            <div className="flex items-center gap-2">
              {hasMoreTechnicalLines ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 rounded-xl px-3 text-xs"
                  onClick={() => setIsTechnicalExpanded((v) => !v)}
                >
                  {isTechnicalExpanded ? "Свернуть" : "Показать полностью"}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                className="h-8 rounded-xl px-3 text-xs"
                onClick={() => void copyTechnicalReport()}
              >
                {copied ? "Скопировано" : "Скопировать техинфо"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
