"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronLeft, ChevronRight, Loader2, Pause, PhoneOff, Play, Sparkles, X } from "lucide-react";
import { InvoicesMarchWidget } from "@shared/components/ai/InvoicesMarchWidget";
import { InvoicesSummaryInlineWidget } from "@shared/components/ai/InvoicesSummaryInlineWidget";
import { MyNumbersInlineWidget } from "@shared/components/ai/MyNumbersInlineWidget";
import { SubscriptionBalanceInlineWidget } from "@shared/components/ai/SubscriptionBalanceInlineWidget";
import { WeeklyStatsWidget } from "@shared/components/ai/WeeklyStatsWidget";
import { ActionCard } from "@shared/components/ActionCard";
import { BottomInputBar } from "@shared/components/BottomInputBar";
import { ChatBubble } from "@shared/components/ChatBubble";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import {
  getAppealsFiltered,
  chatHistoryPresets,
  defaultChat,
  missedCallsCount,
  recentHistoryQuickPrompts,
  recentQueryChips,
  userProfile,
  standaloneCalls,
  type ChatMessage,
  type InvoiceItem
} from "@shared/lib/mockData";
import { LIVE_FETCH_TIMEOUT_MS } from "@shared/lib/aiLiveConfig";
import { emitAiMetric } from "@shared/lib/aiClientMetrics";
import { getLiveAiText, type LiveAiMessage } from "@shared/lib/liveAi";
import {
  benchmarkAndOrderLiveProviders,
  fingerprintLiveProviders,
  LIVE_PROVIDER_RANK_TTL_MS,
  orderCandidatesFromStored,
  readStoredRank,
  shouldSkipLiveProviderBenchmark,
  writeStoredRank
} from "@shared/lib/liveAiProviderRank";
import { safeParseLiveUserPrompt } from "@shared/lib/liveUserPromptSchema";
import {
  buildNoLiveKeysFallbackResponse,
  buildSafeLiveFallbackResponse,
  isLiveResponseReliable,
  LIVE_CHAIN_ALL_FAILED_FOOTER,
  resolveDeterministicResponse,
  resolveSessionMemoryResponse,
  resolveSpecialMockResponse
} from "@shared/lib/assistantResponse";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";
import { isMissedCallsSeen, markMissedCallsSeen } from "@shared/lib/runtimeFlags";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";
type LiveProvider = "gemini" | "together" | "openrouter" | "groq" | "grok";
type LiveCandidate = { provider: LiveProvider; apiKey: string; model: string };
type ProvidersProbeResponse = { enabled?: LiveProvider[] };
type ProvidersProbeState = "idle" | "ok" | "error";
const SERVER_PROXY_TOKEN = "__server_proxy__";
const LIVE_BAD_PROVIDERS_SESSION_KEY = "b2b_live_bad_providers_v1";
const LIVE_BAD_PROVIDERS_REASON_SESSION_KEY = "b2b_live_bad_providers_reason_v1";

function id() {
  return Math.random().toString(16).slice(2);
}

function nowIso() {
  return new Date().toISOString();
}

function toAiMessage(payload: Pick<ChatMessage, "text" | "widget" | "invoiceMonth" | "suggested" | "navigateTo" | "actions" | "sourceLabel">): ChatMessage {
  return {
    id: id(),
    role: "ai",
    createdAt: nowIso(),
    ...payload
  };
}

const pillBase =
  "inline-flex items-center gap-2 rounded-full bg-white px-[14px] py-[10px] text-[13px] font-medium text-[#3C4858] shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition hover:brightness-[1.02] active:scale-[0.99] dark:border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

function appendChatLog(userText: string, aiText: string, intent: string) {
  if (typeof window === "undefined") return;
  const key = "b2b_chat_logs_v1";
  let current: Array<{ at: string; user: string; ai: string; intent: string }>;
  try {
    current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
      at: string;
      user: string;
      ai: string;
      intent: string;
    }>;
    if (!Array.isArray(current)) current = [];
  } catch {
    current = [];
  }
  current.push({ at: new Date().toISOString(), user: userText, ai: aiText, intent });
  try {
    window.localStorage.setItem(key, JSON.stringify(current.slice(-300)));
  } catch {
    // private mode / quota
  }
}

function exportChatLogsToFile() {
  if (typeof window === "undefined") return false;
  const key = "b2b_chat_logs_v1";
  const raw = window.localStorage.getItem(key);
  if (!raw) return false;
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-logs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

function traceAiSource(sourceLabel: string, prompt: string): void {
  const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";
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
    next.push({ at: new Date().toISOString(), source: sourceLabel, prompt });
    window.localStorage.setItem(key, JSON.stringify(next.slice(-50)));
  } catch {
    // ignore storage issues (private mode/limits)
  }
}

function getLiveProviderLabel(provider: LiveProvider) {
  if (provider === "gemini") return "ответ от Google Gemini";
  if (provider === "together") return "ответ от Together AI";
  if (provider === "openrouter") return "ответ от OpenRouter";
  if (provider === "grok") return "ответ от Grok/xAI";
  return "ответ от Groq";
}

function getAiSourceLabel(intentUsed: string, liveProvider: LiveProvider) {
  switch (intentUsed) {
    case "special-mock":
      return "замоканный ответ";
    case "deterministic":
      return "детерминированный сценарий";
    case "session-memory":
      return "память в рамках диалога";
    case "live":
      return getLiveProviderLabel(liveProvider);
    case "live-rejected":
      return "live ответ отклонен (ненадежный)";
    case "live-unavailable":
      return "live недоступен → fallback";
    case "live-error":
      return "live ошибка → fallback";
    case "fallback-no-live":
      return "без live (fallback)";
    case "no-live-keys":
      return "ИИ не настроен (нет ключей в сборке)";
    case "live-providers-disabled":
      return "live временно отключен (провайдеры заблокированы в сессии)";
    default:
      return intentUsed;
  }
}

function formatLiveErrorLabel(err: unknown, liveProvider: LiveProvider) {
  const base = `${getLiveProviderLabel(liveProvider)} (ошибка)`;
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const trimmed = msg.trim();
  if (trimmed.toLowerCase().includes("failed to fetch")) {
    return `${base}: сеть или CORS (браузер часто блокирует прямой вызов API; см. NEXT_PUBLIC_LLM_PROXY_URL)`;
  }
  if (!trimmed) return base;
  return `${base}: ${trimmed.slice(0, 90)}`;
}

function liveProviderShort(p: LiveProvider): string {
  switch (p) {
    case "gemini":
      return "Gemini";
    case "together":
      return "Together";
    case "openrouter":
      return "OpenRouter";
    case "grok":
      return "Grok";
    default:
      return "Groq";
  }
}

function compactLiveFailureLabels(labels: string[]): string {
  if (labels.length === 0) return "";
  const joined = labels.map((l) => l.slice(0, 100)).join(" · ");
  return joined.length > 360 ? `${joined.slice(0, 357)}…` : joined;
}

function shouldDisableProviderForSession(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  if (
    msg.includes("http 401") ||
    msg.includes("http 402") ||
    msg.includes("http 403") ||
    msg.includes("http 404")
  ) {
    return true;
  }
  if (
    msg.includes("http 429") &&
    (msg.includes("quota") || msg.includes("resource_exhausted") || msg.includes("credit"))
  ) {
    return true;
  }
  return (
    msg.includes("invalid api key") ||
    msg.includes("credit limit exceeded") ||
    msg.includes("model_not_available") ||
    msg.includes("model not found") ||
    msg.includes("no endpoints found") ||
    msg.includes("doesn't have any credits") ||
    msg.includes("does not have permission")
  );
}

function getDisableReason(err: unknown): string {
  const msg = (err instanceof Error ? err.message : String(err)).trim();
  if (!msg) return "ошибка провайдера";
  return msg.length > 140 ? `${msg.slice(0, 137)}...` : msg;
}

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

function writeSessionDisabledProviders(providers: LiveProvider[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LIVE_BAD_PROVIDERS_SESSION_KEY, JSON.stringify(providers));
  } catch {
    // private mode / quota
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

function writeSessionDisabledProviderReasons(reasons: Partial<Record<LiveProvider, string>>): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LIVE_BAD_PROVIDERS_REASON_SESSION_KEY, JSON.stringify(reasons));
  } catch {
    // private mode / quota
  }
}

function buildLiveCandidates(args: {
  geminiApiKey?: string;
  geminiModel: string;
  togetherApiKey?: string;
  togetherModel: string;
  openRouterApiKey?: string;
  openRouterModel?: string;
  grokApiKey?: string;
  grokModel: string;
  groqApiKey?: string;
  groqModel: string;
}): LiveCandidate[] {
  const candidates: LiveCandidate[] = [];
  if (args.geminiApiKey) {
    candidates.push({ provider: "gemini", apiKey: args.geminiApiKey, model: args.geminiModel });
  }
  if (args.togetherApiKey) {
    candidates.push({ provider: "together", apiKey: args.togetherApiKey, model: args.togetherModel });
  }
  if (args.openRouterApiKey) {
    candidates.push({
      provider: "openrouter",
      apiKey: args.openRouterApiKey,
      model: args.openRouterModel || "mistralai/mistral-small-3.2-24b-instruct:free"
    });
  }
  if (args.grokApiKey) {
    candidates.push({ provider: "grok", apiKey: args.grokApiKey, model: args.grokModel });
  }
  if (args.groqApiKey) {
    candidates.push({ provider: "groq", apiKey: args.groqApiKey, model: args.groqModel });
  }
  return candidates;
}

function buildDataContextSummary(invoices: InvoiceItem[]) {
  const perMonth = ["январь", "февраль", "март", "апрель"]
    .map((m) => {
      const monthInvoices = invoices.filter((inv) => inv.periodLabel.includes(m));
      const sum = monthInvoices.reduce((s, inv) => s + inv.amountRub, 0);
      const unpaid = monthInvoices.filter((inv) => inv.status === "pay").length;
      return `${m}: счетов ${monthInvoices.length}, сумма ${sum.toLocaleString("ru-RU")} ₽, неоплаченных ${unpaid}`;
    })
    .join("; ");
  const missed = standaloneCalls.filter((c) => c.missed).length;
  return `Счета по месяцам: ${perMonth}. Звонки: всего ${standaloneCalls.length}, пропущенных ${missed}.`;
}

export function AiAssistantScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = React.useState<ChatMessage[]>(defaultChat);
  const [input, setInput] = React.useState("");
  const [openHistory, setOpenHistory] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [chipTags, setChipTags] = React.useState<string[]>(() => [...recentQueryChips]);
  const [showMissedCard, setShowMissedCard] = React.useState(true);
  const [showWeeklyCard, setShowWeeklyCard] = React.useState(true);
  const [showAiAssistCard] = React.useState(true);
  const [heroCard, setHeroCard] = React.useState(0);
  const [weeklySpeaking, setWeeklySpeaking] = React.useState(false);
  const heroSwipeStartX = React.useRef<number | null>(null);
  const heroWheelLastAt = React.useRef(0);
  const heroScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [heroSlidePx, setHeroSlidePx] = React.useState(0);
  const heroCardRef = React.useRef(0);
  heroCardRef.current = heroCard;
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  const handledQueryRef = React.useRef<string>("");
  const sendSeqRef = React.useRef(0);
  const liveAbortRef = React.useRef<AbortController | null>(null);
  // Keep browser timer id type to avoid Node.js Timeout mismatch in CI.
  const replyTimeoutRef = React.useRef<number | null>(null);
  const aiReplyPendingRef = React.useRef(false);
  const [aiReplyPending, setAiReplyPending] = React.useState(false);
  const runtimeInvoices = useRuntimeInvoices();
  const chatAppeals = React.useMemo(() => getAppealsFiltered("all").filter((a) => a.status === "active").slice(0, 3), []);
  const inWorkAppealsCount = React.useMemo(() => chatAppeals.filter((a) => a.badgeLabel.includes("работе")).length, [chatAppeals]);
  const signPendingAppealsCount = React.useMemo(() => chatAppeals.filter((a) => a.badgeLabel.includes("подпис")).length, [chatAppeals]);
  const missedChipCustom = useUiCustomization("assistant.home.missed");
  const appealsChipCustom = useUiCustomization("assistant.home.appeals");
  const invoicesChipCustom = useUiCustomization("assistant.home.invoices");
  const unpaidChipCustom = useUiCustomization("assistant.home.unpaid");
  const unpaidInvoicesCount = runtimeInvoices.filter((inv) => inv.status === "pay").length;
  const missedCalls = React.useMemo(() => standaloneCalls.filter((c) => c.missed), []);
  const primaryMissedCall = missedCalls[0];
  const otherMissedCalls = React.useMemo(() => missedCalls.slice(1), [missedCalls]);
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
  const togetherApiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY?.trim();
  const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.trim();
  const grokApiKey = process.env.NEXT_PUBLIC_GROK_API_KEY?.trim();
  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim();
  const liveProxyUrl = process.env.NEXT_PUBLIC_LLM_PROXY_URL?.trim() || "/api/llm";
  const geminiModel = process.env.NEXT_PUBLIC_GEMINI_MODEL ?? "gemini-2.0-flash";
  const togetherModel = process.env.NEXT_PUBLIC_TOGETHER_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct-Turbo";
  const openRouterModel = process.env.NEXT_PUBLIC_OPENROUTER_MODEL;
  const grokModel = process.env.NEXT_PUBLIC_GROK_MODEL ?? "grok-3-mini";
  const groqModel = process.env.NEXT_PUBLIC_GROQ_MODEL ?? "llama-3.1-8b-instant";
  const [serverEnabledProviders, setServerEnabledProviders] = React.useState<LiveProvider[]>([]);
  const [providersProbeState, setProvidersProbeState] = React.useState<ProvidersProbeState>("idle");
  const [sessionDisabledProviders, setSessionDisabledProviders] = React.useState<LiveProvider[]>([]);
  const [sessionDisabledProviderReasons, setSessionDisabledProviderReasons] = React.useState<
    Partial<Record<LiveProvider, string>>
  >({});
  const resetDisabledProviders = React.useCallback(() => {
    setSessionDisabledProviders([]);
    setSessionDisabledProviderReasons({});
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(LIVE_BAD_PROVIDERS_SESSION_KEY);
        window.sessionStorage.removeItem(LIVE_BAD_PROVIDERS_REASON_SESSION_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  React.useEffect(() => {
    setSessionDisabledProviders(readSessionDisabledProviders());
    setSessionDisabledProviderReasons(readSessionDisabledProviderReasons());
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const ac = new AbortController();
    void fetch("/api/llm/providers", {
      method: "GET",
      cache: "no-store",
      signal: ac.signal
    })
      .then(async (res) => {
        if (!res.ok) return;
        const payload = (await res.json()) as ProvidersProbeResponse;
        const enabled = Array.isArray(payload.enabled)
          ? payload.enabled.filter(
              (p): p is LiveProvider => p === "gemini" || p === "together" || p === "openrouter" || p === "grok" || p === "groq"
            )
          : [];
        setProvidersProbeState("ok");
        setServerEnabledProviders(enabled);
      })
      .catch(() => {
        setProvidersProbeState("error");
        setServerEnabledProviders([]);
      });
    return () => ac.abort();
  }, []);

  const baseLiveCandidates = React.useMemo(
    () => {
      const fromPublic = buildLiveCandidates({
        geminiApiKey,
        geminiModel,
        togetherApiKey,
        togetherModel,
        openRouterApiKey,
        openRouterModel,
        grokApiKey,
        grokModel,
        groqApiKey,
        groqModel
      });
      if (fromPublic.length > 0) return fromPublic;
      if (serverEnabledProviders.length === 0) return [];
      return buildLiveCandidates({
        geminiApiKey: serverEnabledProviders.includes("gemini") ? SERVER_PROXY_TOKEN : undefined,
        geminiModel,
        togetherApiKey: serverEnabledProviders.includes("together") ? SERVER_PROXY_TOKEN : undefined,
        togetherModel,
        openRouterApiKey: serverEnabledProviders.includes("openrouter") ? SERVER_PROXY_TOKEN : undefined,
        openRouterModel,
        grokApiKey: serverEnabledProviders.includes("grok") ? SERVER_PROXY_TOKEN : undefined,
        grokModel,
        groqApiKey: serverEnabledProviders.includes("groq") ? SERVER_PROXY_TOKEN : undefined,
        groqModel
      });
    },
    [
      geminiApiKey,
      geminiModel,
      togetherApiKey,
      togetherModel,
      openRouterApiKey,
      openRouterModel,
      grokApiKey,
      grokModel,
      groqApiKey,
      groqModel,
      serverEnabledProviders
    ]
  );

  const [rankedLiveCandidates, setRankedLiveCandidates] = React.useState<LiveCandidate[] | null>(null);
  const liveCandidates = React.useMemo(() => {
    if (sessionDisabledProviders.length === 0) return rankedLiveCandidates ?? baseLiveCandidates;
    const blocked = new Set(sessionDisabledProviders);
    return (rankedLiveCandidates ?? baseLiveCandidates).filter((c) => !blocked.has(c.provider));
  }, [rankedLiveCandidates, baseLiveCandidates, sessionDisabledProviders]);
  const isLiveEnabled = liveCandidates.length > 0;
  const primaryLiveProvider: LiveProvider = liveCandidates[0]?.provider ?? "groq";
  const buildServerProxyCandidates = React.useCallback(
    (enabledProviders: LiveProvider[]) =>
      buildLiveCandidates({
        geminiApiKey: enabledProviders.includes("gemini") ? SERVER_PROXY_TOKEN : undefined,
        geminiModel,
        togetherApiKey: enabledProviders.includes("together") ? SERVER_PROXY_TOKEN : undefined,
        togetherModel,
        openRouterApiKey: enabledProviders.includes("openrouter") ? SERVER_PROXY_TOKEN : undefined,
        openRouterModel,
        grokApiKey: enabledProviders.includes("grok") ? SERVER_PROXY_TOKEN : undefined,
        grokModel,
        groqApiKey: enabledProviders.includes("groq") ? SERVER_PROXY_TOKEN : undefined,
        groqModel
      }),
    [geminiModel, togetherModel, openRouterModel, grokModel, groqModel]
  );

  const fetchLiveCandidatesFromServer = React.useCallback(async (): Promise<LiveCandidate[]> => {
    if (typeof window === "undefined") return [];
    try {
      const res = await fetch("/api/llm/providers", { method: "GET", cache: "no-store" });
      if (!res.ok) return [];
      const payload = (await res.json()) as ProvidersProbeResponse;
      const enabled = Array.isArray(payload.enabled)
        ? payload.enabled.filter(
            (p): p is LiveProvider => p === "gemini" || p === "together" || p === "openrouter" || p === "grok" || p === "groq"
          )
        : [];
      setProvidersProbeState("ok");
      setServerEnabledProviders(enabled);
      const blocked = new Set(sessionDisabledProviders);
      return buildServerProxyCandidates(enabled).filter((c) => !blocked.has(c.provider));
    } catch {
      setProvidersProbeState("error");
      return [];
    }
  }, [buildServerProxyCandidates, sessionDisabledProviders]);

  React.useEffect(() => {
    if (baseLiveCandidates.length <= 1) {
      setRankedLiveCandidates(baseLiveCandidates.length === 1 ? baseLiveCandidates : null);
      return;
    }
    if (shouldSkipLiveProviderBenchmark()) {
      setRankedLiveCandidates(null);
      return;
    }

    const fp = fingerprintLiveProviders(baseLiveCandidates);
    const stored = readStoredRank();
    if (
      stored &&
      stored.fingerprint === fp &&
      Date.now() - stored.measuredAt < LIVE_PROVIDER_RANK_TTL_MS
    ) {
      const fromCache = orderCandidatesFromStored(baseLiveCandidates, stored);
      if (fromCache) {
        setRankedLiveCandidates(fromCache);
        if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
          console.info("[live-ai] порядок провайдеров из кэша (мс)", stored.ms);
        }
        return;
      }
    }

    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      try {
        const { ordered, ms } = await benchmarkAndOrderLiveProviders({
          candidates: baseLiveCandidates,
          proxyUrl: liveProxyUrl,
          signal: ac.signal
        });
        if (cancelled) return;
        setRankedLiveCandidates(ordered);
        writeStoredRank({
          v: 1,
          fingerprint: fp,
          measuredAt: Date.now(),
          order: ordered.map((c) => c.provider),
          ms
        });
        if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
          console.info("[live-ai] замер скорости (мс, быстрее → выше в списке)", ms);
        }
      } catch {
        if (!cancelled) setRankedLiveCandidates(null);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [baseLiveCandidates, liveProxyUrl]);

  React.useEffect(() => {
    setShowMissedCard(!isMissedCallsSeen());
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const setPending = React.useCallback((v: boolean) => {
    aiReplyPendingRef.current = v;
    setAiReplyPending(v);
  }, []);

  const cancelPendingReply = React.useCallback(() => {
    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
    liveAbortRef.current?.abort();
    liveAbortRef.current = null;
    sendSeqRef.current++;
    setPending(false);
    emitAiMetric({ type: "live_aborted", reason: "user_cancel" });
  }, [setPending]);

  React.useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        window.clearTimeout(replyTimeoutRef.current);
        replyTimeoutRef.current = null;
      }
      liveAbortRef.current?.abort();
      liveAbortRef.current = null;
      if (aiReplyPendingRef.current) {
        emitAiMetric({ type: "live_aborted", reason: "unmount" });
      }
    };
  }, []);

  React.useEffect(() => {
    const scrollToEnd = (behavior: ScrollBehavior) => {
      chatEndRef.current?.scrollIntoView({ behavior, block: "end" });
    };
    scrollToEnd("auto");
    const t = window.setTimeout(() => scrollToEnd("smooth"), 180);
    return () => window.clearTimeout(t);
  }, [messages]);

  React.useEffect(() => {
    if (searchParams.get("reset") !== "1") return;
    setMessages(defaultChat);
    setInput("");
    setOpenHistory(false);
    setToast(null);
    setChipTags([...recentQueryChips]);
    router.replace("/assistant/");
  }, [router, searchParams]);

  React.useEffect(() => {
    const q = searchParams.get("q");
    if (!q || handledQueryRef.current === q) return;
    handledQueryRef.current = q;
    setInput(q);
    window.setTimeout(() => send(q), 60);
    router.replace("/assistant/");
  }, [router, searchParams]);

  React.useEffect(() => {
    if (searchParams.get("openChat") !== "1") return;
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        toAiMessage({
          text: "Здравствуйте! Я ваш бизнес-ассистент. Чем могу помочь?",
          suggested: ["Пропущенные звонки", "Счета на оплату", "Обращения"],
          sourceLabel: "системное приветствие"
        })
      ];
    });
    router.replace("/assistant/");
  }, [router, searchParams]);

  const send = (text?: string) => {
    const raw = (text ?? input).trim();
    if (!raw) return;
    const validated = safeParseLiveUserPrompt(raw);
    if (!validated.ok) {
      setToast(validated.error);
      return;
    }
    const v = validated.value;
    if (/экспорт.*(лог|журнал)|скач.*(лог|журнал)/i.test(v)) {
      const ok = exportChatLogsToFile();
      setToast(ok ? "Журнал чата выгружен в JSON." : "Журнал пуст: пока нет сохраненных диалогов.");
      return;
    }

    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
    liveAbortRef.current?.abort();
    liveAbortRef.current = null;
    const mySeq = ++sendSeqRef.current;

    const userMsg: ChatMessage = { id: id(), role: "user", text: v, createdAt: nowIso() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);

    replyTimeoutRef.current = window.setTimeout(async () => {
      replyTimeoutRef.current = null;
      const finishReply = () => {
        if (mySeq === sendSeqRef.current) setPending(false);
      };

      if (mySeq !== sendSeqRef.current) return;

      const w =
        typeof window !== "undefined"
          ? (window as unknown as { __E2E_ASSISTANT_DELAY_MS?: number }).__E2E_ASSISTANT_DELAY_MS
          : undefined;
      if (typeof w === "number" && w > 0 && v === "__E2E_SLOW__") {
        await new Promise<void>((r) => window.setTimeout(r, w));
        if (mySeq !== sendSeqRef.current) return;
      }

      const specialMock = resolveSpecialMockResponse(v);
      if (specialMock) {
        const resolved = toAiMessage({ ...specialMock, sourceLabel: getAiSourceLabel("special-mock", primaryLiveProvider) });
        setMessages((m) => [...m, resolved]);
        appendChatLog(v, resolved.text, "special-mock");
        traceAiSource(getAiSourceLabel("special-mock", primaryLiveProvider), v);
        finishReply();
        return;
      }

      const deterministic = resolveDeterministicResponse(v, runtimeInvoices);
      if (deterministic) {
        const resolved = toAiMessage({ ...deterministic, sourceLabel: getAiSourceLabel("deterministic", primaryLiveProvider) });
        setMessages((m) => [...m, resolved]);
        appendChatLog(v, resolved.text, "deterministic");
        traceAiSource(getAiSourceLabel("deterministic", primaryLiveProvider), v);
        if (resolved.navigateTo) {
          window.setTimeout(() => router.push(resolved.navigateTo!), 320);
        }
        finishReply();
        return;
      }

      const sessionMemory = resolveSessionMemoryResponse(
        v,
        [...messages, userMsg].filter((m) => m.role === "user").map((m) => m.text)
      );
      if (sessionMemory) {
        const resolved = toAiMessage({ ...sessionMemory, sourceLabel: getAiSourceLabel("session-memory", primaryLiveProvider) });
        setMessages((m) => [...m, resolved]);
        appendChatLog(v, resolved.text, "session-memory");
        traceAiSource(getAiSourceLabel("session-memory", primaryLiveProvider), v);
        finishReply();
        return;
      }

      const activeCandidates =
        liveCandidates.length > 0 ? liveCandidates : await fetchLiveCandidatesFromServer();
      const hasLiveCandidates = activeCandidates.length > 0;
      const activePrimaryProvider: LiveProvider = activeCandidates[0]?.provider ?? primaryLiveProvider;
      const noCandidatesBecauseSessionDisabled =
        !hasLiveCandidates && serverEnabledProviders.length > 0 && sessionDisabledProviders.length > 0;
      const hasPublicClientKeys = Boolean(
        geminiApiKey || togetherApiKey || openRouterApiKey || grokApiKey || groqApiKey
      );
      const confirmedNoLiveKeys =
        !hasLiveCandidates &&
        !noCandidatesBecauseSessionDisabled &&
        !hasPublicClientKeys &&
        providersProbeState === "ok" &&
        serverEnabledProviders.length === 0;
      let resolved: ChatMessage = toAiMessage({
        ...(hasLiveCandidates || noCandidatesBecauseSessionDisabled || !confirmedNoLiveKeys
          ? buildSafeLiveFallbackResponse()
          : buildNoLiveKeysFallbackResponse()),
        sourceLabel: getAiSourceLabel(
          hasLiveCandidates
            ? "fallback-no-live"
            : noCandidatesBecauseSessionDisabled
              ? "live-providers-disabled"
              : confirmedNoLiveKeys
                ? "no-live-keys"
                : "live-unavailable",
          activePrimaryProvider
        )
      });
      let intentUsed = hasLiveCandidates
        ? "fallback-no-live"
        : noCandidatesBecauseSessionDisabled
          ? "live-providers-disabled"
          : confirmedNoLiveKeys
            ? "no-live-keys"
            : "live-unavailable";
      let resolvedLiveProvider: LiveProvider = activePrimaryProvider;

      try {
        if (hasLiveCandidates) {
          const controller = new AbortController();
          liveAbortRef.current = controller;
          const abortMeta: { kind: "timeout" | "supersede" } = { kind: "supersede" };
          const timeout = window.setTimeout(() => {
            abortMeta.kind = "timeout";
            controller.abort();
          }, LIVE_FETCH_TIMEOUT_MS);
          try {
            const history: LiveAiMessage[] = [...messages, userMsg]
              .slice(-6)
              .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
            let liveResolved = false;
            let lastErrorLabel: string | null = null;
            const failureLabels: string[] = [];
            const disableCandidates = new Set<LiveProvider>();
            const disableReasons: Partial<Record<LiveProvider, string>> = {};
            for (const candidate of activeCandidates) {
              resolvedLiveProvider = candidate.provider;
              try {
                const liveText = await getLiveAiText({
                  prompt: v,
                  history,
                  apiKey: candidate.apiKey,
                  model: candidate.model,
                  provider: candidate.provider,
                  proxyUrl: liveProxyUrl,
                  contextSummary: buildDataContextSummary(runtimeInvoices),
                  signal: controller.signal
                });
                if (mySeq !== sendSeqRef.current) return;
                if (!liveText) {
                  failureLabels.push(
                    `${liveProviderShort(candidate.provider)}: нет текста или ответ отклонён фильтром`
                  );
                  continue;
                }
                if (isLiveResponseReliable(v, liveText)) {
                  resolved = {
                    id: id(),
                    role: "ai",
                    text: liveText,
                    sourceLabel: getAiSourceLabel("live", candidate.provider),
                    createdAt: nowIso()
                  };
                } else {
                  resolved = {
                    id: id(),
                    role: "ai",
                    text: liveText,
                    sourceLabel: `${getLiveProviderLabel(candidate.provider)} (без строгой верификации)`,
                    createdAt: nowIso()
                  };
                }
                intentUsed = "live";
                liveResolved = true;
                break;
              } catch (e) {
                if (mySeq !== sendSeqRef.current) return;
                if (e instanceof DOMException && e.name === "AbortError") {
                  emitAiMetric({
                    type: "live_aborted",
                    reason: abortMeta.kind === "timeout" ? "timeout" : "new_message"
                  });
                  finishReply();
                  return;
                }
                if (shouldDisableProviderForSession(e)) {
                  disableCandidates.add(candidate.provider);
                  disableReasons[candidate.provider] = getDisableReason(e);
                }
                lastErrorLabel = formatLiveErrorLabel(e, candidate.provider);
                failureLabels.push(lastErrorLabel);
              }
            }
            if (disableCandidates.size > 0) {
              setSessionDisabledProviders((prev) => {
                const merged = Array.from(new Set([...prev, ...Array.from(disableCandidates)]));
                writeSessionDisabledProviders(merged);
                return merged;
              });
              setSessionDisabledProviderReasons((prev) => {
                const merged: Partial<Record<LiveProvider, string>> = { ...prev, ...disableReasons };
                writeSessionDisabledProviderReasons(merged);
                return merged;
              });
            }
            if (!liveResolved) {
              const baseFb = buildSafeLiveFallbackResponse();
              const foot = failureLabels.length > 0 ? LIVE_CHAIN_ALL_FAILED_FOOTER : "";
              const sourceCombined =
                failureLabels.length > 0
                  ? compactLiveFailureLabels(failureLabels)
                  : lastErrorLabel ?? getAiSourceLabel("live-unavailable", resolvedLiveProvider);
              resolved = toAiMessage({
                ...baseFb,
                text: baseFb.text + foot,
                sourceLabel: sourceCombined
              });
              intentUsed = failureLabels.length > 0 || lastErrorLabel ? "live-error" : "live-unavailable";
            }
          } catch (e) {
            if (mySeq !== sendSeqRef.current) return;
            if (e instanceof DOMException && e.name === "AbortError") {
              emitAiMetric({
                type: "live_aborted",
                reason: abortMeta.kind === "timeout" ? "timeout" : "new_message"
              });
              finishReply();
              return;
            }
            resolved = toAiMessage({
              ...buildSafeLiveFallbackResponse(),
              sourceLabel: formatLiveErrorLabel(e, resolvedLiveProvider)
            });
            intentUsed = "live-error";
          } finally {
            window.clearTimeout(timeout);
            if (liveAbortRef.current === controller) liveAbortRef.current = null;
          }
        }
      } catch {
        if (mySeq !== sendSeqRef.current) return;
      }

      if (mySeq !== sendSeqRef.current) return;

      setMessages((m) => [...m, resolved]);
      appendChatLog(v, resolved.text, intentUsed);
      traceAiSource(getAiSourceLabel(intentUsed, resolvedLiveProvider), v);
      if (resolved.navigateTo) {
        window.setTimeout(() => router.push(resolved.navigateTo!), 320);
      }
      finishReply();
    }, 120);
  };

  const hasChat = messages.length > 0;
  const visibleHeroCards = React.useMemo(() => {
    const cards: Array<"missed" | "weekly" | "assist"> = [];
    if (showWeeklyCard) cards.push("weekly");
    if (showMissedCard) cards.push("missed");
    if (showAiAssistCard) cards.push("assist");
    return cards;
  }, [showAiAssistCard, showMissedCard, showWeeklyCard]);

  const heroStridePx = heroSlidePx + 12;

  React.useLayoutEffect(() => {
    if (hasChat) return;
    const el = heroScrollRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setHeroSlidePx(Math.max(0, Math.round(w * 0.88)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasChat]);

  React.useLayoutEffect(() => {
    if (hasChat) return;
    const el = heroScrollRef.current;
    if (!el || heroStridePx <= 0) return;
    el.scrollLeft = heroCardRef.current * heroStridePx;
  }, [hasChat, heroSlidePx, heroStridePx]);

  React.useEffect(() => {
    if (heroCard >= visibleHeroCards.length) {
      setHeroCard(Math.max(0, visibleHeroCards.length - 1));
    }
  }, [heroCard, visibleHeroCards.length]);

  const goToHeroSlide = React.useCallback(
    (idx: number, behavior: ScrollBehavior = "smooth") => {
      const el = heroScrollRef.current;
      const stride = heroSlidePx + 12;
      const clamped = Math.max(0, Math.min(visibleHeroCards.length - 1, idx));
      setHeroCard(clamped);
      if (!el || stride <= 0) return;
      el.scrollTo({ left: clamped * stride, behavior });
    },
    [heroSlidePx, visibleHeroCards.length]
  );

  const moveHeroCard = (delta: number) => {
    if (visibleHeroCards.length < 2) return;
    setHeroCard((prev) => {
      const next = Math.max(0, Math.min(visibleHeroCards.length - 1, prev + delta));
      queueMicrotask(() => {
        const el = heroScrollRef.current;
        const stride = heroSlidePx + 12;
        if (el && stride > 0) {
          el.scrollTo({ left: next * stride, behavior: "smooth" });
        }
      });
      return next;
    });
  };

  const handleHeroScroll = React.useCallback(() => {
    const el = heroScrollRef.current;
    if (!el) return;
    const stride = heroSlidePx + 12;
    if (stride <= 0) return;
    const idx = Math.round(el.scrollLeft / stride);
    const clamped = Math.max(0, Math.min(visibleHeroCards.length - 1, idx));
    setHeroCard(clamped);
  }, [heroSlidePx, visibleHeroCards.length]);

  const onHeroPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    heroSwipeStartX.current = e.clientX;
  };
  const onHeroPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = heroSwipeStartX.current;
    heroSwipeStartX.current = null;
    if (start === null) return;
    const delta = e.clientX - start;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) moveHeroCard(1);
    if (delta > 0) moveHeroCard(-1);
  };
  const onHeroWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - heroWheelLastAt.current < 220) return;
    const horizontal = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(horizontal) < 28) return;
    heroWheelLastAt.current = now;
    if (horizontal > 0) moveHeroCard(1);
    if (horizontal < 0) moveHeroCard(-1);
  };

  return (
    <div className="space-y-5 pb-[140px]">
      {!hasChat ? (
        <>
          <div
            className="-mx-1 cursor-grab px-1 active:cursor-grabbing"
            data-no-assistant-nav-swipe
            data-testid="assistant-hero-swiper"
            onPointerDown={onHeroPointerDown}
            onPointerUp={onHeroPointerUp}
            onPointerCancel={() => {
              heroSwipeStartX.current = null;
            }}
            onWheel={onHeroWheel}
            style={{ touchAction: "pan-y" }}
          >
            <div
              ref={heroScrollRef}
              data-testid="assistant-hero-slot"
              className="relative h-[120px] overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={handleHeroScroll}
              style={{ touchAction: "pan-x pinch-zoom" }}
            >
              <div className="flex h-full gap-3">
                {visibleHeroCards.map((slideKind) => (
                  <div
                    key={slideKind}
                    className="h-full shrink-0 snap-center snap-always"
                    style={
                      heroSlidePx > 0
                        ? { width: heroSlidePx, minWidth: heroSlidePx, maxWidth: heroSlidePx }
                        : { minWidth: "min(360px, calc(100vw - 2rem))" }
                    }
                  >
                    {slideKind === "missed" ? (
                      <button
                        type="button"
                        className="block h-full w-full text-left"
                        onClick={() => {
                          markMissedCallsSeen();
                          setShowMissedCard(false);
                          const firstMissed = standaloneCalls.find((c) => c.missed)?.id ?? "c1";
                          router.push(`/call/${firstMissed}/`);
                        }}
                      >
                        <Card className="h-full rounded-[24px] border-[#E8EAED] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
                          <CardContent className="flex h-full items-center gap-3 pb-3 pt-3">
                            <span className="relative shrink-0">
                              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-slate-700">
                                <PhoneOff className="h-6 w-6 text-[#E53935]" />
                              </span>
                              <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#E53935] px-1 text-[11px] font-bold text-white">
                                x1
                              </span>
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <div className="mt-0.5 truncate text-[18px] font-semibold leading-tight text-[#1F2430] dark:text-slate-100">
                                  Доставка офисной техники
                                </div>
                                <span className="shrink-0 text-[12px] font-medium tabular-nums text-[#C3C7D4] dark:text-slate-400">
                                  12:42
                                </span>
                              </div>
                              <div className="mt-1 text-[14px] leading-tight text-[#7C8597] dark:text-slate-300">
                                Пропущенный
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    ) : null}
                    {slideKind === "weekly" ? (
                      <Card className="h-full rounded-[20px] border-[#E5E7EE] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="flex h-full items-center gap-3 overflow-hidden pb-2 pt-2">
                          <button
                            type="button"
                            className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full bg-[#ECEAFD]"
                            onClick={() => {
                              if (
                                typeof window === "undefined" ||
                                !("speechSynthesis" in window) ||
                                !("SpeechSynthesisUtterance" in window)
                              ) {
                                return;
                              }
                              if (weeklySpeaking) {
                                window.speechSynthesis.cancel();
                                setWeeklySpeaking(false);
                                return;
                              }
                              const u = new SpeechSynthesisUtterance(
                                "Еженедельный отчет: 126 звонков, 1 пропущенный, средняя длительность две минуты сорок секунд. Есть 4 клиента в риске по оплате."
                              );
                              u.lang = "ru-RU";
                              u.onend = () => setWeeklySpeaking(false);
                              u.onerror = () => setWeeklySpeaking(false);
                              setWeeklySpeaking(true);
                              window.speechSynthesis.cancel();
                              window.speechSynthesis.speak(u);
                            }}
                          >
                            {weeklySpeaking ? <Pause className="h-4 w-4 text-[#4B5563]" /> : <Play className="h-4 w-4 text-[#4B5563]" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              className="flex items-center gap-1 text-sm font-semibold text-[#343A4A] dark:text-slate-100"
                              onClick={() => {
                                setInput("звонки за неделю");
                                window.setTimeout(() => send("звонки за неделю"), 60);
                              }}
                            >
                              <Sparkles className="h-4 w-4 text-[#9C8AF2]" />
                              Еженедельный отчет
                            </button>
                            <div className="text-xs text-[#A2A8B8]">за 24 апреля</div>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#6B7280] dark:text-slate-300">
                              126 звонков, 1 пропущенный, средняя длительность 2:40. Есть 4 клиента в риске по оплате.
                            </p>
                            <button
                              type="button"
                              className="mt-1 text-xs font-semibold text-accent-dark underline dark:text-accent-yellow"
                              onClick={() => {
                                setInput("звонки за неделю");
                                window.setTimeout(() => send("звонки за неделю"), 60);
                              }}
                            >
                              Открыть в чате
                            </button>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 rounded-full p-1 text-[#C7CBD6] hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={() => setShowWeeklyCard(false)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </CardContent>
                      </Card>
                    ) : null}
                    {slideKind === "assist" ? (
                      <Card className="h-full rounded-[20px] border-[#DDE4FF] bg-gradient-to-br from-[#F7F9FF] to-white shadow-none dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
                        <CardContent className="flex h-full items-center gap-3 pb-3 pt-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEAFD]">
                            <Bot className="h-4 w-4 text-[#4B5563]" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-[#343A4A] dark:text-slate-100">AI ассистенты подключены</div>
                            <div className="mt-0.5 text-xs leading-relaxed text-[#6B7280] dark:text-slate-300">
                              У вас подключены AI ассистенты, но вы ими еще не пользовались.
                            </div>
                            <button
                              type="button"
                              className="mt-1 rounded-full bg-accent-yellow px-4 py-1.5 text-xs font-semibold text-[#2F3141] transition hover:brightness-95"
                              onClick={() => {
                                const assistantsPrompt = "Вам доступны ИИ ассистенты";
                                setInput(assistantsPrompt);
                                window.setTimeout(() => send(assistantsPrompt), 60);
                              }}
                            >
                              Начать
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            {visibleHeroCards.length > 1 ? (
              <div className="mt-2 flex justify-center gap-1.5">
                {visibleHeroCards.map((_, idx) => (
                  <button
                    key={`hero-dot-${idx}`}
                    type="button"
                    className={cn("h-1.5 w-5 rounded-full", heroCard === idx ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-600")}
                    onClick={() => goToHeroSlide(idx)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-center px-1 pt-1 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[22px] font-semibold tracking-tight text-[#212529] dark:text-slate-100">
                Билайн
              </span>
              <Image
                src={sphereSrc}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-black/5"
              />
              <span className="text-[22px] font-semibold tracking-tight text-accent-yellow">One</span>
            </div>
            <h1 className="mt-3 max-w-[18rem] text-[26px] font-semibold leading-[1.15] tracking-tight text-[#212529] dark:text-slate-100">
              Ваш бизнес ассистент
            </h1>
            <p className="mt-2 text-[13px] text-[#8E8E93] dark:text-slate-400">{userProfile.legalName}</p>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <div className="flex w-full max-w-[360px] justify-center gap-2.5">
              <button
                type="button"
                className={cn(pillBase, getCustomizationButtonClasses(missedChipCustom.dimmedDisabled))}
                disabled={missedChipCustom.dimmedDisabled}
                onClick={() => {
                  if (missedChipCustom.useMock) {
                    setToast("Пропущенные звонки (мок из кастомизации).");
                    return;
                  }
                  markMissedCallsSeen();
                  setShowMissedCard(false);
                  window.setTimeout(() => send("Пропущенные звонки"), 60);
                }}
              >
                <span>Пропущенные звонки</span>
                {!isMissedCallsSeen() ? (
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#FF3B4E] px-1.5 text-[11px] font-bold text-white">
                    {missedCallsCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className={cn(pillBase, getCustomizationButtonClasses(appealsChipCustom.dimmedDisabled))}
                disabled={appealsChipCustom.dimmedDisabled}
                onClick={() => {
                  if (appealsChipCustom.useMock) {
                    setToast("Обращения (мок из кастомизации).");
                    return;
                  }
                  window.setTimeout(() => send("Обращения"), 60);
                }}
              >
                <span>Обращения</span>
              </button>
            </div>
            <div className="flex w-full max-w-[360px] flex-wrap justify-center gap-2.5">
              <button
                type="button"
                className={cn(pillBase, getCustomizationButtonClasses(invoicesChipCustom.dimmedDisabled))}
                disabled={invoicesChipCustom.dimmedDisabled}
                onClick={() => {
                  if (invoicesChipCustom.dimmedDisabled) {
                    return;
                  }
                  if (invoicesChipCustom.useMock) {
                    setToast("Мои продукты (мок из кастомизации).");
                    return;
                  }
                  window.setTimeout(() => send("Мои продукты"), 60);
                }}
              >
                <span>Мои продукты</span>
              </button>
              <button
                type="button"
                className={cn(pillBase, getCustomizationButtonClasses(unpaidChipCustom.dimmedDisabled))}
                disabled={unpaidChipCustom.dimmedDisabled}
                onClick={() => {
                  if (unpaidChipCustom.useMock) {
                    setToast("Счета на оплату (мок из кастомизации).");
                    return;
                  }
                  window.setTimeout(() => send("Счета на оплату"), 60);
                }}
              >
                <span>Счета на оплату</span>
                {unpaidInvoicesCount > 0 ? (
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#2D2D2D] px-1.5 text-[11px] font-bold text-white dark:bg-slate-200 dark:text-slate-900">
                    {unpaidInvoicesCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

        </>
      ) : null}

      <div className="space-y-3">
        {process.env.NODE_ENV === "development" && sessionDisabledProviders.length > 0 ? (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardContent className="space-y-1.5 pb-3 pt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                Dev: отключены live-провайдеры (текущая сессия)
              </div>
              <button
                type="button"
                className="inline-flex rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100 dark:hover:bg-amber-900/40"
                onClick={resetDisabledProviders}
              >
                Сбросить отключения
              </button>
              {sessionDisabledProviders.map((p) => (
                <div key={`disabled-provider-${p}`} className="text-xs text-amber-900 dark:text-amber-100">
                  <span className="font-semibold">{liveProviderShort(p)}:</span>{" "}
                  {sessionDisabledProviderReasons[p] ?? "ошибка провайдера"}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
        {hasChat ? (
          <button
            type="button"
            aria-label="Назад"
            className="mb-3 inline-flex items-center text-sm font-semibold text-[#3C4858] transition hover:text-[#212529] dark:text-slate-200 dark:hover:text-white"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
                return;
              }
              setMessages(defaultChat);
              setInput("");
              setToast(null);
              setChipTags([...recentQueryChips]);
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-slate-700">
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </span>
          </button>
        ) : null}
        <AnimatePresence initial={false}>
          {hasChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-3"
            >
              {messages.map((m) => (
                <div key={m.id} className="space-y-2">
                  <ChatBubble
                    message={m}
                    onSuggestedClick={(s) => {
                      setInput(s);
                      window.setTimeout(() => send(s), 100);
                    }}
                  />

                  {m.role === "ai" && m.widget === "weekly-stats" ? (
                    <WeeklyStatsWidget
                      variant="weekly-stats"
                      onAskInChat={(question) => {
                        setInput(question);
                        window.setTimeout(() => send(question), 80);
                      }}
                    />
                  ) : null}
                  {m.role === "ai" && m.widget === "weekly-stats-expanded" ? (
                    <WeeklyStatsWidget
                      variant="weekly-stats-expanded"
                      onAskInChat={(question) => {
                        setInput(question);
                        window.setTimeout(() => send(question), 80);
                      }}
                    />
                  ) : null}
                  {m.role === "ai" && m.widget === "invoices-march" ? <InvoicesMarchWidget /> : null}
                  {m.role === "ai" && m.widget === "invoices-month" ? (
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="space-y-2 pb-3 pt-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Счета за {m.invoiceMonth}
                        </div>
                        {runtimeInvoices
                          .filter((inv) => inv.periodLabel.includes(m.invoiceMonth ?? ""))
                          .map((inv) => (
                            <button
                              key={inv.id}
                              type="button"
                              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-left transition hover:bg-slate-50 active:scale-[0.99] dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                              onClick={() => router.push(`/invoices/${inv.id}/?from=assistant`)}
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-200">
                                {inv.amountRub.toLocaleString("ru-RU")} ₽
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {inv.status === "paid" ? "Оплачен" : inv.status === "pay" ? "Не оплачен" : "В оплате"}
                              </span>
                            </button>
                          ))}
                        {(m.invoiceMonth === "февраль" || m.invoiceMonth === "март") ? (
                          <p className="pt-1 text-xs text-slate-600 dark:text-slate-300">
                            Разница (февраль vs март):{" "}
                            {(
                              runtimeInvoices
                                .filter((inv) => inv.periodLabel.includes("март"))
                                .reduce((sum, inv) => sum + inv.amountRub, 0) -
                              runtimeInvoices
                                .filter((inv) => inv.periodLabel.includes("февраль"))
                                .reduce((sum, inv) => sum + inv.amountRub, 0)
                            ).toLocaleString("ru-RU")}{" "}
                            ₽
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ) : null}
                  {m.role === "ai" && m.widget === "invoices-unpaid-inline" ? (
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="space-y-2 pb-3 pt-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Неоплаченные счета
                        </div>
                        {runtimeInvoices
                          .filter((inv) => inv.status === "pay")
                          .map((inv) => (
                            <button
                              key={inv.id}
                              type="button"
                              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-left dark:border-slate-600 dark:bg-slate-800"
                              onClick={() => router.push(`/invoices/${inv.id}/`)}
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-200">
                                {inv.amountRub.toLocaleString("ru-RU")} ₽
                              </span>
                              <span className="text-xs text-rose-700 dark:text-rose-300">Не оплачен</span>
                            </button>
                          ))}
                      </CardContent>
                    </Card>
                  ) : null}
                  {m.role === "ai" && m.widget === "invoices-summary-inline" ? (
                    <InvoicesSummaryInlineWidget invoices={runtimeInvoices} />
                  ) : null}
                  {m.role === "ai" && m.widget === "missed-calls-inline" ? (
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="space-y-2 pb-3 pt-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Пропущенные в чате
                        </div>
                        {primaryMissedCall ? (
                          <button
                            key={primaryMissedCall.id}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-left dark:border-slate-600 dark:bg-slate-800"
                            onClick={() => router.push(`/call/${primaryMissedCall.id}/`)}
                          >
                            <span className="text-sm text-slate-800 dark:text-slate-200">
                              {primaryMissedCall.title ?? primaryMissedCall.phone}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{primaryMissedCall.time}</span>
                          </button>
                        ) : (
                          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Пропущенных звонков не найдено.
                          </div>
                        )}
                        {otherMissedCalls.length > 0 ? (
                          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                            Ещё пропущенных: {otherMissedCalls.length}.{" "}
                            {otherMissedCalls.map((c) => c.title ?? c.phone).join(", ")}.
                          </div>
                        ) : null}
                        {otherMissedCalls
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-left dark:border-slate-600 dark:bg-slate-800"
                              onClick={() => router.push(`/call/${c.id}/`)}
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-200">{c.title ?? c.phone}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{c.time}</span>
                            </button>
                          ))}
                      </CardContent>
                    </Card>
                  ) : null}
                  {m.role === "ai" && m.widget === "appeals-summary" ? (
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="space-y-3 pb-3 pt-3">
                        <Button
                          type="button"
                          className="w-full rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                          onClick={() => router.push("/appeals/")}
                        >
                          Создать обращение
                        </Button>
                        <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Активные обращения</div>
                          <div className="mt-2 space-y-2">
                            {chatAppeals.map((appeal) => (
                              <button
                                key={appeal.id}
                                type="button"
                                className="flex w-full items-center justify-between gap-2 text-left"
                                onClick={() => router.push("/appeals/")}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm text-slate-900 dark:text-slate-100">{appeal.title}</div>
                                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {appeal.category} — от {appeal.dateLabel}
                                  </div>
                                </div>
                                <span
                                  className={cn(
                                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                    appeal.badgeLabel.includes("работе") &&
                                      "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
                                    appeal.badgeLabel.includes("подпис") &&
                                      "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                                  )}
                                >
                                  {appeal.badgeLabel}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
                            onClick={() => router.push("/appeals/")}
                          >
                            Все обращения
                          </button>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          Для поиска конкретного обращения укажите: дату создания, номер договора или контекст обращения.
                        </p>
                        <Card className="border-slate-200 dark:border-slate-700">
                          <CardContent className="divide-y divide-slate-100 p-0 dark:divide-slate-700">
                            {[
                              { label: "Создать обращение", onClick: () => router.push("/appeals/") },
                              { label: "Список обращений", onClick: () => router.push("/appeals/") },
                              { label: "Выполненные", onClick: () => router.push("/appeals/") },
                              { label: "Отклонённые", onClick: () => router.push("/appeals/") }
                            ].map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100"
                                onClick={item.onClick}
                              >
                                {item.label}
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </button>
                            ))}
                          </CardContent>
                        </Card>
                        <div className="sr-only">
                          В работе: {inWorkAppealsCount}, ожидает подписания: {signPendingAppealsCount}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {m.role === "ai" && m.widget === "subscription-balance-inline" ? (
                    <SubscriptionBalanceInlineWidget onToast={setToast} />
                  ) : null}
                  {m.role === "ai" && m.widget === "my-numbers-inline" ? <MyNumbersInlineWidget onToast={setToast} /> : null}

                  {m.role === "ai" && m.actions?.length
                    ? m.actions.map((a, idx) => (
                        <ActionCard
                          key={`${m.id}-${idx}`}
                          title={a.title}
                          subtitle={a.subtitle}
                          ctaLabel={a.ctaLabel}
                          onCta={() => {
                            if (a.intent === "start-campaign")
                              setToast("Рассылка: черновик создан, отправка поставлена в очередь.");
                            else if (a.intent === "pay-balance") setToast("Платеж: черновик пополнения подготовлен.");
                            else if (a.intent === "generate-report") setToast("Отчет: черновик сформирован.");
                            else setToast("Действие выполнено (демо).");
                          }}
                        />
                      ))
                    : null}
                </div>
              ))}
              <div ref={chatEndRef} className="h-[112px]" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {!hasChat && chipTags.length > 0 ? (
        <div className="fixed bottom-[104px] left-0 right-0 z-30 mx-auto w-full max-w-[430px]">
          <div className="safe-px">
            <div className="flex flex-wrap gap-1.5">
              {chipTags.map((label) => (
                <div
                  key={label}
                  className="inline-flex items-center overflow-hidden rounded-full border border-[#E8EAED] bg-white text-[11px] font-medium leading-none text-[#3C4858] shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  <button
                    type="button"
                    className="px-2.5 py-1 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => {
                      setInput(label);
                      window.setTimeout(() => send(label), 50);
                    }}
                  >
                    {label}
                  </button>
                  <button
                    type="button"
                    className="border-l border-[#E8EAED] px-1.5 py-1 text-[#C7C7CC] hover:bg-slate-100 hover:text-slate-600 dark:border-slate-600 dark:hover:bg-slate-700"
                    aria-label="Убрать"
                    onClick={() => setChipTags((t) => t.filter((x) => x !== label))}
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {aiReplyPending ? (
        <div
          className="fixed bottom-[max(72px,env(safe-area-inset-bottom))] left-0 right-0 z-[60] mx-auto w-full max-w-[430px]"
          data-testid="assistant-reply-pending"
          role="status"
          aria-live="polite"
        >
          <div className="safe-px">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8EAED] bg-white px-3 py-2.5 shadow-md dark:border-slate-600 dark:bg-slate-800">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#343A4A] dark:text-slate-100">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-dark" aria-hidden />
                <span>Готовим ответ…</span>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 active:scale-[0.99] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                data-testid="assistant-cancel-reply"
                onClick={cancelPendingReply}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomInputBar
        placement="fixedBottom"
        variant="assistant"
        value={input}
        onChange={setInput}
        onSend={(t) => send(t)}
        onOpenHistory={() => setOpenHistory(true)}
        inputDataTestId="assistant-chat-input"
        sendButtonDataTestId="assistant-send-button"
      />

      {toast ? (
        <div className="fixed bottom-[120px] left-0 right-0 z-40 mx-auto w-full max-w-[430px]">
          <div className="safe-px">
            <Card className="border-[#E8EAED] dark:border-slate-600">
              <CardContent className="pb-3 pt-3">
                <div className="text-sm text-[#212529] dark:text-slate-100">{toast}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <Modal open={openHistory} onClose={() => setOpenHistory(false)} title="История запросов">
        <div className="space-y-2">
          <div className="pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Быстрые запросы
          </div>
          <div className="flex flex-wrap gap-2 pb-1">
            {recentHistoryQuickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="rounded-full border border-[#E8EAED] bg-white px-3 py-1.5 text-xs font-medium text-[#3C4858] shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => {
                  setOpenHistory(false);
                  setInput(prompt);
                  window.setTimeout(() => send(prompt), 60);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Сохраненные сессии
          </div>
          {chatHistoryPresets.map((h) => (
            <button
              key={h.id}
              type="button"
              className="w-full rounded-[18px] border border-[#E8EAED] bg-white p-3 text-left shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              onClick={() => {
                setMessages(h.messages);
                setOpenHistory(false);
                setToast(`Загружено: «${h.title}».`);
              }}
            >
              <div className="text-sm font-semibold text-[#212529] dark:text-slate-100">{h.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-[#8E8E93]">{h.preview}</div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
